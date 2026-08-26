import { Resend } from "resend";
import { formatCodigo } from "./codigo";
import { htmlNuevoPedido, textoNuevoPedido } from "./email-templates";

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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
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

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.productName}${item.productCode ? ` <span style="color:#999">(${formatCodigo(item.productCode)})</span>` : ""}<br/>
          <small style="color: #666;">Talle: ${item.size}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.totalPrice.toLocaleString("es-AR")}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de compra - Botinesala Sur</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #DC2626; margin: 0;">Botinesala Sur</h1>
        <p style="color: #666;">Tu compra ha sido confirmada</p>
      </div>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #22C55E;">¡Gracias por tu compra, ${data.customerName.split(" ")[0]}!</h2>
        <p>Tu pedido <strong>#${data.externalReference}</strong> ha sido confirmado exitosamente.</p>
      </div>

      <h3 style="border-bottom: 2px solid #DC2626; padding-bottom: 10px;">Detalle del pedido</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f4f4f4;">
            <th style="padding: 10px; text-align: left;">Producto</th>
            <th style="padding: 10px; text-align: center;">Cant.</th>
            <th style="padding: 10px; text-align: right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;">Subtotal:</td>
            <td style="padding: 10px; text-align: right;">$${data.subtotal.toLocaleString("es-AR")}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;">Envío:</td>
            <td style="padding: 10px; text-align: right;">$${data.shippingCost.toLocaleString("es-AR")}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 1.1em;">
            <td colspan="2" style="padding: 10px; text-align: right; border-top: 2px solid #333;">Total:</td>
            <td style="padding: 10px; text-align: right; border-top: 2px solid #333;">$${data.total.toLocaleString("es-AR")}</td>
          </tr>
        </tfoot>
      </table>

      <h3 style="border-bottom: 2px solid #DC2626; padding-bottom: 10px; margin-top: 30px;">Dirección de envío</h3>
      <p style="background: #f8f8f8; padding: 15px; border-radius: 8px;">
        ${data.shippingAddress}<br/>
        ${data.shippingCity}, ${data.shippingProvince}<br/>
        CP: ${data.shippingPostalCode}
      </p>

      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f8f8; border-radius: 8px;">
        <p style="margin: 0 0 16px 0;">
          <a href="${BASE_URL}/mi-pedido?ref=${data.externalReference}" style="color: #DC2626;">Seguí tu pedido en la web</a>
          <span style="color: #999;"> — con la referencia y este mail</span>
        </p>
        <p style="margin: 0 0 10px 0;">¿Tenés alguna consulta?</p>
        <a href="https://wa.me/message/CJPQFIY4XTSJC1" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Contactanos por WhatsApp
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>Botinesala Sur - Botines de fútbol de alta calidad</p>
        <p>Este email fue enviado a ${data.customerEmail}</p>
      </div>
    </body>
    </html>
  `;

  const emailText = `
¡Gracias por tu compra, ${data.customerName.split(" ")[0]}!

Tu pedido #${data.externalReference} ha sido confirmado exitosamente.

DETALLE DEL PEDIDO:
${data.items.map((item) => `- ${item.productName}${item.productCode ? ` ${formatCodigo(item.productCode)}` : ""} (Talle ${item.size}) x${item.quantity} = $${item.totalPrice.toLocaleString("es-AR")}`).join("\n")}

Subtotal: $${data.subtotal.toLocaleString("es-AR")}
Envío: $${data.shippingCost.toLocaleString("es-AR")}
TOTAL: $${data.total.toLocaleString("es-AR")}

DIRECCIÓN DE ENVÍO:
${data.shippingAddress}
${data.shippingCity}, ${data.shippingProvince}
CP: ${data.shippingPostalCode}

Seguí tu pedido: ${BASE_URL}/mi-pedido?ref=${data.externalReference}

¿Tenés alguna consulta? Contactanos por WhatsApp:
https://wa.me/message/CJPQFIY4XTSJC1

---
Botinesala Sur - Botines de fútbol de alta calidad
  `;

  try {
    const resendClient = getResend();
    if (!resendClient) {
      console.log("Resend not initialized");
      return { success: false, error: "Email not configured" };
    }

    const result = await resendClient.emails.send({
      from: `Botinesala Sur <${fromEmail}>`,
      to: data.customerEmail,
      replyTo: process.env.NOTIFICATION_EMAIL || undefined,
      subject: `Confirmación de compra #${data.externalReference} - Botinesala Sur`,
      html: emailHtml,
      text: emailText,
    });

    console.log("Email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendNewOrderNotification(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!notificationEmail) {
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
      to: notificationEmail,
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
          Anotamos tu pedido <strong>#${data.externalReference}</strong>, pero
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

Anotamos tu pedido #${data.externalReference}, pero todavía no nos figura el pago acreditado.

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
      replyTo: process.env.NOTIFICATION_EMAIL || undefined,
      subject: `Recibimos tu pedido #${data.externalReference} — falta el pago`,
      html: emailHtml,
      text: emailText,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending pending payment email:", error);
    return { success: false, error };
  }
}
