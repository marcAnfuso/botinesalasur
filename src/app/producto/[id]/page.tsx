import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { nombreProducto } from "@/lib/nombre-producto";
import { descripcionProducto, jsonLdProducto, nombreCategoria, urlAbsoluta } from "@/lib/seo";
import { getProductById, getProductByCodigo, getProductsByCategory } from "@/lib/supabase-data";
import { urlProducto, leerParamProducto } from "@/lib/producto-url";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";
import { getShippingZones } from "@/lib/shipping";
import ProductoClient from "./ProductoClient";

// Revalidar cada 60 segundos
export const revalidate = 60;

interface ProductoPageProps {
  params: { id: string };
}

// La URL puede traer el id viejo (uuid) o el slug con el código al final.
async function resolver(param: string) {
  const lectura = leerParamProducto(param);
  if (!lectura) return null;
  return "id" in lectura ? getProductById(lectura.id) : getProductByCodigo(lectura.codigo);
}

// Título y vista previa propios de cada botín: es lo que Google indexa y lo
// que WhatsApp muestra al compartir el link.
export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const product = await resolver(params.id);
  if (!product) return { title: "Producto no encontrado" };
  const nombre = nombreProducto(product.brand, product.name);
  const titulo = `${nombre} · Botines de ${nombreCategoria(product.category).toLowerCase()}${CUOTAS_SIN_INTERES > 0 ? ` · ${CUOTAS_SIN_INTERES} cuotas sin interés` : ""}`;
  const descripcion = descripcionProducto(product);
  const imagen = urlAbsoluta(product.imageUrl);
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: urlProducto(product) },
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
  const product = await resolver(params.id);

  if (!product) {
    notFound();
  }

  // Una sola URL por producto: el id viejo y los slugs desactualizados
  // mandan a la canónica (301), que es la que Google tiene que indexar.
  const canonica = urlProducto(product);
  if (`/producto/${params.id}` !== canonica) {
    permanentRedirect(canonica);
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
