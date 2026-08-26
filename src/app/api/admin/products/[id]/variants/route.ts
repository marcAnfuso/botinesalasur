import { NextRequest, NextResponse } from "next/server";
import { revalidarTienda } from "@/lib/revalidar";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Obtener variantes de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: variants, error } = await supabaseAdmin
    .from("product_variants")
    .select("*")
    .eq("product_id", params.id)
    .order("size", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidarTienda();

  return NextResponse.json(variants);
}

// POST - Agregar nueva variante
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { size, stock } = body;

    if (!size || size.trim() === "") {
      return NextResponse.json(
        { error: "El talle es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe esa variante
    const { data: existing } = await supabaseAdmin
      .from("product_variants")
      .select("id")
      .eq("product_id", params.id)
      .eq("size", size.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una variante con ese talle" },
        { status: 400 }
      );
    }

    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .insert({
        product_id: params.id,
        size: size.trim(),
        stock: Number(stock) || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidarTienda();

    return NextResponse.json({ success: true, variant }, { status: 201 });
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar múltiples variantes (batch update de stock)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { variants } = body;

    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: "Se requiere un array de variantes" },
        { status: 400 }
      );
    }

    // Actualizar cada variante
    const results = await Promise.all(
      variants.map(async (v: { id: string; stock: number }) => {
        const { error } = await supabaseAdmin
          .from("product_variants")
          .update({ stock: Number(v.stock) })
          .eq("id", v.id)
          .eq("product_id", params.id); // Seguridad: verificar que pertenece al producto

        return { id: v.id, success: !error, error: error?.message };
      })
    );

    const hasErrors = results.some((r) => !r.success);
    if (hasErrors) {
      revalidarTienda();
      return NextResponse.json({ success: false, results }, { status: 207 });
    }

    revalidarTienda();

    return NextResponse.json({ success: true, message: "Stock actualizado" });
  } catch (error) {
    console.error("Error updating variants:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
