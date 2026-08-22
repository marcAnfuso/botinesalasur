import { supabase, supabaseAdmin } from "./supabase";
import {
  Product,
  ProductVariant,
  Category,
  AdminOrder,
  OrderStatus,
} from "@/types";

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
    // Un producto sin foto no puede romper el render: <Image src=""> lanza.
    imageUrl: dbProduct.image_url || "/images/sin-foto.png",
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

// ===== Pedidos (panel admin) =====

// Mapea una fila de orders (snake_case) al tipo AdminOrder de la app.
// Tolera bases sin la migración de MercadoPago aplicada: en ese caso
// external_reference / payment_status / paid_at vienen undefined.
function transformOrder(row: any): AdminOrder {
  const items = (row.order_items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    variantId: item.variant_id,
    productName: item.product_name,
    productBrand: item.product_brand || "",
    size: item.size || item.variant_size || "",
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price ?? item.unit_price * item.quantity,
  }));

  return {
    id: row.id,
    externalReference: row.external_reference ?? null,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: row.shipping_address,
      city: row.shipping_city,
      province: row.shipping_province,
      postalCode: row.shipping_postal_code,
      shippingZone: row.shipping_zone,
      notes: row.notes || undefined,
    },
    items,
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    total: row.total,
    status: row.status,
    paymentStatus: row.payment_status ?? "pending",
    mpPaymentId: row.mp_payment_id ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
  };
}

// Listado de pedidos, más nuevos primero
export async function getOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data.map(transformOrder);
}

// Un pedido con sus items
export async function getOrderById(id: string): Promise<AdminOrder | null> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching order:", error);
    return null;
  }

  return transformOrder(data);
}

// Cambiar el estado de preparación/envío de un pedido.
// No toca payment_status: eso lo maneja el webhook de MercadoPago.
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating order status:", error);
    return false;
  }
  return true;
}
