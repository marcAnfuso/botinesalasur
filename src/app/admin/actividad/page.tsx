import Link from "next/link";
import { getRecentEvents } from "@/lib/events-server";
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
  searchParams: { q?: string };
}) {
  const filtro = searchParams.q?.trim() ?? "";
  const eventos = await getRecentEvents({ filtro, limite: 200 });

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
