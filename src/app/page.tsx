import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getProducts } from "@/lib/supabase-data";
import { Product } from "@/types";

export const revalidate = 60;

const WHATSAPP = "https://wa.me/message/CJPQFIY4XTSJC1";

// Las tres formas de jugar, que es como el jugador realmente elige.
const CANCHAS = [
  {
    slug: "futsal",
    nombre: "Fútsal",
    bajada: "Para jugar rápido y dominar la cancha.",
  },
  {
    slug: "sintetico",
    nombre: "Sintético",
    bajada: "Agarre y confort en cada partido.",
  },
  {
    slug: "futbol11",
    nombre: "Fútbol 11",
    bajada: "Rendimiento y potencia en cada jugada.",
  },
];

function imagenDeCategoria(products: Product[], slug: string) {
  const conStock = products.find(
    (p) => p.category === slug && p.variants.some((v) => v.stock > 0)
  );
  return (conStock ?? products.find((p) => p.category === slug))?.imageUrl;
}

export default async function HomePage() {
  const [featuredProducts, products] = await Promise.all([
    getFeaturedProducts(),
    getProducts(),
  ]);

  const destacados = (featuredProducts.length ? featuredProducts : products).slice(0, 4);

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden border-b border-dark-line">
        <div className="absolute inset-0 bg-pitch" aria-hidden />

        {/* La foto sangra por el borde derecho y se funde con el negro */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[58%] lg:w-[52%]">
          <Image
            src="/images/hero-botin.jpg"
            alt="Botín apoyado sobre una pelota en el showroom"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover object-[70%_center]"
          />
          {/* En móvil la foto queda debajo del texto: pesa más el contraste */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-dark via-dark/95 to-dark/70 md:via-dark/55 md:to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dark to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="max-w-xl lg:max-w-2xl py-20 md:py-24 lg:py-28">
            <h1 className="display text-[clamp(2.5rem,5.6vw,4.25rem)] text-white animate-rise-in">
              Botines para
              <br />
              <span className="text-primary">
                fútsal, sintético
                <br />y fútbol 11
              </span>
            </h1>

            <p
              className="mt-6 max-w-md text-base md:text-lg text-gray-300 leading-relaxed animate-rise-in"
              style={{ animationDelay: "90ms" }}
            >
              Encontrá tu par en tu talle, con precios que se pueden comparar.
              Te lo mandamos a cualquier punto del país o lo retirás en el
              showroom de Llavallol.
            </p>

            <ul
              className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 animate-rise-in"
              style={{ animationDelay: "150ms" }}
            >
              {[
                {
                  texto: "Showroom en Llavallol",
                  d: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z",
                },
                {
                  texto: "Envíos a todo el país",
                  d: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
                },
                {
                  texto: "Atención por WhatsApp",
                  d: "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.269Z",
                },
              ].map((item) => (
                <li key={item.texto} className="flex items-center gap-2.5">
                  <svg
                    className="w-5 h-5 text-primary shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.d}
                    />
                  </svg>
                  <span className="text-sm text-gray-300">{item.texto}</span>
                </li>
              ))}
            </ul>

            <div
              className="mt-10 flex flex-wrap gap-3 animate-rise-in"
              style={{ animationDelay: "210ms" }}
            >
              <Link href="/catalogo" className="btn-primary">
                Ver catálogo
                <span aria-hidden>→</span>
              </Link>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Escribinos
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── Elegí dónde jugás ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="flex items-end justify-between gap-6 mb-8">
          <h2 className="display text-4xl md:text-5xl text-white">
            Elegí dónde <span className="text-primary">jugás</span>
          </h2>
          <Link
            href="/catalogo"
            className="hidden sm:inline text-sm text-gray-400 hover:text-primary transition-colors whitespace-nowrap"
          >
            Ver todo el catálogo →
          </Link>
        </div>
        <div className="rule-chalk mb-10" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CANCHAS.map((cancha) => {
            const img = imagenDeCategoria(products, cancha.slug);
            return (
              <Link
                key={cancha.slug}
                href={`/catalogo?categoria=${cancha.slug}`}
                className="group relative overflow-hidden border border-dark-line focus:outline-none focus-visible:border-primary"
              >
                <div className="relative h-60 md:h-72 bg-dark-lighter overflow-hidden">
                  {img && (
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    />
                  )}
                  {/* El texto se apoya sobre negro sólido abajo; arriba la foto
                      queda limpia. Sin esto el nombre pelea con la imagen. */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-dark via-dark/75 via-45% to-transparent"
                    aria-hidden
                  />

                  <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="display text-3xl md:text-4xl text-white">
                        {cancha.nombre}
                      </h3>
                      <p className="mt-1.5 text-sm text-gray-300 max-w-[26ch]">
                        {cancha.bajada}
                      </p>
                    </div>
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full border border-chalk/40 text-white transition-colors group-hover:bg-primary group-hover:border-primary"
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/catalogo" className="btn-secondary w-full">
            Ver todo el catálogo
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ───────────────────────── Destacados ───────────────────────── */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-24">
          <div className="flex items-end justify-between gap-6 mb-8">
            <h2 className="display text-4xl md:text-5xl text-white">
              Destacados
            </h2>
            <Link
              href="/catalogo"
              className="text-sm text-primary hover:text-primary-light transition-colors whitespace-nowrap"
            >
              Ver todos →
            </Link>
          </div>
          <div className="rule-chalk mb-10" />

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {destacados.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────── Por qué comprarnos ───────────────────── */}
      <section className="border-y border-dark-line bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-dark-line">
            {[
              {
                titulo: "Atención por WhatsApp",
                texto: "Respondemos rápido y te ayudamos a elegir el talle.",
                d: "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.269Z",
              },
              {
                titulo: "Showroom en Llavallol",
                texto: "Probátelos, elegí y llevate el par en el momento.",
                d: "M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.615m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z",
              },
              {
                titulo: "Envíos a todo el país",
                texto: "Por moto en GBA Sur y por correo al resto.",
                d: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
              },
              {
                titulo: "Compra protegida",
                texto: "Pagás con MercadoPago, con todas las tarjetas.",
                d: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
              },
            ].map((item) => (
              <li key={item.titulo} className="flex gap-4 lg:px-6 lg:first:pl-0">
                <svg
                  className="w-7 h-7 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.d}
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-white leading-tight">
                    {item.titulo}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-400 leading-snug">
                    {item.texto}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
