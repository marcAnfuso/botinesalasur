// Plantillas HTML de los mails. Sin dependencias: se pueden renderizar en
// cualquier lado para probarlas. Todo va con estilos inline y tablas, que
// es lo único que los clientes de correo respetan de forma pareja.

import { formatCodigo } from "./codigo";

export interface ItemMail {
  productName: string;
  productCode?: number | null;
  imageUrl?: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface NuevoPedidoMail {
  baseUrl: string;
  orderId: string;
  externalReference: string;
  createdAt?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingZoneLabel?: string | null;
  notes?: string | null;
  items: ItemMail[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentId?: string | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
}

const ROJO = "#DC2626";
const NEGRO = "#111114";
const GRIS = "#6b6b76";
const LINEA = "#e6e6ea";

export const pesos = (n: number) => `$ ${Math.round(n).toLocaleString("es-AR")}`;

const MEDIOS: Record<string, string> = {
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  prepaid_card: "Tarjeta prepaga",
  account_money: "Dinero en cuenta de MercadoPago",
  ticket: "Efectivo (Rapipago / Pago Fácil)",
  bank_transfer: "Transferencia",
};

function escapar(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fechaLarga(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

// Teléfonos argentinos como los escribe la gente ("11 2323-7214",
// "011 15 2323 7214") a un link de WhatsApp. Si no se puede armar con
// confianza, no se arma: mejor sin link que un link a otro número.
export function linkWhatsApp(telefono: string): string | null {
  let d = telefono.replace(/\D/g, "");
  if (d.startsWith("549")) return `https://wa.me/${d}`;
  if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  // "11 15 xxxx xxxx": el 15 sobra
  if (d.length === 12 && d.slice(2, 4) === "15") d = d.slice(0, 2) + d.slice(4);
  if (d.length === 10) return `https://wa.me/549${d}`;
  return null;
}

function absoluta(url: string | null | undefined, base: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function htmlNuevoPedido(d: NuevoPedidoMail): string {
  const wa = linkWhatsApp(d.customerPhone);
  const direccion = `${d.shippingAddress}, ${d.shippingCity}, ${d.shippingProvince}`;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  const logo = `${d.baseUrl}/images/logo-botinesalasur.png`;
  const panel = `${d.baseUrl}/admin/pedidos?ver=${d.orderId}`;
  const cuando = fechaLarga(d.paidAt || d.createdAt);

  const filas = d.items
    .map((it) => {
      const img = absoluta(it.imageUrl, d.baseUrl);
      return `
        <tr>
          <td style="padding:12px 0;border-top:1px solid ${LINEA};vertical-align:top;width:64px;">
            ${
              img
                ? `<img src="${escapar(img)}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:4px;background:#f0f0f2;">`
                : `<div style="width:56px;height:56px;border-radius:4px;background:#f0f0f2;"></div>`
            }
          </td>
          <td style="padding:12px 0 12px 12px;border-top:1px solid ${LINEA};vertical-align:top;">
            <div style="font-weight:600;color:${NEGRO};">${escapar(it.productName)}</div>
            <div style="margin-top:3px;font-size:13px;color:${GRIS};">
              ${it.productCode ? `<span style="display:inline-block;padding:1px 7px;border:1px solid ${LINEA};border-radius:3px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:${NEGRO};margin-right:8px;">${formatCodigo(it.productCode)}</span>` : ""}
              Talle <strong style="color:${NEGRO};">${escapar(it.size)}</strong>
              &nbsp;·&nbsp; ${it.quantity} × ${pesos(it.unitPrice)}
            </div>
          </td>
          <td style="padding:12px 0 12px 12px;border-top:1px solid ${LINEA};vertical-align:top;text-align:right;white-space:nowrap;font-weight:600;color:${NEGRO};">
            ${pesos(it.totalPrice)}
          </td>
        </tr>`;
    })
    .join("");

  const unidades = d.items.reduce((s, i) => s + i.quantity, 0);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Nuevo pedido ${escapar(d.externalReference)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${NEGRO};">
  <!-- lo que se ve en la lista de la bandeja, antes de abrir -->
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">
    ${unidades} ${unidades === 1 ? "par" : "pares"} · ${pesos(d.total)} · ${escapar(d.customerName)} · ${escapar(d.shippingCity)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f4;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINEA};">

        <!-- cabecera -->
        <tr>
          <td style="background:${NEGRO};padding:22px 24px;text-align:center;border-top:4px solid ${ROJO};">
            <img src="${logo}" width="56" height="56" alt="Botinesala Sur" style="display:inline-block;width:56px;height:56px;border-radius:50%;">
            <div style="margin-top:12px;font-size:22px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;">
              Nueva venta <span style="color:${ROJO};">confirmada</span>
            </div>
            <div style="margin-top:14px;font-size:36px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">${pesos(d.total)}</div>
            <div style="margin-top:8px;font-size:13px;color:#b8b8c2;">
              Pedido <span style="color:#ffffff;font-family:ui-monospace,Menlo,monospace;">${escapar(d.externalReference)}</span>
              ${cuando ? `&nbsp;·&nbsp; ${escapar(cuando)} hs` : ""}
            </div>
          </td>
        </tr>

        <!-- cliente y envío -->
        <tr><td style="padding:20px 24px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="vertical-align:top;padding-right:10px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${GRIS};">Cliente</div>
                <div style="margin-top:6px;font-size:16px;font-weight:600;">${escapar(d.customerName)}</div>
                <div style="margin-top:4px;font-size:14px;">
                  ${
                    wa
                      ? `<a href="${wa}" style="color:${NEGRO};text-decoration:none;">${escapar(d.customerPhone)}</a> <a href="${wa}" style="color:#16a34a;text-decoration:none;font-size:13px;">WhatsApp →</a>`
                      : escapar(d.customerPhone)
                  }
                </div>
                <div style="margin-top:2px;font-size:14px;"><a href="mailto:${escapar(d.customerEmail)}" style="color:${GRIS};text-decoration:none;">${escapar(d.customerEmail)}</a></div>
              </td>
              <td width="50%" style="vertical-align:top;padding-left:10px;border-left:1px solid ${LINEA};">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${GRIS};">Envío${d.shippingZoneLabel ? ` · ${escapar(d.shippingZoneLabel)}` : ""}</div>
                <div style="margin-top:6px;font-size:14px;line-height:1.45;">
                  ${escapar(d.shippingAddress)}<br>
                  ${escapar(d.shippingCity)}, ${escapar(d.shippingProvince)}<br>
                  CP ${escapar(d.shippingPostalCode)}
                </div>
                <div style="margin-top:4px;"><a href="${mapa}" style="font-size:13px;color:${ROJO};text-decoration:none;">Ver en el mapa →</a></div>
              </td>
            </tr>
          </table>
        </td></tr>

        ${
          d.notes
            ? `<tr><td style="padding:16px 24px 0;">
                 <div style="padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:4px;">
                   <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9a3412;">Nota del cliente</div>
                   <div style="margin-top:4px;font-size:14px;color:${NEGRO};white-space:pre-wrap;">${escapar(d.notes)}</div>
                 </div>
               </td></tr>`
            : ""
        }

        <!-- productos -->
        <tr><td style="padding:22px 24px 0;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${GRIS};">
            Productos · ${unidades} ${unidades === 1 ? "par" : "pares"}
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
            ${filas}
          </table>
        </td></tr>

        <!-- totales y pago -->
        <tr><td style="padding:16px 24px 22px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid ${NEGRO};">
            <tr><td style="padding-top:12px;font-size:14px;color:${GRIS};">Subtotal</td><td style="padding-top:12px;text-align:right;font-size:14px;">${pesos(d.subtotal)}</td></tr>
            <tr><td style="padding-top:4px;font-size:14px;color:${GRIS};">Envío</td><td style="padding-top:4px;text-align:right;font-size:14px;">${d.shippingCost === 0 ? "Sin cargo" : pesos(d.shippingCost)}</td></tr>
            <tr><td style="padding-top:8px;font-size:16px;font-weight:700;">Total cobrado</td><td style="padding-top:8px;text-align:right;font-size:20px;font-weight:800;color:${ROJO};">${pesos(d.total)}</td></tr>
          </table>
          <div style="margin-top:12px;font-size:13px;color:${GRIS};">
            <span style="display:inline-block;padding:2px 8px;border-radius:3px;background:#dcfce7;color:#166534;font-weight:600;">Pago aprobado</span>
            ${d.paymentMethod ? `&nbsp; ${escapar(MEDIOS[d.paymentMethod] ?? "MercadoPago")}` : "&nbsp; MercadoPago"}
            ${d.paymentId ? `&nbsp;·&nbsp; ID de pago <span style="font-family:ui-monospace,Menlo,monospace;">${escapar(d.paymentId)}</span>` : ""}
          </div>
        </td></tr>

        <!-- acciones -->
        <tr><td style="padding:0 24px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding-right:6px;">
                <a href="${panel}" style="display:block;text-align:center;padding:13px 10px;background:${ROJO};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;">Ver pedido en el panel</a>
              </td>
              <td width="50%" style="padding-left:6px;">
                ${
                  wa
                    ? `<a href="${wa}" style="display:block;text-align:center;padding:13px 10px;background:#16a34a;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;">Escribirle por WhatsApp</a>`
                    : `<a href="tel:${escapar(d.customerPhone.replace(/\s/g, ""))}" style="display:block;text-align:center;padding:13px 10px;background:#374151;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;">Llamar al cliente</a>`
                }
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- pie -->
        <tr>
          <td style="padding:14px 24px;border-top:1px solid ${LINEA};font-size:12px;color:${GRIS};text-align:center;">
            Aviso automático de <a href="${d.baseUrl}" style="color:${GRIS};">botinesalasur.com.ar</a>. El stock del talle ya quedó descontado.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function textoNuevoPedido(d: NuevoPedidoMail): string {
  const wa = linkWhatsApp(d.customerPhone);
  const items = d.items
    .map(
      (it) =>
        `• ${it.productName}${it.productCode ? ` ${formatCodigo(it.productCode)}` : ""} — talle ${it.size} × ${it.quantity} = ${pesos(it.totalPrice)}`
    )
    .join("\n");
  return `NUEVA VENTA CONFIRMADA — ${pesos(d.total)}
Pedido ${d.externalReference}${d.paidAt ? ` · ${fechaLarga(d.paidAt)} hs` : ""}

CLIENTE
${d.customerName}
${d.customerPhone}${wa ? ` · ${wa}` : ""}
${d.customerEmail}

ENVÍO${d.shippingZoneLabel ? ` · ${d.shippingZoneLabel}` : ""}
${d.shippingAddress}
${d.shippingCity}, ${d.shippingProvince} — CP ${d.shippingPostalCode}
${d.notes ? `\nNOTA DEL CLIENTE\n${d.notes}\n` : ""}
PRODUCTOS
${items}

Subtotal: ${pesos(d.subtotal)}
Envío: ${d.shippingCost === 0 ? "sin cargo" : pesos(d.shippingCost)}
TOTAL COBRADO: ${pesos(d.total)}

Pago aprobado${d.paymentMethod ? ` · ${MEDIOS[d.paymentMethod] ?? "MercadoPago"}` : ""}${d.paymentId ? ` · ID ${d.paymentId}` : ""}

Ver pedido en el panel: ${d.baseUrl}/admin/pedidos?ver=${d.orderId}
`;
}
