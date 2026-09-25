import Link from "next/link";
import { getRecentEvents, getResumenActividad } from "@/lib/events-server";
import { EVENT_LABELS, EVENTOS_DE_ERROR } from "@/lib/events";
import { formatOrderDate } from "@/lib/order-status";

export const revalidate = 0;

// Resumen corto de los detalles, para leer de un vistazo
function resumir(details: Record<string, unknown> | null): string {
  if (!details) return "";
  const partes: string[] = [];
  for (const [k, v] of Object.entries(details)) {
    if (v === null || v === undefined || v === "") continue;
    const texto = typeof v === "object" ? JSON.stringify(v) : String(v);
    partes.push(`${k}: ${texto}`);
  }
  const s = partes.join(" · ");
  return s.length > 160 ? s.slice(0, 157) + "…" : s;
}

export default async function ActividadPage({
  searchParams,
}: {
  searchParams: { q?: string; dias?: string };
}) {
  const filtro = searchParams.q?.trim() ?? "";
  const dias = searchParams.dias === "1" ? 1 : searchParams.dias === "30" ? 30 : 7;
  const [eventos, r] = await Promise.all([getRecentEvents({ filtro, limite: 200 }), getResumenActividad(dias)]);
  const pct = (n: number, de: number) => (de > 0 ? `${Math.round((n / de) * 100)}%` : "—");
  const embudo = [
    { etiqueta: "Entraron", n: r.visitantes },
    { etiqueta: "Vieron un botín", n: r.vieronProducto },
    { etiqueta: "Agregaron al carrito", n: r.agregaronCarrito },
    { etiqueta: "Llegaron al checkout", n: r.llegaronCheckout },
    { etiqueta: "Tocaron pagar / WhatsApp", n: r.intentaronPagar },
    { etiqueta: "Compraron", n: r.compraron },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Actividad</h1>
        <p className="text-gray-400 mt-1">
          Cada paso que dan los clientes al comprar. Cuando alguien viene con
          un problema, buscá por la referencia de su pedido y mirá dónde se
          cortó.
        </p>
      </div>

      {/* Resumen: personas, no clics. Lo justo para saber si el negocio anda. */}
      {!filtro && (
        <section className="mb-8 bg-dark-card rounded-lg border border-dark-line">
          <div className="px-4 py-3 border-b border-dark-line flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-white">
              Últimos {r.dias === 1 ? "24 horas" : `${r.dias} días`}
            </h2>
            <div className="flex gap-1 text-xs">
              {[1, 7, 30].map((d) => (
                <Link
                  key={d}
                  href={`/admin/actividad?dias=${d}`}
                  className={`px-2.5 py-1 rounded ${r.dias === d ? "bg-primary text-white" : "text-gray-400 hover:text-white"}`}
                >
                  {d === 1 ? "Hoy" : `${d} días`}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-dark-line border-b border-dark-line">
            <div className="p-4"><p className="text-2xl font-bold text-white tnum">{r.visitantes}</p><p className="text-xs text-gray-400">visitantes distintos</p></div>
            <div className="p-4"><p className="text-2xl font-bold text-white tnum">{pct(r.movil, r.movil + r.escritorio)}</p><p className="text-xs text-gray-400">desde el celular · {r.escritorio} desde computadora</p></div>
            <div className="p-4"><p className="text-2xl font-bold text-field tnum">{r.compraron}</p><p className="text-xs text-gray-400">compraron · {pct(r.compraron, r.visitantes)} de los que entraron</p></div>
            <div className="p-4"><p className={`text-2xl font-bold tnum ${r.noTerminaronPago > 0 ? "text-yellow-500" : "text-white"}`}>{r.noTerminaronPago}</p><p className="text-xs text-gray-400">tocaron pagar y no terminaron · {r.abandonaronCheckout} se fueron del checkout sin tocar</p></div>
          </div>
          <div className="px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 border-b border-dark-line">
            {embudo.map((e, i) => (
              <span key={e.etiqueta} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-600">→</span>}
                <span className="text-white font-medium tnum">{e.n}</span> {e.etiqueta}
              </span>
            ))}
          </div>
          <div className="px-4 py-3 text-xs">
            {r.errores.length === 0 ? (
              <p className="text-gray-500">Sin errores en el período.</p>
            ) : (
              <ul className="space-y-1">
                {r.errores.map((e) => (
                  <li key={e.evento} className="flex flex-wrap gap-x-2 text-gray-300">
                    <span className="text-red-400 font-medium">{e.veces}×</span>
                    <span>{EVENT_LABELS[e.evento as keyof typeof EVENT_LABELS] ?? e.evento}</span>
                    {e.detalle && <span className="text-gray-500">— {e.detalle}</span>}
                    <span className="text-gray-600 tnum">último {formatOrderDate(e.ultimo)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <form method="get" className="mb-6 flex flex-col sm:flex-row gap-3 max-w-xl">
        <input
          type="search"
          name="q"
          defaultValue={filtro}
          placeholder="Referencia (BOTS-… / WA-…) o sesión"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary">
          Buscar
        </button>
        {filtro && (
          <Link href="/admin/actividad" className="btn-secondary">
            Ver todo
          </Link>
        )}
      </form>

      {eventos.length === 0 ? (
        <div className="bg-dark-card rounded-lg border border-dark-line py-16 px-6 text-center">
          <p className="text-white font-medium">
            {filtro ? "No hay actividad con ese dato" : "Todavía no hay actividad registrada"}
          </p>
          <p className="text-gray-400 text-sm mt-1.5">
            {filtro
              ? "Revisá que la referencia esté completa, con el prefijo y la fecha."
              : "Si ya hubo visitas y esto sigue vacío, falta correr supabase-migration-eventos.sql."}
          </p>
        </div>
      ) : (
        <ul className="bg-dark-card rounded-lg border border-dark-line divide-y divide-dark-line">
          {eventos.map((ev) => {
            const esError = EVENTOS_DE_ERROR.includes(ev.event);
            return (
              <li key={ev.id} className="px-4 py-3 grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
                <div className="text-xs text-gray-500 tnum">
                  {formatOrderDate(ev.createdAt)}
                  <span className="ml-2 uppercase tracking-wide text-[10px] text-gray-600">
                    {ev.source === "server" ? "servidor" : "navegador"}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`font-medium ${esError ? "text-red-400" : "text-white"}`}>
                      {EVENT_LABELS[ev.event] ?? ev.event}
                    </span>
                    {ev.orderRef && (
                      <Link
                        href={`/admin/actividad?q=${encodeURIComponent(ev.orderRef)}`}
                        className="text-xs tnum text-primary hover:text-primary-light"
                      >
                        {ev.orderRef}
                      </Link>
                    )}
                    {ev.sessionId && !ev.orderRef && (
                      <Link
                        href={`/admin/actividad?q=${encodeURIComponent(ev.sessionId)}`}
                        className="text-xs tnum text-gray-500 hover:text-gray-300"
                        title="Ver toda la sesión"
                      >
                        sesión {ev.sessionId.slice(0, 8)}
                      </Link>
                    )}
                    {ev.path && <span className="text-xs text-gray-600">{ev.path}</span>}
                  </div>
                  {ev.details && (
                    <p className="mt-0.5 text-xs text-gray-400 break-words">{resumir(ev.details)}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Se muestran los últimos {eventos.length} eventos
        {filtro ? " que coinciden" : ""}.
      </p>
    </div>
  );
}
