"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AdminOrder, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/supabase-data";
import { formatCodigo } from "@/lib/codigo";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  ORDER_STATUS_FLOW,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  CHANNEL_LABELS,
  formatOrderDate,
} from "@/lib/order-status";
import { EVENT_LABELS, EVENTOS_DE_ERROR, EventName } from "@/lib/events";

interface Evento {
  id: number;
  createdAt: string;
  event: EventName;
  source: "client" | "server";
  details: Record<string, unknown> | null;
}

interface PedidoDrawerProps {
  order: AdminOrder;
  posicion: { indice: number; total: number };
  actualizando: boolean;
  onClose: () => void;
  onAnterior: (() => void) | null;
  onSiguiente: (() => void) | null;
  onCambiarEstado: (status: OrderStatus) => void;
}

// Panel lateral con el detalle de un pedido. Se abre encima del listado sin
// taparlo del todo: los filtros y los demás pedidos siguen ahí atrás, y se
// pasa de uno a otro sin cerrar.
export default function PedidoDrawer({
  order,
  posicion,
  actualizando,
  onClose,
  onAnterior,
  onSiguiente,
  onCambiarEstado,
}: PedidoDrawerProps) {
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [eventos, setEventos] = useState<Evento[] | null>(null);

  // Foco al abrir, scroll del fondo bloqueado, Esc y flechas
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Las flechas sólo si el foco no está en un control del panel
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && onAnterior) onAnterior();
      if (e.key === "ArrowRight" && onSiguiente) onSiguiente();
    };
    window.addEventListener("keydown", teclas);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", teclas);
      anterior?.focus?.();
    };
  }, [onClose, onAnterior, onSiguiente]);

  // Al cambiar de pedido, el panel vuelve arriba y recarga su actividad
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
    setEventos(null);
    let vivo = true;
    fetch(`/api/admin/orders/${order.id}/events`)
      .then((r) => (r.ok ? r.json() : { eventos: [] }))
      .then((d) => vivo && setEventos(d.eventos ?? []))
      .catch(() => vivo && setEventos([]));
    return () => {
      vivo = false;
    };
  }, [order.id]);

  const c = order.customer;
  const wa = c.phone.replace(/\D/g, "");
  const zona = c.shippingZone === "gba-sur" ? "GBA Sur" : "Todo el país";

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={`Pedido ${order.externalReference ?? ""}`}>
      {/* fondo: cierra al tocar */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-dark/70 backdrop-blur-[2px] cursor-default"
      />

      <div
        ref={panelRef}
        className="absolute inset-y-0 right-0 w-full sm:w-[520px] lg:w-[600px] bg-dark-lighter border-l border-dark-line shadow-lift overflow-y-auto animate-slide-in"
      >
        {/* cabecera fija */}
        <div className="sticky top-0 z-10 bg-dark-lighter/95 backdrop-blur-md border-b border-dark-line px-5 py-3 flex items-center gap-3">
          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white tnum truncate">
              {order.externalReference || order.id.slice(0, 8)}
            </p>
            <p className="text-xs text-gray-500">{formatOrderDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onAnterior ?? undefined}
              disabled={!onAnterior}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              aria-label="Pedido anterior"
              title="Anterior (←)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 tnum">
              {posicion.indice + 1}/{posicion.total}
            </span>
            <button
              type="button"
              onClick={onSiguiente ?? undefined}
              disabled={!onSiguiente}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              aria-label="Pedido siguiente"
              title="Siguiente (→)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`p-5 space-y-5 transition-opacity ${actualizando ? "opacity-60" : ""}`}>
          {/* estado */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_STATUS_CLASSES[order.paymentStatus]}`}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${ORDER_STATUS_CLASSES[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="text-xs text-gray-500">· {CHANNEL_LABELS[order.channel]}</span>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="estado-drawer" className="text-xs text-gray-400">
                Cambiar a
              </label>
              <select
                id="estado-drawer"
                value={order.status}
                disabled={actualizando}
                onChange={(e) => onCambiarEstado(e.target.value as OrderStatus)}
                className="bg-dark border border-dark-line rounded px-2.5 py-1.5 text-sm text-white focus:border-primary focus:outline-none disabled:opacity-50"
              >
                {ORDER_STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* productos */}
          <section className="border border-dark-line bg-dark-card">
            <h2 className="px-4 py-2.5 border-b border-dark-line text-sm font-semibold text-white">
              Productos
            </h2>
            {order.items.length === 0 ? (
              <p className="px-4 py-3 text-sm text-yellow-500">Este pedido no tiene items cargados.</p>
            ) : (
              <ul className="divide-y divide-dark-line">
                {order.items.map((it) => (
                  <li key={it.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium">
                        {[it.productBrand, it.productName].filter(Boolean).join(" ")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {it.productCode && (
                          <span className="tnum text-primary mr-2">{formatCodigo(it.productCode)}</span>
                        )}
                        Talle <span className="text-white">{it.size}</span> · {it.quantity} × {formatPrice(it.unitPrice)}
                      </p>
                    </div>
                    <p className="tnum text-white text-sm shrink-0">{formatPrice(it.totalPrice)}</p>
                  </li>
                ))}
              </ul>
            )}
            <dl className="px-4 py-3 border-t border-dark-line text-sm space-y-1">
              <div className="flex justify-between text-gray-400"><dt>Subtotal</dt><dd className="tnum">{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between text-gray-400"><dt>Envío ({zona})</dt><dd className="tnum">{formatPrice(order.shippingCost)}</dd></div>
              <div className="flex justify-between font-semibold text-white pt-1 border-t border-dark-line"><dt>Total</dt><dd className="tnum">{formatPrice(order.total)}</dd></div>
            </dl>
          </section>

          {/* cliente y envío */}
          <div className="grid sm:grid-cols-2 gap-3">
            <section className="border border-dark-line bg-dark-card p-4">
              <h2 className="text-sm font-semibold text-white mb-2">Cliente</h2>
              <p className="text-sm text-white">{c.name}</p>
              <p className="text-sm">
                <a href={`mailto:${c.email}`} className="text-gray-300 hover:text-primary break-all">{c.email}</a>
              </p>
              <p className="text-sm">
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-field">
                  {c.phone}
                </a>
              </p>
            </section>
            <section className="border border-dark-line bg-dark-card p-4">
              <h2 className="text-sm font-semibold text-white mb-2">Envío · {zona}</h2>
              <address className="not-italic text-sm text-gray-300 leading-relaxed">
                {c.address}<br />{c.city}, {c.province}<br />CP {c.postalCode}
              </address>
            </section>
          </div>

          {c.notes && (
            <section className="border border-yellow-500/30 bg-yellow-500/10 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-yellow-500 mb-1">Nota del cliente</h2>
              <p className="text-sm text-white whitespace-pre-wrap">{c.notes}</p>
            </section>
          )}

          {/* pago */}
          <section className="border border-dark-line bg-dark-card p-4">
            <h2 className="text-sm font-semibold text-white mb-2">Pago</h2>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Estado</dt><dd className="text-white">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Referencia</dt><dd className="text-white tnum">{order.externalReference ?? "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-gray-500">ID MercadoPago</dt><dd className="text-white tnum break-all text-right">{order.mpPaymentId ?? "—"}</dd></div>
              {order.paidAt && (
                <div className="flex justify-between gap-3"><dt className="text-gray-500">Pagado</dt><dd className="text-white">{formatOrderDate(order.paidAt)}</dd></div>
              )}
            </dl>
            {order.channel === "whatsapp" && (
              <p className="mt-2 text-xs text-gray-400">Se coordina por chat. Cuando cobres, marcá el pedido como confirmado.</p>
            )}
          </section>

          {/* actividad */}
          <section className="border border-dark-line bg-dark-card">
            <h2 className="px-4 py-2.5 border-b border-dark-line text-sm font-semibold text-white">
              Actividad
            </h2>
            {eventos === null ? (
              <p className="px-4 py-3 text-xs text-gray-500">Cargando…</p>
            ) : eventos.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-500">Sin actividad registrada para este pedido.</p>
            ) : (
              <ol className="divide-y divide-dark-line max-h-72 overflow-y-auto">
                {eventos.map((ev) => (
                  <li key={ev.id} className="px-4 py-2 flex gap-3 text-xs">
                    <span className="text-gray-500 tnum shrink-0 w-[4.5rem]">{formatOrderDate(ev.createdAt).slice(-8)}</span>
                    <span className={EVENTOS_DE_ERROR.includes(ev.event) ? "text-red-400" : "text-gray-300"}>
                      {EVENT_LABELS[ev.event] ?? ev.event}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <p className="text-xs text-gray-500 pb-2">
            <Link href={`/admin/pedidos/${order.id}`} className="hover:text-white transition-colors">
              Abrir en página completa →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
