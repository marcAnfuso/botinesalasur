import { supabaseAdmin } from "./supabase";
import { EventName } from "./events";

// Lado servidor del registro de actividad. Todo lo de acá es "best effort":
// anotar un evento nunca puede hacer fallar una compra.

export interface EventRow {
  id: number;
  createdAt: string;
  event: EventName;
  source: "client" | "server";
  sessionId: string | null;
  orderRef: string | null;
  path: string | null;
  userAgent: string | null;
  details: Record<string, unknown> | null;
}

interface LogOptions {
  ref?: string | null;
  sessionId?: string | null;
  details?: Record<string, unknown>;
  path?: string | null;
  userAgent?: string | null;
  source?: "client" | "server";
}

export async function logEvent(
  event: EventName,
  opts: LogOptions = {}
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("events").insert({
      event,
      source: opts.source ?? "server",
      session_id: opts.sessionId || null,
      order_ref: opts.ref || null,
      path: opts.path || null,
      user_agent: opts.userAgent ? opts.userAgent.slice(0, 300) : null,
      details: opts.details ?? null,
    });
    if (error) {
      // La tabla puede no existir todavía: se avisa y se sigue.
      console.warn(`[events] no se pudo anotar ${event}:`, error.message);
    }
  } catch (e) {
    console.warn(`[events] no se pudo anotar ${event}:`, e);
  }
}

function transformEvent(row: any): EventRow {
  return {
    id: row.id,
    createdAt: row.created_at,
    event: row.event,
    source: row.source,
    sessionId: row.session_id,
    orderRef: row.order_ref,
    path: row.path,
    userAgent: row.user_agent,
    details: row.details,
  };
}

// Todo lo que pasó con un pedido, y también lo que pasó en la misma sesión
// antes de que existiera el pedido (armar el carrito, tocar comprar).
export async function getEventsForOrder(ref: string): Promise<EventRow[]> {
  const { data: propios, error } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("order_ref", ref)
    .order("created_at", { ascending: true });

  if (error || !propios) return [];

  const sesiones = Array.from(
    new Set(propios.map((e: any) => e.session_id).filter(Boolean))
  );
  if (sesiones.length === 0) return propios.map(transformEvent);

  const { data: deSesion } = await supabaseAdmin
    .from("events")
    .select("*")
    .in("session_id", sesiones)
    .is("order_ref", null)
    .order("created_at", { ascending: true })
    .limit(200);

  const todos = [...(deSesion ?? []), ...propios].sort((a: any, b: any) =>
    a.created_at < b.created_at ? -1 : 1
  );
  return todos.map(transformEvent);
}

export async function getRecentEvents(opts: {
  filtro?: string;
  limite?: number;
}): Promise<EventRow[]> {
  const limite = Math.min(opts.limite ?? 200, 500);
  let q = supabaseAdmin
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limite);

  const f = opts.filtro?.trim();
  if (f) {
    // Referencia de pedido o id de sesión, lo que hayan pegado
    q = q.or(`order_ref.ilike.%${f}%,session_id.ilike.%${f}%`);
  }

  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(transformEvent);
}
