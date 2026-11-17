// Píxel de Meta (Facebook/Instagram Ads) — lado navegador.
// El ID del píxel es público: va en el HTML de cualquier sitio que lo use.
// El token de la API de conversiones, en cambio, es secreto y solo vive en
// el servidor (META_CAPI_TOKEN, ver meta-capi.ts).

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1741928827312463";

type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq;
  }
}

// Manda un evento estándar. eventId sirve para que Meta no cuente dos veces
// la misma compra cuando también la informa el servidor.
export function metaEvent(name: string, params: Record<string, unknown> = {}, eventId?: string, intento = 0): void {
  if (typeof window === "undefined") return;
  // Al entrar directo a una página, el evento puede salir antes de que cargue
  // el píxel: se reintenta unos segundos en vez de perderlo.
  if (!window.fbq) {
    if (intento < 20) setTimeout(() => metaEvent(name, params, eventId, intento + 1), 300);
    return;
  }
  try {
    if (eventId) window.fbq("track", name, params, { eventID: eventId });
    else window.fbq("track", name, params);
  } catch {
    // el píxel nunca puede romper la compra
  }
}

// Cookies que deja el píxel: _fbp identifica el navegador y _fbc el clic en
// un anuncio. Se mandan al servidor para que la API de conversiones pueda
// atribuir la venta al anuncio.
export function metaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  const leer = (n: string) => document.cookie.split("; ").find((c) => c.startsWith(n + "="))?.split("=")[1];
  let fbc = leer("_fbc");
  if (!fbc) {
    // Si el píxel todavía no la armó, sale del fbclid de la URL del anuncio
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  return { fbp: leer("_fbp"), fbc };
}
