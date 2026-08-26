"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/supabase-data";
import { formatOrderDate } from "@/lib/order-status";
import { getSessionId } from "@/lib/events";
import { OrderStatus, PaymentStatus, OrderChannel } from "@/types";

const WHATSAPP = "https://wa.me/message/CJPQFIY4XTSJC1";

interface Pedido {
  ref: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  channel: OrderChannel;
  paidAt: string | null;
  customerName: string;
  shipping: { address: string; city: string; province: string; postalCode: string };
  items: { name: string; size: string; quantity: number; unitPrice: number; totalPrice: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

// Qué le decimos al cliente según dónde está el pedido. Una sola frase,
// en su idioma, y qué puede hacer si algo no cierra.
function explicar(p: Pedido): { titulo: string; texto: string; tono: "ok" | "espera" | "mal" } {
  if (p.status === "cancelled" || p.paymentStatus === "failed") {
    return {
      tono: "mal",
      titulo: "Este pedido no se completó",
      texto: "El pago no se concretó o el pedido fue cancelado. Si creés que es un error, escribinos y lo vemos.",
    };
  }
  if (p.status === "delivered") {
    return { tono: "ok", titulo: "Entregado", texto: "Ya lo tenés. Gracias por comprar en Botinesala Sur." };
  }
  if (p.status === "shipped") {
    return {
      tono: "ok",
      titulo: "Ya salió",
      texto: "Tu pedido está en camino. Te contactamos por WhatsApp para coordinar la entrega.",
    };
  }
  if (p.paymentStatus === "paid") {
    return {
      tono: "ok",
      titulo: "Pago recibido, lo estamos preparando",
      texto: "En cuanto salga te avisamos por WhatsApp para coordinar la entrega.",
    };
  }
  if (p.channel === "whatsapp") {
    return {
      tono: "espera",
      titulo: "Pedido anotado, falta coordinar el pago",
      texto: "Lo cerramos por WhatsApp. Si todavía no hablamos, escribinos con la referencia de arriba.",
    };
  }
  return {
    tono: "espera",
    titulo: "Todavía no nos figura el pago",
    texto:
      "Si pagaste en efectivo por Rapipago o Pago Fácil, puede tardar hasta 3 días hábiles en acreditarse. Si pagaste con tarjeta y ya pasó un rato, escribinos.",
  };
}

const TONO = {
  ok: "border-field/40 bg-field/10",
  espera: "border-yellow-500/40 bg-yellow-500/10",
  mal: "border-red-500/40 bg-red-500/10",
};

export default function MiPedidoClient({ refInicial }: { refInicial: string }) {
  const [ref, setRef] = useState(refInicial.toUpperCase());
  const [email, setEmail] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true);
    setError("");
    setPedido(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, email, sessionId: getSessionId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No pudimos consultar el pedido. Probá de nuevo.");
        return;
      }
      setPedido(data.pedido);
    } catch {
      setError("No pudimos conectar. Revisá tu conexión y probá de nuevo.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
      <h1 className="display text-4xl md:text-5xl text-white">Mi pedido</h1>
      <p className="mt-3 text-gray-400 max-w-prose">
        Escribí la referencia que te dimos al comprar y el mail que usaste, y te
        mostramos en qué está.
      </p>

      <form
        onSubmit={buscar}
        className="mt-8 border border-dark-line bg-dark-card p-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div>
          <label htmlFor="ref" className="block text-sm text-gray-400 mb-1.5">
            Referencia
          </label>
          <input
            id="ref"
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            placeholder="BOTS-20260826-AB12CD"
            autoComplete="off"
            spellCheck={false}
            required
            className="input-field tnum uppercase"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-gray-400 mb-1.5">
            Mail con el que compraste
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@ejemplo.com"
            autoComplete="email"
            required
            className="input-field"
          />
        </div>
        <button type="submit" disabled={buscando} className="btn-primary sm:mb-0">
          {buscando ? "Buscando..." : "Ver pedido"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {pedido && (() => {
        const ex = explicar(pedido);
        return (
          <section className="mt-8 animate-fadeIn" aria-live="polite">
            <div className={`border p-5 ${TONO[ex.tono]}`}>
              <p className="label text-gray-400">
                Pedido <span className="text-white tnum">{pedido.ref}</span> ·{" "}
                {formatOrderDate(pedido.createdAt)}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{ex.titulo}</h2>
              <p className="mt-1.5 text-sm text-gray-300">{ex.texto}</p>
              {ex.tono !== "ok" && (
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-white underline underline-offset-4 decoration-white/40 hover:decoration-white"
                >
                  Escribinos por WhatsApp
                </a>
              )}
            </div>

            <div className="mt-4 border border-dark-line bg-dark-card">
              <div className="px-5 py-3 border-b border-dark-line">
                <h3 className="font-semibold text-white">Lo que compraste</h3>
              </div>
              <ul className="divide-y divide-dark-line">
                {pedido.items.map((it, i) => (
                  <li key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-white">{it.name}</p>
                      <p className="text-sm text-gray-400">
                        Talle {it.size} · {it.quantity} × {formatPrice(it.unitPrice)}
                      </p>
                    </div>
                    <p className="tnum text-white shrink-0">{formatPrice(it.totalPrice)}</p>
                  </li>
                ))}
              </ul>
              <dl className="px-5 py-4 border-t border-dark-line space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-400">
                  <dt>Subtotal</dt>
                  <dd className="tnum text-gray-300">{formatPrice(pedido.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-gray-400">
                  <dt>Envío</dt>
                  <dd className="tnum text-gray-300">
                    {pedido.shippingCost === 0 ? "Sin cargo" : formatPrice(pedido.shippingCost)}
                  </dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-dark-line">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="tnum font-bold text-white text-lg">{formatPrice(pedido.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 border border-dark-line bg-dark-card px-5 py-4">
              <h3 className="font-semibold text-white">Lo mandamos a</h3>
              <address className="not-italic mt-1.5 text-sm text-gray-300">
                {pedido.customerName}
                <br />
                {pedido.shipping.address}
                <br />
                {pedido.shipping.city}, {pedido.shipping.province} — CP {pedido.shipping.postalCode}
              </address>
              <p className="mt-3 text-xs text-gray-500">
                ¿Hay algo mal en la dirección? Escribinos por WhatsApp antes de que salga.
              </p>
            </div>
          </section>
        );
      })()}

      <p className="mt-10 text-sm text-gray-500">
        ¿No encontrás la referencia? Está en el mail de confirmación y en la
        pantalla que viste al terminar la compra. Si no la tenés,{" "}
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light">
          escribinos
        </a>{" "}
        y lo buscamos con tu nombre.
      </p>

      <p className="mt-4 text-sm">
        <Link href="/catalogo" className="text-gray-400 hover:text-white transition-colors">
          ← Volver al catálogo
        </Link>
      </p>
    </div>
  );
}
