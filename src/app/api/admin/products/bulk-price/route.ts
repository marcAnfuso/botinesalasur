import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  BulkPriceMode,
  BULK_PRICE_MODES,
  calcularPrecio,
} from "@/lib/bulk-price";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, mode, value, round } = body as {
      ids: string[];
      mode: BulkPriceMode;
      value: number;
      round?: boolean;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No hay productos seleccionados" },
        { status: 400 }
      );
    }

    if (!BULK_PRICE_MODES.includes(mode)) {
      return NextResponse.json(
        { error: `Tipo de cambio inválido: ${mode}` },
        { status: 400 }
      );
    }

    const valor = Number(value);
    if (!Number.isFinite(valor)) {
      return NextResponse.json(
        { error: "El valor tiene que ser un número" },
        { status: 400 }
      );
    }

    if (mode === "fixed" && valor < 0) {
      return NextResponse.json(
        { error: "El precio no puede ser negativo" },
        { status: 400 }
      );
    }

    if (mode === "percent" && valor <= -100) {
      return NextResponse.json(
        { error: "Una baja de 100% o más dejaría los precios en cero" },
        { status: 400 }
      );
    }

    // Se leen los precios actuales para calcular sobre ellos.
    const { data: productos, error: errorLectura } = await supabaseAdmin
      .from("products")
      .select("id, price")
      .in("id", ids);

    if (errorLectura || !productos) {
      console.error("Error reading products for bulk price:", errorLectura);
      return NextResponse.json(
        { error: "No se pudieron leer los productos" },
        { status: 500 }
      );
    }

    if (productos.length === 0) {
      return NextResponse.json(
        { error: "Los productos seleccionados ya no existen" },
        { status: 404 }
      );
    }

    // Supabase no tiene update masivo con valor por fila: van uno por uno,
    // y se informa cuántos fallaron en lugar de abortar todo el lote.
    const fallidos: string[] = [];
    let actualizados = 0;

    for (const p of productos) {
      const nuevo = calcularPrecio(p.price, mode, valor, Boolean(round));
      if (nuevo === p.price) {
        actualizados++;
        continue;
      }
      const { error } = await supabaseAdmin
        .from("products")
        .update({ price: nuevo, updated_at: new Date().toISOString() })
        .eq("id", p.id);

      if (error) {
        console.error("Error updating price for", p.id, error);
        fallidos.push(p.id);
      } else {
        actualizados++;
      }
    }

    return NextResponse.json({
      success: fallidos.length === 0,
      actualizados,
      fallidos: fallidos.length,
      noEncontrados: ids.length - productos.length,
    });
  } catch (error) {
    console.error("Error in bulk price update:", error);
    return NextResponse.json(
      { error: "Error al actualizar los precios" },
      { status: 500 }
    );
  }
}
