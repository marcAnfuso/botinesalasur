import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, categories } from "@/lib/supabase-data";
import { enOferta, descuentoOferta } from "@/lib/ofertas";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";
import CatalogoClient from "@/app/catalogo/CatalogoClient";

// Se arma sola: entra todo botín con "precio antes" mayor al actual y con
// algún talle en stock. Alan lo maneja desde el panel, producto por producto.
export const revalidate = 300;

const promesa = CUOTAS_SIN_INTERES > 0 ? ` · ${CUOTAS_SIN_INTERES} cuotas sin interés` : "";

export const metadata: Metadata = {
  title: `Ofertas en botines de fútsal, sintético y fútbol 11${promesa}`,
  description: "Botines con descuento en Botinesala Sur. Pocos pares por modelo: envíos a todo el país y showroom en Llavallol, Zona Sur.",
  alternates: { canonical: "/ofertas" },
  openGraph: { title: "Ofertas | Botinesala Sur", description: "Botines con descuento. Pocos pares por modelo." },
};

export default async function OfertasPage() {
  const todos = await getProducts();
  const products = todos
    .filter((p) => enOferta(p) && p.variants.some((v) => v.stock > 0))
    .sort((a, b) => descuentoOferta(b) - descuentoOferta(a));

  if (products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="display text-4xl md:text-5xl text-white">Ofertas</h1>
        <p className="text-gray-400 mt-4">
          Ahora no hay botines en oferta. Las renovamos seguido: mientras tanto, mirá todo lo que hay.
        </p>
        <Link href="/catalogo" className="btn-primary mt-8 inline-flex">Ver catálogo</Link>
      </div>
    );
  }

  const brands = Array.from(new Set(products.map((p) => p.brand)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));

  return (
    <CatalogoClient
      products={products}
      categories={categories}
      brands={brands}
      inicial={{ categoria: "", q: "", marca: "" }}
      titulo="Ofertas"
      intro={`Botines con descuento, hasta agotar stock. El precio tachado es el de antes; se cobra el de abajo${CUOTAS_SIN_INTERES > 0 ? `, también en ${CUOTAS_SIN_INTERES} cuotas sin interés` : ""}.`}
    />
  );
}
