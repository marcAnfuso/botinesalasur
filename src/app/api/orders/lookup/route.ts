import { NextRequest, NextResponse } from "next/server";
import { getOrderForCustomer } from "@/lib/supabase-data";
import { logEvent } from "@/lib/events-server";

// Consulta de un pedido por parte del cliente. Hacen falta las dos cosas,
// la referencia y el mail con el que compró: la referencia sola es pública
// (va en la URL de retorno y en el chat de WhatsApp) y detrás hay dirección
// y teléfono.

const MIN_RESPONSE_MS = 400;

export async function POST(request: NextRequest) {
  const inicio = Date.now();
  const responder = async (res: NextResponse) => {
    const espera = Math.max(0, MIN_RESPONSE_MS - (Date.now() - inicio));
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    return res;
  };

  let ref = "";
  let email = "";
  let sessionId: string | null = null;
  try {
    const body = await request.json();
    ref = String(body.ref ?? "").trim().toUpperCase();
    email = String(body.email ?? "").trim();
    sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  } catch {
    return responder(
      NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    );
  }

  if (!ref || !email) {
    return responder(
      NextResponse.json(
        { error: "Escribí la referencia del pedido y el mail con el que compraste." },
        { status: 400 }
      )
    );
  }

  const order = await getOrderForCustomer(ref, email);

  if (!order) {
    return responder(
      NextResponse.json(
        {
          error:
            "No encontramos un pedido con esa referencia y ese mail. Revisá que estén igual que en el comprobante.",
        },
        { status: 404 }
      )
    );
  }

  await logEvent("order_lookup", { ref: order.externalReference, sessionId });

  // Sólo lo que el cliente necesita ver. Ni ids internos ni datos de MercadoPago.
  return responder(
    NextResponse.json({
      pedido: {
        ref: order.externalReference,
        createdAt: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        channel: order.channel,
        paidAt: order.paidAt,
        customerName: order.customer.name,
        shipping: {
          address: order.customer.address,
          city: order.customer.city,
          province: order.customer.province,
          postalCode: order.customer.postalCode,
        },
        items: order.items.map((i) => ({
          name: [i.productBrand, i.productName].filter(Boolean).join(" "),
          size: i.size,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
      },
    })
  );
}
