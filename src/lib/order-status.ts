import { OrderStatus, PaymentStatus } from "@/types";

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

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
