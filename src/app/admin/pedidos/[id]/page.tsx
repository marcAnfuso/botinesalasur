import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, formatPrice } from "@/lib/supabase-data";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  formatOrderDate,
} from "@/lib/order-status";

export const revalidate = 0;

export default async function PedidoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  const { customer } = order;
  const zoneLabel =
    customer.shippingZone === "gba-sur" ? "GBA Sur" : "Todo el país";

  const whatsappNumber = customer.phone.replace(/[^0-9]/g, "");

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-8">
        <Link
          href="/admin/pedidos"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver a pedidos
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <h1 className="text-3xl font-bold text-white">
            {order.externalReference || order.id.slice(0, 8)}
          </h1>
          <span
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              PAYMENT_STATUS_CLASSES[order.paymentStatus]
            }`}
          >
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              ORDER_STATUS_CLASSES[order.status]
            }`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="text-gray-400 mt-1">
          Recibido el {formatOrderDate(order.createdAt)}
          {order.paidAt && ` · Pagado el ${formatOrderDate(order.paidAt)}`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="font-semibold text-white">Productos</h2>
            </div>

            {order.items.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-yellow-500">
                  Este pedido no tiene items cargados. Suele indicar que el
                  insert de order_items falló al crearse la orden.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 md:p-6 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {[item.productBrand, item.productName]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <p className="text-sm text-gray-400">
                        Talle {item.size} · {item.quantity} ×{" "}
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold text-white flex-shrink-0">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Totales */}
            <div className="p-6 border-t border-gray-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-300">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Envío ({zoneLabel})</span>
                <span className="text-gray-300">
                  {formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-white text-lg">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {customer.notes && (
            <div className="bg-dark-card rounded-xl border border-gray-800 p-6">
              <h2 className="font-semibold text-white mb-2">
                Notas del cliente
              </h2>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Cliente y envío */}
        <div className="space-y-6">
          <div className="bg-dark-card rounded-xl border border-gray-800 p-6">
            <h2 className="font-semibold text-white mb-4">Cliente</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Nombre</dt>
                <dd className="text-white">{customer.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-gray-300 hover:text-primary transition-colors break-all"
                  >
                    {customer.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Teléfono</dt>
                <dd>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-field transition-colors"
                  >
                    {customer.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-dark-card rounded-xl border border-gray-800 p-6">
            <h2 className="font-semibold text-white mb-4">Envío</h2>
            <address className="not-italic text-sm text-gray-300 space-y-1">
              <p>{customer.address}</p>
              <p>
                {customer.city}, {customer.province}
              </p>
              <p>CP {customer.postalCode}</p>
              <p className="text-gray-500 pt-2">Zona: {zoneLabel}</p>
            </address>
          </div>

          <div className="bg-dark-card rounded-xl border border-gray-800 p-6">
            <h2 className="font-semibold text-white mb-4">Pago</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Estado</dt>
                <dd className="text-white">
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Referencia</dt>
                <dd className="text-white break-all">
                  {order.externalReference || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">ID de pago MercadoPago</dt>
                <dd className="text-white break-all">
                  {order.mpPaymentId || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
