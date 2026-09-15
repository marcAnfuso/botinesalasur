import { NextRequest, NextResponse } from "next/server";
import { revalidarTienda } from "@/lib/revalidar";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Obtener un producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const { data: variants } = await supabaseAdmin
    .from("product_variants")
    .select("*")
    .eq("product_id", params.id);

  revalidarTienda();

  return NextResponse.json({ ...product, variants: variants || [] });
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, brand, description, price, transfer_price, category, image_url, featured, active } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (brand !== undefined) updates.brand = brand;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (transfer_price !== undefined)
      updates.transfer_price = transfer_price ? Number(transfer_price) : null;
    if (category !== undefined) updates.category = category;
    if (image_url !== undefined) updates.image_url = image_url;
    if (featured !== undefined) updates.featured = featured;
    if (active !== undefined) updates.active = active;

    let actualizado = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    // La columna llega con supabase-migration-transferencia.sql. Hasta que
    // se corra, guardar el producto tiene que seguir funcionando.
    if (actualizado.error && /transfer_price/i.test(actualizado.error.message)) {
      const { transfer_price: _omitido, ...sinTransfer } = updates;
      actualizado = await supabaseAdmin
        .from("products")
        .update(sinTransfer)
        .eq("id", params.id)
        .select()
        .single();
    }

    const { data: product, error } = actualizado;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidarTienda();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar producto (soft delete - marcar como inactivo)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Por seguridad, hacemos soft delete (marcamos como inactivo)
    const { error } = await supabaseAdmin
      .from("products")
      .update({ active: false })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidarTienda();

    return NextResponse.json({ success: true, message: "Producto desactivado" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
