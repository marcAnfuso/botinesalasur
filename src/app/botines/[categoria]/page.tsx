import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts, categories } from "@/lib/supabase-data";
import { CATEGORIAS_TEXTO } from "@/lib/categorias-texto";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";
import CatalogoClient from "@/app/catalogo/CatalogoClient";

// Las categorías tienen URL propia y texto propio: son la página que rankea
// para "botines futsal", "botines sintético", etc.
export const revalidate = 300;

export function generateStaticParams() {
  return categories.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const t = CATEGORIAS_TEXTO[params.categoria];
  if (!t) return { title: "Categoría no encontrada" };
  const promesa = CUOTAS_SIN_INTERES > 0 ? ` · ${CUOTAS_SIN_INTERES} cuotas sin interés` : "";
  return {
    title: `${t.titulo} · Envíos a todo el país${promesa}`,
    description: t.descripcion,
    alternates: { canonical: `/botines/${params.categoria}` },
    openGraph: { title: `${t.titulo} | Botinesala Sur`, description: t.descripcion },
  };
}

export default async function CategoriaPage({ params }: { params: { categoria: string } }) {
  const t = CATEGORIAS_TEXTO[params.categoria];
  if (!t || !categories.some((c) => c.slug === params.categoria)) notFound();

  const products = await getProducts();
  const brands = Array.from(new Set(products.map((p) => p.brand)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));

  return (
    <CatalogoClient
      products={products}
      categories={categories}
      brands={brands}
      inicial={{ categoria: params.categoria, q: "", marca: "" }}
      titulo={t.titulo}
      intro={t.intro}
    />
  );
}
