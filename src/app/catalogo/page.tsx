import { Suspense } from "react";
import { getProducts, categories, brands } from "@/lib/supabase-data";
import CatalogoClient from "./CatalogoClient";

// Revalidar cada 60 segundos
export const revalidate = 60;

async function CatalogoContent() {
  const products = await getProducts();

  return (
    <CatalogoClient
      products={products}
      categories={categories}
      brands={brands}
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
          <div key={i} className="bg-dark-card rounded-xl overflow-hidden">
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

export default function CatalogoPage() {
  return (
    <Suspense fallback={<CatalogoLoading />}>
      <CatalogoContent />
    </Suspense>
  );
}
