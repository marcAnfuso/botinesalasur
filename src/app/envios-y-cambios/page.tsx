import type { Metadata } from "next";
import Link from "next/link";
import { TIENDA } from "@/lib/tienda";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";

export const metadata: Metadata = {
  title: "Envíos, cambios y formas de pago",
  description:
    "Cómo llega tu pedido (moto en el día en Zona Sur, Vía Cargo o Correo Argentino al resto del país), cómo cambiar el talle y cómo pagar en Botinesala Sur.",
  alternates: { canonical: "/envios-y-cambios" },
};

// Política escrita en lenguaje de cliente. La piden Google Merchant Center y
// cualquiera que duda antes de comprar. Los plazos de cambio los definieron
// Alan y Fede; si cambian, se cambian acá y en ningún otro lado.
export default function EnviosYCambiosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <h1 className="display text-4xl md:text-5xl text-white">Envíos, cambios y pagos</h1>
      <p className="mt-4 text-gray-400 max-w-prose">
        Todo lo que pasa después de que tocás comprar, sin letra chica.
      </p>

      <section className="mt-10">
        <h2 className="display text-2xl text-white">Cómo te llega</h2>
        <ul className="mt-4 space-y-4 text-gray-300 leading-relaxed">
          <li>
            <strong className="text-white">Retiro en el showroom de {TIENDA.localidad}</strong> ({TIENDA.partido},
            Zona Sur). Coordinamos día y hora por WhatsApp; venís, te probás y te lo llevás. Sin cargo.
          </li>
          <li>
            <strong className="text-white">Moto en el día</strong> en {TIENDA.localidadesMoto.slice(0, -1).join(", ")} y{" "}
            {TIENDA.localidadesMoto.at(-1)}. El costo depende de la distancia y te lo decimos al coordinar.
          </li>
          <li>
            <strong className="text-white">Al resto del país</strong>, por Vía Cargo o Correo Argentino, con seguimiento. Sale
            dentro de las 48 h hábiles de confirmado el pago y suele llegar en 3 a 7 días hábiles según la provincia.
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          El envío no se cobra en la web: al confirmar el pedido te escribimos por WhatsApp, te decimos el costo
          exacto para tu dirección y lo arreglamos ahí.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="display text-2xl text-white">Si el talle no te queda</h2>
        <p className="mt-4 text-gray-300 leading-relaxed">
          Lo cambiamos por otro talle del mismo modelo (o por otro modelo, pagando la diferencia si la hay).
          Escribinos por WhatsApp <strong className="text-white">dentro de los 7 días</strong> de recibido, con el
          par <strong className="text-white">sin uso y en su caja</strong>. En Zona Sur lo retiramos y traemos el
          nuevo en el mismo viaje; al interior, el costo del envío de vuelta corre por tu cuenta y el del nuevo
          par por la nuestra.
        </p>
        <p className="mt-3 text-gray-300 leading-relaxed">
          Para que no haga falta cambiar nada: mirá la{" "}
          <Link href="/catalogo" className="text-primary hover:underline underline-offset-4">
            guía de talles
          </Link>{" "}
          en cada producto (medida de plantilla en centímetros) o preguntanos antes de comprar.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="display text-2xl text-white">Cómo pagás</h2>
        <ul className="mt-4 space-y-3 text-gray-300 leading-relaxed">
          <li>
            <strong className="text-white">MercadoPago</strong>: tarjeta de crédito
            {CUOTAS_SIN_INTERES > 0 ? ` en ${CUOTAS_SIN_INTERES} cuotas sin interés` : ""}, débito, dinero en
            cuenta o efectivo en Rapipago y Pago Fácil. Pagás en la web y el pedido queda confirmado al instante.
          </li>
          <li>
            <strong className="text-white">Transferencia o efectivo</strong>, con precio especial en la mayoría de
            los modelos (lo ves en cada producto). Elegís esa opción al comprar y lo cerramos por WhatsApp.
          </li>
        </ul>
      </section>

      <section className="mt-10 border border-dark-line bg-dark-card p-6">
        <h2 className="font-semibold text-white">¿Algo no cierra?</h2>
        <p className="mt-2 text-gray-300">
          Escribinos por{" "}
          <a href={TIENDA.whatsapp} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
            WhatsApp
          </a>{" "}
          o mirá el estado de tu compra en{" "}
          <Link href="/mi-pedido" className="text-primary hover:underline underline-offset-4">
            Mi pedido
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
