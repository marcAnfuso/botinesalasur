import { NextRequest, NextResponse } from "next/server";
import { revalidarTienda } from "@/lib/revalidar";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Obtener todos los productos (para admin)
export async function GET() {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: variants } = await supabaseAdmin
    .from("product_variants")
    .select("*");

  // Combinar productos con variantes
  const productsWithVariants = products?.map((product: any) => ({
    ...product,
    variants: (variants || []).filter((v: any) => v.product_id === product.id),
  }));

  revalidarTienda();

  return NextResponse.json(productsWithVariants);
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brand, description, price, category, image_url, featured, active, variants } = body;

    // Validación básica
    if (!name || !brand || !price || !category) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: name, brand, price, category" },
        { status: 400 }
      );
    }

    // Crear producto
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        brand,
        description: description || "",
        price: Number(price),
        category,
        image_url: image_url || "/products/default.jpg",
        featured: featured || false,
        active: active !== false,
      })
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Crear variantes si existen
    if (variants && variants.length > 0) {
      const variantsToInsert = variants
        .filter((v: any) => v.size && v.size.trim() !== "")
        .map((v: any) => ({
          product_id: product.id,
          size: v.size.trim(),
          stock: Number(v.stock) || 0,
        }));

      if (variantsToInsert.length > 0) {
        const { error: variantsError } = await supabaseAdmin
          .from("product_variants")
          .insert(variantsToInsert);

        if (variantsError) {
          console.error("Error creating variants:", variantsError);
        }
      }
    }

    revalidarTienda();

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
