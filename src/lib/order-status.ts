import { OrderStatus, PaymentStatus, OrderChannel } from "@/types";

// Etiquetas y colores de los estados, compartidos entre el listado y el detalle.

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-gray-700/60 text-gray-300",
  confirmed: "bg-field/15 text-field",
  processing: "bg-blue-500/15 text-blue-400",
  shipped: "bg-indigo-500/15 text-indigo-400",
  delivered: "bg-field/20 text-field",
  cancelled: "bg-red-500/15 text-red-400",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pago pendiente",
  paid: "Pagado",
  failed: "Pago rechazado",
  refunded: "Reembolsado",
};

export const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-500",
  paid: "bg-field/15 text-field",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-orange-500/15 text-orange-400",
};

// Orden en que se ofrecen los cambios de estado en el panel
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Zona horaria fija y reloj de 24 h: así el servidor y el navegador escriben
// exactamente lo mismo y React no ve diferencias al hidratar.
export function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("day")}/${g("month")}/${g("year")} ${g("hour")}:${g("minute")}`;
}

export const CHANNEL_LABELS: Record<OrderChannel, string> = {
  mercadopago: "MercadoPago",
  whatsapp: "WhatsApp",
};

// El canal se marca sólo cuando es WhatsApp: MercadoPago es el caso corriente
// y no necesita ocupar espacio en cada fila.
export const CHANNEL_CLASSES: Record<OrderChannel, string> = {
  mercadopago: "bg-gray-700/50 text-gray-300",
  whatsapp: "bg-field/15 text-field",
};
