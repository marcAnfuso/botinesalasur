import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts, categories } from "@/lib/supabase-data";
import { nombreCategoria } from "@/lib/seo";
import CatalogoClient from "./CatalogoClient";

// Se dibuja en el servidor por pedido, con los filtros de la URL: así el HTML
// que recibe Google trae el título y los links a cada producto (antes el
// grillado aparecía recién en el navegador).
export const dynamic = "force-dynamic";

type Filtros = { categoria?: string; q?: string };

export async function generateMetadata({ searchParams }: { searchParams: Filtros }): Promise<Metadata> {
  const cat = searchParams.categoria ? nombreCategoria(searchParams.categoria) : null;
  const titulo = cat ? `Botines de ${cat}` : "Catálogo de botines";
  const descripcion = cat
    ? `Botines de ${cat.toLowerCase()} en stock, con talles y precios. Envíos a todo el país y showroom en Llavallol.`
    : "Todos los botines de fútsal, sintético y fútbol 11 en stock, con talles y precios. Envíos a todo el país y showroom en Llavallol.";
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: searchParams.categoria ? `/catalogo?categoria=${searchParams.categoria}` : "/catalogo" },
    openGraph: { title: `${titulo} | Botinesala Sur`, description: descripcion },
  };
}

async function CatalogoContent({ filtros }: { filtros: Filtros }) {
  const products = await getProducts();

  // El filtro muestra las marcas que de verdad tienen productos cargados,
  // no la lista de opciones del admin.
  const brands = Array.from(new Set(products.map((p) => p.brand)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));

  return (
    <CatalogoClient
      products={products}
      categories={categories}
      brands={brands}
      inicial={{ categoria: filtros.categoria ?? "", q: filtros.q ?? "" }}
    />
  );
}

function CatalogoLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-48 bg-dark-card rounded animate-shimmer mb-2" />
        <div className="h-5 w-32 bg-dark-card rounded animate-shimmer" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-dark-card rounded-none overflow-hidden">
            <div className="aspect-square bg-dark-lighter animate-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-16 bg-dark-lighter rounded animate-shimmer" />
              <div className="h-5 w-32 bg-dark-lighter rounded animate-shimmer" />
              <div className="h-4 w-full bg-dark-lighter rounded animate-shimmer" />
              <div className="h-6 w-24 bg-dark-lighter rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CatalogoPage({ searchParams }: { searchParams: Filtros }) {
  return (
    <Suspense fallback={<CatalogoLoading />}>
      <CatalogoContent filtros={searchParams} />
    </Suspense>
  );
}
