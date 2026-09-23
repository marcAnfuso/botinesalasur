import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getProducts } from "@/lib/supabase-data";
import { TIENDA } from "@/lib/tienda";

export const revalidate = 300;

const TITULO = "Botines en Zona Sur: Lomas de Zamora, Llavallol y GBA Sur";
const DESCRIPCION =
  "Botines de fútsal, sintético y fútbol 11 en Zona Sur. Showroom en Llavallol (Lomas de Zamora), moto en el día a Temperley, Banfield, Adrogué y Lanús, y envíos a todo el país. 3 cuotas sin interés.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/botines-zona-sur" },
  openGraph: { title: `${TITULO} | Botinesala Sur`, description: DESCRIPCION },
};

// Las preguntas que la gente de la zona hace por WhatsApp, respondidas acá:
// son también las búsquedas locales que queremos ganar.
const PREGUNTAS = [
  {
    q: "¿Dónde puedo probarme botines en Lomas de Zamora?",
    a: `En nuestro showroom de ${TIENDA.localidad}. Escribinos por WhatsApp, coordinamos día y hora, y venís a probarte el par con asesoramiento de talle.`,
  },
  {
    q: "¿Hacen envíos en el día en Zona Sur?",
    a: `Sí, en moto a ${TIENDA.localidadesMoto.slice(0, -1).join(", ")} y ${TIENDA.localidadesMoto.at(-1)}. Lo coordinamos por WhatsApp al confirmar el pedido.`,
  },
  {
    q: "¿Qué botines tienen para fútsal, sintético y fútbol 11?",
    a: "Nike, Adidas, Joma, Umbro y más, con stock real por talle. Cada producto dice para qué superficie es y qué talles quedan.",
  },
  {
    q: "¿Cómo se paga?",
    a: "MercadoPago con 3 cuotas sin interés, o transferencia y efectivo con precio especial. El envío se coordina por WhatsApp.",
  },
];

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map((p) => ({
    "@type": "Question",
    name: p.q,
    acceptedAnswer: { "@type": "Answer", text: p.a },
  })),
};

export default async function BotinesZonaSurPage() {
  const [destacados, todos] = await Promise.all([getFeaturedProducts(), getProducts()]);
  const muestra = (destacados.length >= 4 ? destacados : todos).slice(0, 8);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <section className="relative overflow-hidden border-b border-dark-line bg-pitch">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
          <p className="label text-primary">{TIENDA.localidad} · {TIENDA.partido} · {TIENDA.zona}</p>
          <h1 className="display text-[clamp(2.4rem,5.5vw,4.25rem)] text-white mt-3 max-w-4xl">
            Botines en <span className="text-primary">Zona Sur</span>
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-2xl leading-relaxed">
            Botines de fútsal, sintético y fútbol 11 en Lomas de Zamora, con showroom en{" "}
            {TIENDA.localidad} para venir a probarte el par y moto en el día a todo el sur del GBA.
            Si estás más lejos, enviamos a todo el país.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/catalogo" className="btn-primary">Ver el catálogo →</Link>
            <a href={TIENDA.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Coordinar visita al showroom
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid gap-10 lg:grid-cols-3">
        <div className="border border-dark-line bg-dark-card p-6">
          <h2 className="display text-2xl text-white">Showroom en {TIENDA.localidad}</h2>
          <p className="mt-3 text-gray-300 leading-relaxed">
            {TIENDA.direccion
              ? `${TIENDA.direccion}, ${TIENDA.localidad}, ${TIENDA.partido}.`
              : `En ${TIENDA.localidad}, ${TIENDA.partido}. La dirección exacta te la pasamos por WhatsApp al coordinar.`}{" "}
            Venís, te probás, elegís con asesoramiento de talle y te lo llevás.
          </p>
          <a href={TIENDA.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-primary hover:underline underline-offset-4">
            Coordinar por WhatsApp →
          </a>
        </div>
        <div className="border border-dark-line bg-dark-card p-6">
          <h2 className="display text-2xl text-white">Moto en el día</h2>
          <p className="mt-3 text-gray-300 leading-relaxed">
            Comprás en la web, lo coordinamos por WhatsApp y te llega el mismo día en{" "}
            {TIENDA.localidadesMoto.slice(0, -1).join(", ")} y {TIENDA.localidadesMoto.at(-1)}.
          </p>
        </div>
        <div className="border border-dark-line bg-dark-card p-6">
          <h2 className="display text-2xl text-white">Al resto del país</h2>
          <p className="mt-3 text-gray-300 leading-relaxed">
            Por Vía Cargo o Correo Argentino, con seguimiento. Pagás en 3 cuotas sin interés con
            MercadoPago o con precio especial por transferencia.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-14 md:pb-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="display text-3xl md:text-4xl text-white">Lo que más sale en la zona</h2>
          <Link href="/catalogo" className="text-sm text-gray-400 hover:text-primary transition-colors whitespace-nowrap">
            Ver todo el catálogo →
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {muestra.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-t border-dark-line bg-dark-lighter">
        <div className="max-w-3xl mx-auto px-4 py-14 md:py-20">
          <h2 className="display text-3xl md:text-4xl text-white mb-8">Preguntas de la zona</h2>
          <dl className="divide-y divide-dark-line">
            {PREGUNTAS.map((p) => (
              <div key={p.q} className="py-5">
                <dt className="font-semibold text-white">{p.q}</dt>
                <dd className="mt-2 text-gray-300 leading-relaxed">{p.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-gray-500">
            Más de {TIENDA.instagramSeguidores.toLocaleString("es-AR")} personas nos siguen en{" "}
            <a href={TIENDA.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary">
              Instagram @botinesalasur
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
