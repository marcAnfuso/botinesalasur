import Link from "next/link";
import {
  getAllProductsAdmin,
  getOrders,
  formatPrice,
  categories,
} from "@/lib/supabase-data";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
  formatOrderDate,
} from "@/lib/order-status";

// Revalidar cada 30 segundos para admin
export const revalidate = 30;

export default async function AdminDashboard() {
  const [products, orders] = await Promise.all([
    getAllProductsAdmin(),
    getOrders(),
  ]);

  const recentOrders = orders.slice(0, 5);
  const ordersToPrepare = orders.filter(
    (o) =>
      o.paymentStatus === "paid" &&
      (o.status === "confirmed" || o.status === "processing")
  ).length;

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const featuredProducts = products.filter((p) => p.featured).length;
  const lowStockProducts = products.filter((p) =>
    p.variants.every((v) => v.stock <= 2)
  ).length;

  const productsByCategory = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.slug).length,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Bienvenido al panel de administración de Botinesala Sur
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-3xl font-bold text-white">{totalProducts}</p>
          <p className="text-gray-400 text-sm mt-1">Productos totales</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-3xl font-bold text-field">{activeProducts}</p>
          <p className="text-gray-400 text-sm mt-1">Activos</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-3xl font-bold text-primary">{featuredProducts}</p>
          <p className="text-gray-400 text-sm mt-1">Destacados</p>
        </div>
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
          <p className="text-3xl font-bold text-yellow-500">{lowStockProducts}</p>
          <p className="text-gray-400 text-sm mt-1">Stock bajo</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/admin/productos/nuevo"
          className="bg-primary/10 border border-primary/30 rounded-xl p-6 hover:bg-primary/20 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Agregar producto</h3>
              <p className="text-sm text-gray-400">
                Crear un nuevo producto en el catálogo
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/productos"
          className="bg-dark-card border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Ver todos los productos</h3>
              <p className="text-sm text-gray-400">
                Gestionar el catálogo completo
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/importar"
          className="bg-field/10 border border-field/30 rounded-xl p-6 hover:bg-field/20 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-field/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-field"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Importar masivo</h3>
              <p className="text-sm text-gray-400">
                Cargar productos desde CSV/Excel
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/pedidos"
          className="bg-dark-card border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group relative"
        >
          {ordersToPrepare > 0 && (
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-primary text-white text-xs font-medium">
              {ordersToPrepare} por preparar
            </span>
          )}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12A1.125 1.125 0 0119.75 21.75H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Ver pedidos</h3>
              <p className="text-sm text-gray-400">
                {orders.length === 0
                  ? "Todavía no hay pedidos"
                  : `${orders.length} ${orders.length === 1 ? "pedido recibido" : "pedidos recibidos"}`}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Últimos pedidos */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Últimos pedidos</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-gray-400 hover:text-primary transition-colors"
          >
            Ver todos
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-400 text-sm">
              Todavía no hay pedidos. Cuando alguien compre en la tienda, va a
              aparecer acá.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex items-center gap-4 p-4 hover:bg-dark-lighter transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-medium">
                      {order.externalReference || order.id.slice(0, 8)}
                    </span>
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
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {order.customer.name} · {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <span className="font-semibold text-white flex-shrink-0">
                  {formatPrice(order.total)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products by Category */}
      <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="font-semibold text-white">Productos por categoría</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {productsByCategory.map((cat) => (
            <Link
              key={cat.id}
              href={`/admin/productos?categoria=${cat.slug}`}
              className="flex items-center justify-between p-4 hover:bg-dark-lighter transition-colors"
            >
              <span className="text-white">{cat.name}</span>
              <span className="text-gray-400">{cat.count} productos</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-field/10 border border-field/30 rounded-xl p-6">
        <h3 className="font-semibold text-field mb-2">
          Conectado a Supabase
        </h3>
        <p className="text-gray-400 text-sm">
          Los datos que ves se cargan en tiempo real desde la base de datos.
          Los cambios que hagas desde el panel se reflejarán inmediatamente en la tienda.
        </p>
      </div>
    </div>
  );
}
