import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PUT - Actualizar una variante específica (stock)
export async function PUT(
  request: NextRequest,
  { params }: { params: { variantId: string } }
) {
  try {
    const body = await request.json();
    const { stock, size } = body;

    const updates: Record<string, any> = {};
    if (stock !== undefined) updates.stock = Number(stock);
    if (size !== undefined) updates.size = size;

    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .update(updates)
      .eq("id", params.variantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, variant });
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar una variante
export async function DELETE(
  request: NextRequest,
  { params }: { params: { variantId: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("id", params.variantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Variante eliminada" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
