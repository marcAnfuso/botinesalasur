import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/supabase-data";
import { enOferta, descuentoOferta } from "@/lib/ofertas";
import CintaOfertas from "@/components/ofertas/CintaOfertas";
import OfertaCardB from "@/components/ofertas/OfertaCardB";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";

// Se arma sola: entra todo botín con precio tachado mayor al precio a pagar
// y con algún talle en stock. Alan lo maneja desde el panel. El "hasta −X%"
// y el sticker de cada tarjeta se calculan con esos dos precios.
export const revalidate = 300;

const promesa = CUOTAS_SIN_INTERES > 0 ? ` · ${CUOTAS_SIN_INTERES} cuotas sin interés` : "";

export const metadata: Metadata = {
  title: `Ofertas en botines de fútsal, sintético y fútbol 11${promesa}`,
  description: "Botines con descuento en Botinesala Sur. Pocos pares por modelo: envíos a todo el país y showroom en Llavallol, Zona Sur.",
  alternates: { canonical: "/ofertas" },
  openGraph: { title: "Ofertas | Botinesala Sur", description: "Botines con descuento. Pocos pares por modelo." },
};

export default async function OfertasPage() {
  const ofertas = (await getProducts())
    .filter((p) => enOferta(p) && p.variants.some((v) => v.stock > 0))
    .sort((a, b) => descuentoOferta(b) - descuentoOferta(a));

  if (ofertas.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="display text-5xl text-white">Ofertas</h1>
        <p className="text-gray-400 mt-4">
          Ahora no hay botines en oferta. Las renovamos seguido: mientras tanto, mirá todo lo que hay.
        </p>
        <Link href="/catalogo" className="btn-primary mt-8 inline-flex">Ver catálogo</Link>
      </div>
    );
  }

  const maximo = descuentoOferta(ofertas[0]);
  const [top, ...resto] = ofertas;

  return (
    <div className="overflow-x-clip">
      {/* Encabezado: el número grande es el descuento máximo real */}
      <section className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="display text-4xl md:text-5xl text-white">Ofertas</h1>
          <span className="sticker-oferta bg-primary text-white display-tight text-sm md:text-base px-2.5 py-1 border border-black">
            Hasta −{maximo}%
          </span>
        </div>
        <p className="text-gray-400 mt-3">Hasta agotar stock. Pocos pares por modelo.</p>
      </section>

      <CintaOfertas maximo={maximo} cantidad={ofertas.length} />

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <OfertaCardB product={top} grande />
      </section>

      {resto.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <h2 className="display text-3xl md:text-4xl text-white mb-2">Más rebajas</h2>
          <div className="rule-chalk mb-8" />
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {resto.map((p) => (
              <OfertaCardB key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
