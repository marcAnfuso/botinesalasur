"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { track } from "@/lib/events";
import { formatPrice } from "@/lib/supabase-data";
import { formatCodigo } from "@/lib/codigo";

const WHATSAPP = "https://wa.me/message/CJPQFIY4XTSJC1";

interface Pago {
  external_reference?: string;
  payment_id?: string;
  amount?: number;
  status?: string;
  paid_at?: string;
  customer_name?: string;
  payment_type?: string | null;
  shipping_zone_label?: string | null;
  items?: { name: string; code: number | null; size: string; quantity: number }[];
}

interface Resultado {
  verified: boolean;
  payment?: Pago;
  order?: { external_reference: string; status: string; payment_status: string };
}

const MEDIOS: Record<string, string> = {
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  prepaid_card: "Tarjeta prepaga",
  account_money: "Dinero en cuenta de MercadoPago",
  ticket: "Efectivo (Rapipago / Pago Fácil)",
  bank_transfer: "Transferencia",
};

function LoadingSpinner() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-400">Verificando tu pago...</p>
    </div>
  );
}

// ───────────── piezas compartidas por los cuatro estados ─────────────

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-pitch" aria-hidden />
      <div className="relative max-w-3xl mx-auto px-4 py-10 md:py-16">
        <div className="border border-dark-line bg-dark-card">{children}</div>
      </div>
    </div>
  );
}

function Cabecera({
  tono,
  titulo,
  acento,
  texto,
}: {
  tono: "ok" | "espera" | "mal";
  titulo: string;
  acento: string;
  texto: string;
}) {
  const color =
    tono === "ok" ? "text-field" : tono === "espera" ? "text-yellow-500" : "text-red-400";
  const fondo =
    tono === "ok"
      ? "bg-field/15 border-field/40"
      : tono === "espera"
      ? "bg-yellow-500/15 border-yellow-500/40"
      : "bg-red-500/15 border-red-500/40";
  return (
    <div className="px-6 pt-10 pb-8 text-center border-b border-dark-line">
      <div
        className={`w-16 h-16 mx-auto mb-5 rounded-full border-2 flex items-center justify-center ${fondo} ${color}`}
        aria-hidden
      >
        {tono === "ok" ? (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : tono === "espera" ? (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <h1 className="display text-4xl md:text-5xl text-white">
        {titulo} <span className={tono === "ok" ? "text-primary" : color}>{acento}</span>
      </h1>
      <p className="mt-4 text-gray-400 max-w-md mx-auto">{texto}</p>
    </div>
  );
}

function Fila({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-dark-line last:border-b-0">
      <dt className="text-sm text-gray-400 shrink-0">{etiqueta}</dt>
      <dd className="text-sm text-white text-right tnum">{children}</dd>
    </div>
  );
}

function Acciones({ referencia, reintentar }: { referencia?: string | null; reintentar?: boolean }) {
  return (
    <div className="px-6 py-6 grid gap-3 sm:grid-cols-3 border-t border-dark-line">
      {reintentar ? (
        <Link href="/checkout" className="btn-primary">
          Intentar de nuevo
        </Link>
      ) : referencia ? (
        <Link href={`/mi-pedido?ref=${referencia}`} className="btn-primary">
          Ver mi pedido
        </Link>
      ) : (
        <Link href="/catalogo" className="btn-primary">
          Ver catálogo
        </Link>
      )}
      <Link href="/catalogo" className="btn-secondary">
        Seguir comprando
      </Link>
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-secondary">
        <svg className="w-4 h-4 text-field" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
        </svg>
        Consultar por WhatsApp
      </a>
    </div>
  );
}

function Beneficios() {
  const items = [
    {
      t: "Compra segura",
      s: "Procesada por MercadoPago",
      d: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
    },
    {
      t: "Atención por WhatsApp",
      s: "Te ayudamos en todo el proceso",
      d: "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.269Z",
    },
    {
      t: "Showroom en Llavallol",
      s: "Probá y elegí con asesoramiento",
      d: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm4.5 0c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
    },
  ];
  return (
    <ul className="px-6 py-5 grid gap-4 sm:grid-cols-3 sm:divide-x divide-dark-line border-t border-dark-line">
      {items.map((b) => (
        <li key={b.t} className="flex items-start gap-3 sm:px-4 sm:first:pl-0">
          <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d={b.d} />
          </svg>
          <div>
            <p className="text-sm font-medium text-white">{b.t}</p>
            <p className="text-xs text-gray-500">{b.s}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ───────────── el contenido según cómo volvió del pago ─────────────

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const externalRef = searchParams.get("ref");
  const paymentId = searchParams.get("payment_id");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Resultado | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    async function verifyPayment() {
      if (!externalRef && !paymentId) {
        track("result_view", { status, verified: false, sinReferencia: true });
        setLoading(false);
        return;
      }
      try {
        const params = new URLSearchParams();
        if (externalRef) params.append("ref", externalRef);
        if (paymentId) params.append("payment_id", paymentId);
        const response = await fetch(`/api/mercadopago/verify-payment?${params}`);
        const data = await response.json();
        setResult(data);
        track("result_view", { status, verified: Boolean(data?.verified) }, externalRef);
        // Recién acá se vacía el carrito: el pago ya está confirmado.
        if (data?.verified) clearCart();
      } catch (error) {
        console.error("Error verifying payment:", error);
      } finally {
        setLoading(false);
      }
    }
    verifyPayment();
    // clearCart es estable entre renders del provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalRef, paymentId]);

  if (loading) return <LoadingSpinner />;

  const ref = result?.payment?.external_reference || externalRef || "";

  // ── Pago confirmado ──
  if (result?.verified && result.payment) {
    const p = result.payment;
    return (
      <Marco>
        <Cabecera
          tono="ok"
          titulo="¡Pago"
          acento="confirmado!"
          texto="Tu compra fue recibida con éxito. En breve te enviamos los detalles por email y te contactamos por WhatsApp."
        />

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 p-6">
          <section className="border border-dark-line bg-dark p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              Resumen del pedido
            </h2>
            <dl>
              <Fila etiqueta="Número de orden">{ref}</Fila>
              {p.customer_name && <Fila etiqueta="Cliente">{p.customer_name}</Fila>}
              {typeof p.amount === "number" && (
                <Fila etiqueta="Total">
                  <span className="font-semibold">{formatPrice(p.amount)}</span>
                </Fila>
              )}
              <Fila etiqueta="Estado">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-field/15 text-field text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Pago confirmado
                </span>
              </Fila>
              {p.payment_type && (
                <Fila etiqueta="Medio de pago">{MEDIOS[p.payment_type] ?? "MercadoPago"}</Fila>
              )}
              <Fila etiqueta="Entrega">
                {p.shipping_zone_label ? `${p.shipping_zone_label} · a coordinar` : "A coordinar"}
              </Fila>
            </dl>

            {p.items && p.items.length > 0 && (
              <ul className="mt-4 pt-3 border-t border-dark-line space-y-1.5">
                {p.items.map((it, i) => (
                  <li key={i} className="text-sm text-gray-300 flex justify-between gap-3">
                    <span className="min-w-0">
                      {it.name}
                      {it.code && <span className="tnum text-gray-500 ml-2">{formatCodigo(it.code)}</span>}
                    </span>
                    <span className="shrink-0 text-gray-500">
                      Talle {it.size} × {it.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-dark-line bg-dark p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white mb-4">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              ¿Qué sigue ahora?
            </h2>
            <ol className="relative space-y-5">
              {[
                ["Confirmamos tu pago", "Listo: MercadoPago ya nos avisó que se acreditó."],
                ["Preparamos tu pedido", "Separamos tu par y lo dejamos listo para salir."],
                ["Coordinamos envío o retiro", "Te escribimos por WhatsApp para acordar cómo y cuándo."],
              ].map(([t, s], i) => (
                <li key={t} className="flex gap-3">
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold tnum ${
                      i === 0 ? "bg-field text-dark" : "bg-primary text-white"
                    }`}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{t}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <Acciones referencia={ref} />
        <Beneficios />
      </Marco>
    );
  }

  // ── Volvió con éxito pero la confirmación todavía no llegó ──
  if (status === "success") {
    return (
      <Marco>
        <Cabecera
          tono="espera"
          titulo="Estamos confirmando"
          acento="tu pago"
          texto="MercadoPago nos avisó que lo completaste. En cuanto se confirme te mandamos el mail con los detalles. Suele tardar unos segundos."
        />
        <div className="px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {ref && (
            <p className="text-sm text-gray-400">
              Tu pedido: <span className="text-white tnum">{ref}</span>
            </p>
          )}
          <button onClick={() => window.location.reload()} className="btn-primary">
            Actualizar
          </button>
        </div>
        <Acciones referencia={ref} />
      </Marco>
    );
  }

  // ── Pago pendiente (efectivo) ──
  if (status === "pending") {
    return (
      <Marco>
        <Cabecera
          tono="espera"
          titulo="Pago"
          acento="pendiente"
          texto="Tu pedido está reservado. Si elegiste efectivo, completá el pago con el cupón de MercadoPago: puede tardar hasta 3 días hábiles en acreditarse. Te avisamos por mail apenas lo veamos."
        />
        {ref && (
          <p className="px-6 py-5 text-sm text-gray-400 text-center">
            Tu pedido: <span className="text-white tnum">{ref}</span>
          </p>
        )}
        <Acciones referencia={ref} />
        <Beneficios />
      </Marco>
    );
  }

  // ── Rechazado o sin datos ──
  return (
    <Marco>
      <Cabecera
        tono="mal"
        titulo="Pago no"
        acento="completado"
        texto="El pago no se concretó. No se te cobró nada: podés intentar de nuevo con otro medio, o escribirnos y lo resolvemos por WhatsApp."
      />
      {ref && (
        <p className="px-6 py-5 text-sm text-gray-400 text-center">
          Referencia: <span className="text-white tnum">{ref}</span>
        </p>
      )}
      <Acciones referencia={ref} reintentar />
    </Marco>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutResultContent />
    </Suspense>
  );
}
