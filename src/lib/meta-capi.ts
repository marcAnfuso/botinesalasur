// API de conversiones de Meta — lado servidor.
// Informa ventas y pedidos aunque el navegador tenga bloqueadores, con los
// datos del cliente hasheados (SHA-256) como pide Meta. Sin META_CAPI_TOKEN
// no hace nada: la tienda funciona igual.
import crypto from "crypto";
import { META_PIXEL_ID } from "./meta";
import { logEvent } from "./events-server";

const VERSION = process.env.META_GRAPH_VERSION || "v23.0";

const sha = (v: string | null | undefined) =>
  v ? crypto.createHash("sha256").update(v).digest("hex") : undefined;
const limpio = (v: string | null | undefined) =>
  v ? v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") : "";

// 011 6233-3587 → 541162333587 (Meta pide el teléfono con código de país)
function telefono(v: string | null | undefined): string {
  let d = (v || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("54")) return d;
  d = d.replace(/^0/, "");
  return "54" + d;
}

export interface DatosCliente {
  email?: string | null;
  telefono?: string | null;
  nombre?: string | null; // nombre y apellido juntos
  ciudad?: string | null;
  provincia?: string | null;
  cp?: string | null;
  idExterno?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export async function enviarEventoMeta(opts: {
  evento: "Purchase" | "Lead";
  eventId: string;
  valor: number;
  contenidos: { id: string; quantity: number; item_price?: number }[];
  cliente: DatosCliente;
  url: string;
  ref?: string | null;
}): Promise<void> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !META_PIXEL_ID) return;

  const partes = (opts.cliente.nombre || "").trim().split(/\s+/);
  const user_data: Record<string, unknown> = {
    em: sha((opts.cliente.email || "").trim().toLowerCase() || undefined),
    ph: sha(telefono(opts.cliente.telefono) || undefined),
    fn: sha(limpio(partes[0]) || undefined),
    ln: sha(limpio(partes.slice(1).join(" ")) || undefined),
    ct: sha(limpio(opts.cliente.ciudad) || undefined),
    st: sha(limpio(opts.cliente.provincia) || undefined),
    zp: sha(limpio(opts.cliente.cp) || undefined),
    country: sha("ar"),
    external_id: sha(opts.cliente.idExterno || undefined),
    fbp: opts.cliente.fbp || undefined,
    fbc: opts.cliente.fbc || undefined,
    client_ip_address: opts.cliente.ip || undefined,
    client_user_agent: opts.cliente.userAgent || undefined,
  };
  Object.keys(user_data).forEach((k) => user_data[k] === undefined && delete user_data[k]);

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: opts.evento,
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        action_source: "website",
        event_source_url: opts.url,
        user_data,
        custom_data: {
          currency: "ARS",
          value: opts.valor,
          content_type: "product",
          content_ids: opts.contenidos.map((c) => c.id),
          contents: opts.contenidos,
          num_items: opts.contenidos.reduce((a, c) => a + c.quantity, 0),
        },
      },
    ],
  };
  // Para probar desde "Eventos de prueba" del Administrador de eventos
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(`https://graph.facebook.com/${VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      const txt = (await res.text()).slice(0, 300);
      await logEvent("meta_capi_error", { ref: opts.ref ?? null, details: { evento: opts.evento, status: res.status, error: txt } });
    } else {
      await logEvent("meta_capi_sent", { ref: opts.ref ?? null, details: { evento: opts.evento, valor: opts.valor } });
    }
  } catch (e) {
    await logEvent("meta_capi_error", { ref: opts.ref ?? null, details: { evento: opts.evento, error: String(e).slice(0, 200) } });
  }
}

// IP y navegador de quien hizo el pedido, para mejorar la atribución
export function origenDelPedido(headers: Headers): { ip: string | null; userAgent: string | null } {
  const ip = headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || null;
  return { ip, userAgent: headers.get("user-agent") };
}
