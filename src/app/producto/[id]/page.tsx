import { notFound } from "next/navigation";
import { getProductById, getProductsByCategory } from "@/lib/supabase-data";
import ProductoClient from "./ProductoClient";

// Revalidar cada 60 segundos
export const revalidate = 60;

interface ProductoPageProps {
  params: { id: string };
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Productos relacionados (misma categoría)
  const categoryProducts = await getProductsByCategory(product.category);
  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id && p.active)
    .slice(0, 4);

  return <ProductoClient product={product} relatedProducts={relatedProducts} />;
}
