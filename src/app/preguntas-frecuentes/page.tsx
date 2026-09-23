import type { Metadata } from "next";
import Link from "next/link";
import { TIENDA } from "@/lib/tienda";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Talles, superficies, envíos, cambios, formas de pago y showroom: las dudas que nos hacen por WhatsApp antes de comprar botines, respondidas.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

const PREGUNTAS: { q: string; a: string }[] = [
  {
    q: "¿Qué botín va para cada cancha?",
    a: "Fútsal: suela lisa, para parquet y cemento. Sintético: tapones cortos de goma, para césped sintético (fútbol 5 y 7 al aire libre). Fútbol 11: tapones altos, para césped natural. Usar uno de fútbol 11 en sintético castiga la rodilla; uno de fútsal en sintético patina.",
  },
  {
    q: "¿Cómo sé mi talle?",
    a: "Medí la plantilla de un calzado que te quede bien, de punta a talón, en centímetros, y compará con la guía de talles que está en cada producto. Algunos modelos (Umbro, Joma) vienen con medio punto. Si dudás entre dos, escribinos antes de comprar.",
  },
  {
    q: "¿Tienen local para probarse?",
    a: `Sí, showroom en ${TIENDA.localidad}, ${TIENDA.partido}. Es con cita: coordinás por WhatsApp y te atendemos con el par en mano.`,
  },
  {
    q: "¿Cuánto tarda el envío?",
    a: "En Zona Sur, moto en el día. Al interior, sale dentro de las 48 h hábiles de confirmado el pago y llega en 3 a 7 días hábiles según la provincia, con seguimiento.",
  },
  {
    q: "¿Cuánto cuesta el envío?",
    a: "No se cobra en la web: al confirmar el pedido te decimos por WhatsApp el costo exacto para tu dirección (moto, Vía Cargo o Correo Argentino) y lo arreglamos ahí. El retiro en el showroom es sin cargo.",
  },
  {
    q: "¿Puedo cambiar el talle?",
    a: "Sí: dentro de los 7 días de recibido, sin uso y en su caja, por otro talle del mismo modelo. En Zona Sur lo retiramos y traemos el nuevo; al interior, el envío de vuelta corre por tu cuenta y el del par nuevo por la nuestra.",
  },
  {
    q: "¿Cómo pago?",
    a: `MercadoPago (tarjeta${CUOTAS_SIN_INTERES > 0 ? ` en ${CUOTAS_SIN_INTERES} cuotas sin interés` : ""}, débito, dinero en cuenta, Rapipago y Pago Fácil) o transferencia y efectivo con precio especial.`,
  },
  {
    q: "¿Cómo veo en qué está mi pedido?",
    a: "En Mi pedido, con el número de pedido que te llega por mail y tu dirección de correo. Y siempre por WhatsApp.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map((p) => ({
    "@type": "Question",
    name: p.q,
    acceptedAnswer: { "@type": "Answer", text: p.a },
  })),
};

export default function PreguntasFrecuentesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="display text-4xl md:text-5xl text-white">Preguntas frecuentes</h1>
      <p className="mt-4 text-gray-400 max-w-prose">Lo que nos preguntan por WhatsApp antes de comprar.</p>
      <dl className="mt-10 divide-y divide-dark-line">
        {PREGUNTAS.map((p) => (
          <div key={p.q} className="py-5">
            <dt className="font-semibold text-white">{p.q}</dt>
            <dd className="mt-2 text-gray-300 leading-relaxed">{p.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-sm text-gray-500">
        ¿Otra duda?{" "}
        <a href={TIENDA.whatsapp} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
          Escribinos por WhatsApp
        </a>
        {" · "}
        <Link href="/envios-y-cambios" className="text-primary hover:underline underline-offset-4">
          Envíos, cambios y pagos
        </Link>
      </p>
    </div>
  );
}
