import { getAllProductsAdmin, categories } from "@/lib/supabase-data";
import ProductosAdminClient from "./ProductosAdminClient";

// Revalidar cada 30 segundos para admin
export const revalidate = 30;

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return <ProductosAdminClient products={products} categories={categories} />;
}
