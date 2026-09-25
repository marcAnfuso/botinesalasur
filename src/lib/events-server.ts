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

// ───────────── resumen para el panel ─────────────

export interface ResumenActividad {
  dias: number;
  visitantes: number;
  movil: number;
  escritorio: number;
  vieronProducto: number;
  agregaronCarrito: number;
  llegaronCheckout: number;
  intentaronPagar: number;
  compraron: number;
  abandonaronCheckout: number;
  noTerminaronPago: number;
  errores: { evento: string; veces: number; ultimo: string; detalle: string }[];
}

// Cuenta por visitante (sesión), no por evento: 5 clics de una persona son
// una persona. Lo que Alan y Marc preguntan: cuántos entraron, desde qué
// aparato, dónde se cayeron y qué falló.
export async function getResumenActividad(dias: number): Promise<ResumenActividad> {
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  const { data } = await supabaseAdmin
    .from("events")
    .select("event, session_id, user_agent, created_at, details")
    .gte("created_at", desde)
    .order("created_at", { ascending: false })
    .limit(5000);
  const filas = (data ?? []) as { event: string; session_id: string | null; user_agent: string | null; created_at: string; details: Record<string, unknown> | null }[];

  const porSesion = new Map<string, Set<string>>();
  const aparato = new Map<string, "movil" | "escritorio">();
  for (const f of filas) {
    if (!f.session_id) continue;
    if (!porSesion.has(f.session_id)) porSesion.set(f.session_id, new Set());
    porSesion.get(f.session_id)!.add(f.event);
    if (!aparato.has(f.session_id) && f.user_agent) {
      aparato.set(f.session_id, /Mobi|Android|iPhone|iPad/i.test(f.user_agent) ? "movil" : "escritorio");
    }
  }
  const con = (...evs: string[]) => Array.from(porSesion.values()).filter((s) => evs.some((e) => s.has(e))).length;
  const sin = (tiene: string[], falta: string[]) =>
    Array.from(porSesion.values()).filter((s) => tiene.some((e) => s.has(e)) && !falta.some((e) => s.has(e))).length;
  const PAGO = ["payment_verified", "webhook_payment", "whatsapp_order_created"];

  const errores = new Map<string, { veces: number; ultimo: string; detalle: string }>();
  for (const f of filas) {
    if (!["checkout_error", "preference_failed", "price_mismatch", "whatsapp_order_failed", "webhook_rejected"].includes(f.event)) continue;
    const d = f.details ?? {};
    const detalle = String(d.error ?? d.motivo ?? d.paso ?? (d.cliente != null ? `cliente $${d.cliente} vs servidor $${d.servidor}` : "")).slice(0, 90);
    const e = errores.get(f.event);
    if (e) e.veces += 1;
    else errores.set(f.event, { veces: 1, ultimo: f.created_at, detalle });
  }

  return {
    dias,
    visitantes: porSesion.size,
    movil: Array.from(aparato.values()).filter((a) => a === "movil").length,
    escritorio: Array.from(aparato.values()).filter((a) => a === "escritorio").length,
    vieronProducto: con("product_view"),
    agregaronCarrito: con("cart_add"),
    llegaronCheckout: con("checkout_view"),
    intentaronPagar: con("checkout_submit"),
    compraron: con(...PAGO),
    abandonaronCheckout: sin(["checkout_view"], ["checkout_submit"]),
    noTerminaronPago: sin(["checkout_submit"], PAGO),
    errores: Array.from(errores.entries()).map(([evento, e]) => ({ evento, ...e })).sort((a, b) => b.veces - a.veces),
  };
}
