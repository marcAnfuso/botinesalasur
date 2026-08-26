import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logEvent } from "@/lib/events-server";
import { getShippingZones } from "@/lib/shipping";

export const dynamic = "force-dynamic";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externalReference = searchParams.get("ref");
    const paymentId = searchParams.get("payment_id");

    if (!externalReference && !paymentId) {
      return NextResponse.json(
        { error: "Se requiere ref o payment_id" },
        { status: 400 }
      );
    }

    // First check in our database
    let order = null;

    if (externalReference) {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("external_reference", externalReference)
        .single();
      order = data;
    }

    if (order && order.payment_status === "paid") {
      const zonas = await getShippingZones();
      const zona = zonas.find((z) => z.slug === order.shipping_zone);
      return NextResponse.json({
        verified: true,
        payment: {
          order_id: order.id,
          external_reference: order.external_reference,
          payment_id: order.mp_payment_id,
          amount: order.total,
          status: order.payment_status,
          paid_at: order.paid_at,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          // Para la pantalla de resultado: cómo pagó y a dónde va
          payment_type: order.mp_payment_data?.payment_type_id ?? null,
          shipping_zone_label: zona?.label ?? null,
          items: (order.order_items || []).map((i: any) => ({
            name: [i.product_brand, i.product_name].filter(Boolean).join(" "),
            code: i.product_code ?? null,
            size: i.size || i.variant_size || "",
            quantity: i.quantity,
          })),
        },
      });
    }

    // If not found locally or not paid, try MercadoPago API
    if (paymentId) {
      const mpPayment = await verifyWithMercadoPago(paymentId);

      if (mpPayment && mpPayment.status === "approved") {
        await logEvent("payment_verified", {
          ref: order?.external_reference ?? externalReference ?? null,
          details: { paymentId, origen: "verify-payment", teniaOrden: Boolean(order) },
        });
        // Update our database
        if (order) {
          await supabaseAdmin
            .from("orders")
            .update({
              mp_payment_id: paymentId,
              payment_status: "paid",
              status: "confirmed",
              paid_at: mpPayment.date_approved || new Date().toISOString(),
            })
            .eq("id", order.id);
        }

        return NextResponse.json({
          verified: true,
          source: "mercadopago_api",
          payment: {
            payment_id: mpPayment.id,
            external_reference: mpPayment.external_reference || "",
            amount: mpPayment.transaction_amount,
            status: mpPayment.status,
            paid_at: mpPayment.date_approved,
          },
        });
      }
    }

    // Return order info even if not paid
    if (order) {
      return NextResponse.json({
        verified: false,
        order: {
          id: order.id,
          external_reference: order.external_reference,
          status: order.status,
          payment_status: order.payment_status,
          total: order.total,
        },
        message: "Pago pendiente de confirmación",
      });
    }

    return NextResponse.json({
      verified: false,
      message: "Orden no encontrada",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

async function verifyWithMercadoPago(paymentId: string) {
  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}
