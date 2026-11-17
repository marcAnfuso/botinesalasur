import { metaEvent } from "./meta";

// Registro de actividad de compra — parte compartida (nombres y cliente).
// El lado servidor vive en events-server.ts para no arrastrar la service
// role key al navegador.

export const EVENT_NAMES = [
  // navegador
  "product_view",
  "cart_add",
  "cart_remove",
  "cart_update",
  "cart_clear",
  "checkout_view",
  "checkout_submit",
  "checkout_error",
  "checkout_redirect",
  "whatsapp_open",
  "result_view",
  // servidor
  "preference_created",
  "preference_failed",
  "whatsapp_order_created",
  "whatsapp_order_failed",
  "webhook_received",
  "webhook_rejected",
  "webhook_ignored",
  "order_deleted",
  "price_mismatch",
  "webhook_order_not_found",
  "webhook_payment",
  "payment_verified",
  "order_lookup",
  "meta_capi_sent",
  "meta_capi_error",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

// Cómo se lee cada evento en el panel
export const EVENT_LABELS: Record<EventName, string> = {
  product_view: "Vio un producto",
  cart_add: "Agregó al carrito",
  cart_remove: "Sacó del carrito",
  cart_update: "Cambió cantidad",
  cart_clear: "Vació el carrito",
  checkout_view: "Entró al checkout",
  checkout_submit: "Tocó comprar",
  checkout_error: "Error al comprar",
  checkout_redirect: "Fue a MercadoPago",
  whatsapp_open: "Abrió WhatsApp",
  result_view: "Volvió del pago",
  preference_created: "Pedido creado",
  preference_failed: "Falló crear el pedido",
  whatsapp_order_created: "Pedido por WhatsApp creado",
  whatsapp_order_failed: "Falló el pedido por WhatsApp",
  webhook_received: "Aviso de MercadoPago",
  webhook_rejected: "Aviso rechazado",
  webhook_ignored: "Aviso de MP ignorado (no es de pago)",
  price_mismatch: "Total manipulado o desactualizado",
  order_deleted: "Pedido cancelado borrado desde el panel",
  webhook_order_not_found: "Aviso sin pedido",
  webhook_payment: "Estado de pago",
  payment_verified: "Pago verificado",
  order_lookup: "El cliente consultó su pedido",
  meta_capi_sent: "Venta informada a Meta",
  meta_capi_error: "No se pudo informar a Meta",
};

export const EVENTOS_DE_ERROR: EventName[] = [
  "checkout_error",
  "preference_failed",
  "whatsapp_order_failed",
  "webhook_rejected",
  "price_mismatch",
  "webhook_order_not_found",
  "meta_capi_error",
];

const SESSION_KEY = "bas-session";

// Identificador anónimo del navegador. No identifica a la persona: sólo
// permite ver los pasos de una misma visita uno detrás del otro.
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

// Los pasos que también le interesan a Meta Ads, con su nombre estándar
function alPixel(event: EventName, d: Record<string, unknown>): void {
  const id = typeof d.productId === "string" ? [d.productId] : undefined;
  const precio = typeof d.price === "number" ? d.price : undefined;
  if (event === "product_view")
    metaEvent("ViewContent", { content_ids: id, content_type: "product", content_name: d.name, value: precio, currency: "ARS" });
  else if (event === "cart_add")
    metaEvent("AddToCart", { content_ids: id, content_type: "product", content_name: d.name, value: precio, currency: "ARS" });
  else if (event === "checkout_view")
    metaEvent("InitiateCheckout", { num_items: d.items, value: d.subtotal, currency: "ARS" });
}

// Manda un evento desde el navegador. Nunca falla ni bloquea: si el envío no
// sale, la compra sigue igual.
export function track(
  event: EventName,
  details: Record<string, unknown> = {},
  ref?: string | null
): void {
  if (typeof window === "undefined") return;
  alPixel(event, details);

  const body = JSON.stringify({
    event,
    details,
    ref: ref ?? null,
    sessionId: getSessionId(),
    path: window.location.pathname,
  });

  try {
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        "/api/events",
        new Blob([body], { type: "application/json" })
      );
      if (ok) return;
    }
  } catch {
    // cae al fetch
  }

  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
