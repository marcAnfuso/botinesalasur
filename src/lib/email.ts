import { Resend } from "resend";
import { formatCodigo } from "./codigo";
import { numeroPedido } from "./pedido-numero";
import {
  htmlNuevoPedido,
  textoNuevoPedido,
  htmlConfirmacionCliente,
  textoConfirmacionCliente,
} from "./email-templates";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.com.ar";

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface OrderEmailData {
  orderId: string;
  externalReference: string;
  numero?: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni?: string | null;
  shippingAddress: string;
  shippingFloorApt?: string | null;
  shippingZone?: string | null;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  items: {
    productName: string;
    productCode?: number | null;
    imageUrl?: string | null;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentId?: string;
  // Sólo los usa el aviso a la tienda
  notes?: string | null;
  shippingZoneLabel?: string | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
}

// NOTIFICATION_EMAIL admite varias casillas separadas por coma (o punto y
// coma): "fede@…, alan@…". Todas reciben el aviso de venta y las respuestas
// de los clientes.
export function destinatariosAviso(): string[] {
  const crudo = process.env.NOTIFICATION_EMAIL ?? "";
  const vistos = new Set<string>();
  return crudo
    .split(/[,;\s]+/)
    .map((d) => d.trim())
    .filter((d) => d.includes("@") && !vistos.has(d.toLowerCase()) && vistos.add(d.toLowerCase()));
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const datos = { ...data, baseUrl: BASE_URL };
  // El nombre se guarda en mayúsculas; el asunto saluda "Marcos", no "MARCOS"
  const crudo = data.customerName.trim().split(/\s+/)[0] || "";
  const nombre = crudo.charAt(0).toUpperCase() + crudo.slice(1).toLowerCase();

  try {
    const resendClient = getResend();
    if (!resendClient) {
      console.log("Resend not initialized");
      return { success: false, error: "Email not configured" };
    }

    const result = await resendClient.emails.send({
      from: `Botinesala Sur <${fromEmail}>`,
      to: data.customerEmail,
      replyTo: destinatariosAviso().length ? destinatariosAviso() : undefined,
      subject: `¡Listo${nombre ? `, ${nombre}` : ""}! Tu compra está confirmada — pedido ${numeroPedido(data.numero, data.externalReference)}`,
      html: htmlConfirmacionCliente(datos),
      text: textoConfirmacionCliente(datos),
    });

    console.log("Email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendNewOrderNotification(
  data: OrderEmailData,
  // Para el mail de prueba del panel: a quién mandarlo en vez de a la tienda
  destinatariosForzados?: string[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  const destinatarios = destinatariosForzados?.length ? destinatariosForzados : destinatariosAviso();
  if (destinatarios.length === 0) {
    console.log("NOTIFICATION_EMAIL not configured, skipping admin notification");
    return { success: false, error: "Notification email not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const datos = { ...data, baseUrl: BASE_URL };
  const unidades = data.items.reduce((n, i) => n + i.quantity, 0);

  try {
    const resendClient = getResend();
    if (!resendClient) {
      console.log("Resend not initialized");
      return { success: false, error: "Email not configured" };
    }

    const result = await resendClient.emails.send({
      from: `Botinesala Sur <${fromEmail}>`,
      to: destinatarios,
      // El asunto ya cuenta lo importante: cuánto, quién y cuántos pares.
      subject: `Nueva venta · $${Math.round(data.total).toLocaleString("es-AR")} · ${data.customerName} (${unidades} ${unidades === 1 ? "par" : "pares"})`,
      html: htmlNuevoPedido(datos),
      text: textoNuevoPedido(datos),
    });

    console.log("Admin notification sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return { success: false, error };
  }
}

// Aviso de pedido recibido cuando el pago todavía no acreditó.
// Con efectivo en Rapipago o Pago Fácil pueden pasar días entre la compra y
// la acreditación: sin este mail el cliente se queda sin ningún comprobante
// de que su pedido existe.
export async function sendPendingPaymentEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping pending email");
    return { success: false, error: "Email not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const nombre = data.customerName.split(" ")[0];
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            ${item.productName}${item.productCode ? ` (${formatCodigo(item.productCode)})` : ""}${item.size ? ` — Talle ${item.size}` : ""}
            <span style="color: #666;">x${item.quantity}</span>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
            $${item.totalPrice.toLocaleString("es-AR")}
          </td>
        </tr>`
    )
    .join("");

  const emailHtml = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 24px 0;">
        <h1 style="color: #DC2626; margin: 0;">Botinesala Sur</h1>
        <p style="color: #666;">Recibimos tu pedido</p>
      </div>

      <div style="background: #f8f8f8; padding: 24px; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #B45309;">Tu pedido está reservado, ${nombre}</h2>
        <p>
          Anotamos tu pedido <strong>${numeroPedido(data.numero, data.externalReference)}</strong>, pero
          todavía no nos figura el pago acreditado.
        </p>
        <p>
          Si elegiste pagar en efectivo por Rapipago o Pago Fácil, tenés que
          completar el pago con el cupón que te dio MercadoPago. La
          acreditación puede tardar hasta 3 días hábiles.
        </p>
        <p style="margin-bottom: 0;">
          <strong>Te avisamos por mail apenas se acredite</strong> y ahí
          preparamos el envío.
        </p>
      </div>

      <h3 style="margin-top: 24px;">Lo que reservaste</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding: 12px 0; font-weight: bold;">Total</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold;">
            $${data.total.toLocaleString("es-AR")}
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; color: #666;">
        <p style="margin: 0 0 16px 0;">
          <a href="${BASE_URL}/mi-pedido?ref=${data.externalReference}" style="color: #DC2626;">Ver el estado de tu pedido</a>
        </p>
        <p style="margin: 0 0 10px 0;">¿Alguna duda con el pago?</p>
        <a href="https://wa.me/message/CJPQFIY4XTSJC1" style="color: #DC2626;">
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  `;

  const emailText = `
Botinesala Sur — Recibimos tu pedido

Tu pedido está reservado, ${nombre}.

Anotamos tu pedido ${numeroPedido(data.numero, data.externalReference)}, pero todavía no nos figura el pago acreditado.

Si elegiste pagar en efectivo por Rapipago o Pago Fácil, completá el pago con el cupón que te dio MercadoPago. La acreditación puede tardar hasta 3 días hábiles.

Te avisamos por mail apenas se acredite.
Estado del pedido: ${BASE_URL}/mi-pedido?ref=${data.externalReference}

Total: $${data.total.toLocaleString("es-AR")}

¿Dudas? Escribinos: https://wa.me/message/CJPQFIY4XTSJC1
  `;

  try {
    const resendClient = getResend();
    if (!resendClient) {
      return { success: false, error: "Email not configured" };
    }

    const result = await resendClient.emails.send({
      from: `Botinesala Sur <${fromEmail}>`,
      to: data.customerEmail,
      replyTo: destinatariosAviso().length ? destinatariosAviso() : undefined,
      subject: `Recibimos tu pedido ${numeroPedido(data.numero, data.externalReference)} — falta el pago`,
      html: emailHtml,
      text: emailText,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending pending payment email:", error);
    return { success: false, error };
  }
}
