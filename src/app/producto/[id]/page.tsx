import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { nombreProducto } from "@/lib/nombre-producto";
import { descripcionProducto, jsonLdProducto, nombreCategoria, urlAbsoluta } from "@/lib/seo";
import { getProductById, getProductsByCategory } from "@/lib/supabase-data";
import { getShippingZones } from "@/lib/shipping";
import ProductoClient from "./ProductoClient";

// Revalidar cada 60 segundos
export const revalidate = 60;

interface ProductoPageProps {
  params: { id: string };
}

// Título y vista previa propios de cada botín: es lo que Google indexa y lo
// que WhatsApp muestra al compartir el link.
export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const product = await getProductById(params.id);
  if (!product) return { title: "Producto no encontrado" };
  const nombre = nombreProducto(product.brand, product.name);
  const titulo = `${nombre} · Botines de ${nombreCategoria(product.category).toLowerCase()}`;
  const descripcion = descripcionProducto(product);
  const imagen = urlAbsoluta(product.imageUrl);
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/producto/${product.id}` },
    openGraph: {
      title: `${nombre} | Botinesala Sur`,
      description: descripcion,
      type: "website",
      images: [{ url: imagen, alt: nombre }],
    },
    twitter: { card: "summary_large_image", title: nombre, description: descripcion, images: [imagen] },
    robots: product.active ? undefined : { index: false },
  };
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Productos relacionados (misma categoría)
  const [categoryProducts, zonas] = await Promise.all([
    getProductsByCategory(product.category),
    getShippingZones(),
  ]);
  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id && p.active)
    .slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProducto(product)) }}
      />
      <ProductoClient
        product={product}
        relatedProducts={relatedProducts}
        zonas={zonas}
      />
    </>
  );
}
