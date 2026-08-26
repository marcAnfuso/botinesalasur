"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminOrder, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/supabase-data";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  ORDER_STATUS_FLOW,
  formatOrderDate,
  CHANNEL_LABELS,
  CHANNEL_CLASSES,
} from "@/lib/order-status";
import { useToast } from "@/components/Toast";

type Filter =
  | "todos"
  | "por-preparar"
  | "pagados"
  | "sin-pagar"
  | "whatsapp"
  | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "por-preparar", label: "Por preparar" },
  { key: "pagados", label: "Pagados" },
  { key: "sin-pagar", label: "Sin pagar" },
  { key: "whatsapp", label: "Por WhatsApp" },
  { key: "shipped", label: "Enviados" },
  { key: "delivered", label: "Entregados" },
  { key: "cancelled", label: "Cancelados" },
];

export default function PedidosAdminClient({
  initialOrders,
}: {
  initialOrders: AdminOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<Filter>("todos");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const toast = useToast();

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "paid");
    return {
      total: orders.length,
      paid: paid.length,
      toPrepare: orders.filter(
        (o) =>
          o.paymentStatus === "paid" &&
          (o.status === "confirmed" || o.status === "processing")
      ).length,
      revenue: paid.reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders;

    switch (filter) {
      case "todos":
        break;
      case "por-preparar":
        result = result.filter(
          (o) =>
            o.paymentStatus === "paid" &&
            (o.status === "confirmed" || o.status === "processing")
        );
        break;
      case "pagados":
        result = result.filter((o) => o.paymentStatus === "paid");
        break;
      case "sin-pagar":
        result = result.filter((o) => o.paymentStatus !== "paid");
        break;
      case "whatsapp":
        result = result.filter((o) => o.channel === "whatsapp");
        break;
      default:
        result = result.filter((o) => o.status === filter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) =>
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          (o.externalReference || "").toLowerCase().includes(q) ||
          o.items.some((i) =>
            `${i.productBrand} ${i.productName}`.toLowerCase().includes(q)
          )
      );
    }

    return result;
  }, [orders, filter, search]);

  const changeStatus = async (id: string, status: OrderStatus) => {
    const previous = orders;
    setUpdatingId(id);

    // Optimista: revertimos si el server rechaza
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setOrders(previous);
        toast.error(data.error || "No se pudo actualizar el pedido");
      } else {
        toast.success(`Pedido marcado como ${ORDER_STATUS_LABELS[status].toLowerCase()}`);
      }
    } catch {
      setOrders(previous);
      toast.error("Error de conexión al actualizar el pedido");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pedidos</h1>
        <p className="text-gray-400 mt-1">
          Pedidos recibidos desde la tienda, con su estado de pago y envío
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-gray-400 text-sm mt-1">Pedidos totales</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-3xl font-bold text-field">{stats.paid}</p>
          <p className="text-gray-400 text-sm mt-1">Pagados</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-3xl font-bold text-yellow-500">{stats.toPrepare}</p>
          <p className="text-gray-400 text-sm mt-1">Por preparar</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(stats.revenue)}
          </p>
          <p className="text-gray-400 text-sm mt-1">Cobrado</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-dark-card text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="md:ml-auto md:w-72">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, email o referencia"
            className="input-field"
          />
        </div>
      </div>

      {/* Listado */}
      {filtered.length === 0 ? (
        <div className="bg-dark-card rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400">
            {orders.length === 0
              ? "Todavía no hay pedidos. Cuando alguien compre en la tienda, va a aparecer acá."
              : "Ningún pedido coincide con el filtro."}
          </p>
        </div>
      ) : (
        <div className="bg-dark-card rounded-xl border border-gray-800 divide-y divide-gray-800 overflow-hidden">
          {filtered.map((order) => (
            <div
              key={order.id}
              className={`p-4 md:p-6 transition-opacity ${
                updatingId === order.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Datos del pedido */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-semibold text-white hover:text-primary transition-colors"
                    >
                      {order.externalReference || order.id.slice(0, 8)}
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        PAYMENT_STATUS_CLASSES[order.paymentStatus]
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ORDER_STATUS_CLASSES[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    {order.channel === "whatsapp" && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          CHANNEL_CLASSES[order.channel]
                        }`}
                      >
                        {CHANNEL_LABELS[order.channel]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 truncate">
                    {order.customer.name} · {order.customer.email}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "producto" : "productos"} ·{" "}
                    {order.customer.city}, {order.customer.province} ·{" "}
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                {/* Total */}
                <div className="lg:text-right lg:w-32 flex-shrink-0">
                  <p className="text-lg font-bold text-white">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-gray-500">
                    envío {formatPrice(order.shippingCost)}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) =>
                      changeStatus(order.id, e.target.value as OrderStatus)
                    }
                    className="bg-dark border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    {ORDER_STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="px-3 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
