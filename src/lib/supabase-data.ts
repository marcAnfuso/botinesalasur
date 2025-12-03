import { supabase, supabaseAdmin } from "./supabase";
import { Product, ProductVariant, Category } from "@/types";

// Categorías (estáticas por ahora)
export const categories: Category[] = [
  { id: "1", name: "Fútsal", slug: "futsal", description: "Botines para fútsal / indoor" },
  { id: "2", name: "Sintético", slug: "sintetico", description: "Botines para césped sintético" },
  { id: "3", name: "Fútbol 11", slug: "futbol11", description: "Botines para césped natural" },
  { id: "4", name: "Accesorios", slug: "accesorios", description: "Medias, canilleras y más" },
];

export const brands = ["Nike", "Adidas", "Puma"];

// Transformar datos de Supabase al formato de la app
function transformProduct(
  dbProduct: any,
  variants: any[]
): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    brand: dbProduct.brand,
    description: dbProduct.description,
    price: dbProduct.price,
    category: dbProduct.category,
    imageUrl: dbProduct.image_url,
    images: dbProduct.images || undefined,
    featured: dbProduct.featured,
    active: dbProduct.active,
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      stock: v.stock,
    })),
    createdAt: dbProduct.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
  };
}

// Obtener todos los productos activos
export async function getProducts(): Promise<Product[]> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (productsError || !products) {
    console.error("Error fetching products:", productsError);
    return [];
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*");

  // Agrupar variantes por producto
  const variantsByProduct = (variants || []).reduce((acc: Record<string, any[]>, v: any) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(v);
    return acc;
  }, {});

  return products.map((p: any) => transformProduct(p, variantsByProduct[p.id] || []));
}

// Obtener productos por categoría
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (productsError || !products) {
    console.error("Error fetching products by category:", productsError);
    return [];
  }

  const productIds = products.map((p: any) => p.id);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds);

  const variantsByProduct = (variants || []).reduce((acc: Record<string, any[]>, v: any) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(v);
    return acc;
  }, {});

  return products.map((p: any) => transformProduct(p, variantsByProduct[p.id] || []));
}

// Obtener productos destacados
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .eq("active", true)
    .limit(5);

  if (productsError || !products) {
    console.error("Error fetching featured products:", productsError);
    return [];
  }

  const productIds = products.map((p: any) => p.id);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds);

  const variantsByProduct = (variants || []).reduce((acc: Record<string, any[]>, v: any) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(v);
    return acc;
  }, {});

  return products.map((p: any) => transformProduct(p, variantsByProduct[p.id] || []));
}

// Obtener un producto por ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError) {
    console.error("Error fetching product:", productError);
    return null;
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id);

  return transformProduct(product, variants || []);
}

// Formatear precio
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

// ============================================
// FUNCIONES DE ADMIN (requieren autenticación)
// ============================================

// Actualizar stock de una variante
export async function updateVariantStock(
  variantId: string,
  newStock: number
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("product_variants")
    .update({ stock: newStock })
    .eq("id", variantId);

  if (error) {
    console.error("Error updating stock:", error);
    return false;
  }
  return true;
}

// Actualizar precio de un producto
export async function updateProductPrice(
  productId: string,
  newPrice: number
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("products")
    .update({ price: newPrice })
    .eq("id", productId);

  if (error) {
    console.error("Error updating price:", error);
    return false;
  }
  return true;
}

// Actualizar producto completo
export async function updateProduct(
  productId: string,
  updates: {
    name?: string;
    brand?: string;
    description?: string;
    price?: number;
    category?: string;
    image_url?: string;
    featured?: boolean;
    active?: boolean;
  }
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("products")
    .update(updates)
    .eq("id", productId);

  if (error) {
    console.error("Error updating product:", error);
    return false;
  }
  return true;
}

// Agregar nueva variante a un producto
export async function addVariant(
  productId: string,
  size: string,
  stock: number
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("product_variants")
    .insert({ product_id: productId, size, stock });

  if (error) {
    console.error("Error adding variant:", error);
    return false;
  }
  return true;
}

// Eliminar variante
export async function deleteVariant(variantId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) {
    console.error("Error deleting variant:", error);
    return false;
  }
  return true;
}

// Obtener todos los productos (incluyendo inactivos) para admin
export async function getAllProductsAdmin(): Promise<Product[]> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (productsError || !products) {
    console.error("Error fetching all products:", productsError);
    return [];
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*");

  const variantsByProduct = (variants || []).reduce((acc: Record<string, any[]>, v: any) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(v);
    return acc;
  }, {});

  return products.map((p: any) => transformProduct(p, variantsByProduct[p.id] || []));
}
