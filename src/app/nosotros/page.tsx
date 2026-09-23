import type { Metadata } from "next";
import Link from "next/link";
import { TIENDA } from "@/lib/tienda";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";

export const metadata: Metadata = {
  title: "Quiénes somos: botines en Zona Sur y a todo el país",
  description:
    "Botinesala Sur es una tienda de botines de fútsal, sintético y fútbol 11 con showroom en Llavallol (Lomas de Zamora), tienda online con carrito, envíos a todo el país y atención por WhatsApp e Instagram.",
  alternates: { canonical: "/nosotros" },
};

// Los hechos del negocio, dichos derecho. Es la página que Google y los
// asistentes de IA citan cuando alguien pregunta "dónde comprar botines en
// zona sur": sin adjetivos, con cosas que se pueden comprobar.
const HECHOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Showroom en Llavallol",
    texto: `Local en ${TIENDA.localidad}, ${TIENDA.partido} (Zona Sur del GBA), con cita por WhatsApp: venís, te probás el par y te asesoramos con el talle.`,
  },
  {
    titulo: "Tienda online con stock real",
    texto: "Cada botín tiene su código, sus talles con stock al día y su precio. Se compra con carrito, se paga en la web y el pedido queda registrado con un número que podés consultar cuando quieras.",
  },
  {
    titulo: "Envíos a todo el país",
    texto: `Moto en el día en ${TIENDA.localidadesMoto.slice(0, 5).join(", ")} y alrededores; Vía Cargo o Correo Argentino al resto de Argentina, con seguimiento.`,
  },
  {
    titulo: CUOTAS_SIN_INTERES > 0 ? `${CUOTAS_SIN_INTERES} cuotas sin interés` : "Pago seguro",
    texto: `Pagás con MercadoPago${CUOTAS_SIN_INTERES > 0 ? ` en ${CUOTAS_SIN_INTERES} cuotas sin interés` : ""}, o por transferencia y efectivo con precio especial. Nunca te pedimos datos de tarjeta por fuera de MercadoPago.`,
  },
  {
    titulo: "Fútsal, sintético y fútbol 11",
    texto: "Nike, Adidas, Joma, Umbro y más. Te decimos qué suela va para cada cancha y qué talle pedir; si el talle no queda, lo cambiamos.",
  },
  {
    titulo: `Más de ${TIENDA.instagramSeguidores.toLocaleString("es-AR")} seguidores en Instagram`,
    texto: "En @botinesalasur mostramos lo que llega, lo que sale y lo que dicen los que compraron. Es donde más se nos escribe.",
  },
  {
    titulo: "Compradores que muestran su par",
    texto: "En las historias destacadas de Instagram hay decenas de clientes subiendo sus botines recién llegados. No son testimonios que escribimos nosotros: son ellos.",
  },
  {
    titulo: "Atención de personas",
    texto: "Alan y Fede atienden el WhatsApp y el Instagram. Escribís y te responde alguien que sabe de botines, no un bot.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <p className="label text-primary">Botinesala Sur</p>
      <h1 className="display text-4xl md:text-5xl text-white mt-2">Quiénes somos</h1>
      <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-prose">
        Somos una tienda de botines de fútbol de {TIENDA.localidad}, en {TIENDA.partido}, Zona Sur del Gran
        Buenos Aires. Vendemos desde {TIENDA.desde} en el showroom, por Instagram y en esta web, y mandamos
        a todo el país.
        Empezamos como muchos: jugando, comprando botines para nosotros y para amigos, y sabiendo que el
        problema nunca es el precio solo, es acertar el talle y la suela. De eso nos ocupamos.
      </p>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2">
        {HECHOS.map((h) => (
          <div key={h.titulo} className="border border-dark-line bg-dark-card p-5">
            <dt className="font-semibold text-white">{h.titulo}</dt>
            <dd className="mt-2 text-sm text-gray-300 leading-relaxed">{h.texto}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <h2 className="display text-2xl text-white">Dónde encontrarnos</h2>
        <ul className="mt-4 space-y-2 text-gray-300">
          <li>
            Instagram:{" "}
            <a href={TIENDA.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
              @botinesalasur
            </a>{" "}
            (más de {TIENDA.instagramSeguidores.toLocaleString("es-AR")} seguidores)
          </li>
          <li>
            WhatsApp:{" "}
            <a href={TIENDA.whatsapp} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
              escribinos
            </a>
          </li>
          <li>
            Showroom: {TIENDA.direccion ? `${TIENDA.direccion}, ` : ""}
            {TIENDA.localidad}, {TIENDA.partido}, {TIENDA.provincia} — con cita.
          </li>
          <li>
            Web:{" "}
            <Link href="/catalogo" className="text-primary hover:underline underline-offset-4">
              catálogo completo
            </Link>
            {" · "}
            <Link href="/envios-y-cambios" className="text-primary hover:underline underline-offset-4">
              envíos y cambios
            </Link>
            {" · "}
            <Link href="/preguntas-frecuentes" className="text-primary hover:underline underline-offset-4">
              preguntas frecuentes
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
