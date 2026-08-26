import { createHmac, timingSafeEqual } from "node:crypto";

// Verificación de la firma que MercadoPago manda con cada aviso.
//
// MercadoPago firma cada notificación con la clave secreta del webhook y la
// manda en el header `x-signature` como `ts=<timestamp>,v1=<hmac>`. El HMAC
// se calcula sobre un texto armado así (cada parte se omite si falta):
//
//   id:<data.id de la query string>;request-id:<header x-request-id>;ts:<ts>;
//
// Referencia: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks

export interface VerificacionFirma {
  valida: boolean;
  motivo?: string;
}

export function verificarFirmaMercadoPago(opts: {
  secret: string;
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): VerificacionFirma {
  const { secret, xSignature, xRequestId, dataId } = opts;

  if (!xSignature) return { valida: false, motivo: "falta el header x-signature" };

  // `ts=...,v1=...` en cualquier orden
  let ts = "";
  let v1 = "";
  for (const parte of xSignature.split(",")) {
    const [clave, ...resto] = parte.split("=");
    const valor = resto.join("=").trim();
    if (clave.trim() === "ts") ts = valor;
    if (clave.trim() === "v1") v1 = valor;
  }
  if (!ts || !v1) return { valida: false, motivo: "x-signature incompleto" };

  // Si el id trae letras, MercadoPago lo firma en minúsculas.
  const id =
    dataId && /[a-zA-Z]/.test(dataId) ? dataId.toLowerCase() : dataId;

  const manifest =
    (id ? `id:${id};` : "") +
    (xRequestId ? `request-id:${xRequestId};` : "") +
    `ts:${ts};`;

  const esperado = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(esperado, "utf8");
  const b = Buffer.from(v1, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valida: false, motivo: "la firma no coincide" };
  }

  return { valida: true };
}
