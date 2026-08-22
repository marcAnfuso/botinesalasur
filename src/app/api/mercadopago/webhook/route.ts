import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail, sendNewOrderNotification } from "@/lib/email";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

// GET handler for webhook verification
export async function GET() {
  return new Response("Webhook activo", { status: 200 });
}

// POST handler for payment notifications
export async function POST(request: NextRequest) {
  try {
    console.log("Webhook received:", {
      method: request.method,
      url: request.url,
    });

    const body = await request.json();
    console.log("Webhook payload:", JSON.stringify(body, null, 2));

    // Get notification type and resource ID
    const topic = body.topic || body.type;
    const resourceId = body.data?.id || body.id;

    console.log("Processing notification:", { topic, resourceId });

    // Only process payment notifications
    if ((topic === "payment" || topic === "merchant_order") && resourceId) {
      const paymentData = await getPaymentDetails(resourceId);

      if (paymentData) {
        await processPayment(paymentData);
      }
    }

    // Always respond 200 to prevent retries
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent retries
    return NextResponse.json({ received: true, error: "Processing error" }, { status: 200 });
  }
}

async function getPaymentDetails(paymentId: string) {
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

    console.error("Error fetching payment details:", {
      paymentId,
      status: response.status,
    });
    return null;
  } catch (error) {
    console.error("Error fetching payment:", error);
    return null;
  }
}

async function processPayment(payment: {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  transaction_amount?: number;
  payer?: { email?: string };
  date_approved?: string;
  payment_method_id?: string;
  payment_type_id?: string;
}) {
  const paymentId = payment.id.toString();
  const status = payment.status;
  const externalReference = payment.external_reference || "";
  const amount = payment.transaction_amount || 0;
  const payerEmail = payment.payer?.email || "";

  console.log("Processing payment:", {
    paymentId,
    status,
    externalReference,
    amount,
    payerEmail,
  });

  // Find order by external reference
  const { data: order, error: findError } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("external_reference", externalReference)
    .single();

  if (findError || !order) {
    console.error("Order not found:", { externalReference, error: findError });
    return;
  }

  // Check if already processed
  if (order.mp_payment_id === paymentId) {
    console.log("Payment already processed:", paymentId);
    return;
  }

  // Map MercadoPago status to our status
  let paymentStatus: string;
  let orderStatus: string;

  switch (status) {
    case "approved":
      paymentStatus = "paid";
      orderStatus = "confirmed";
      break;
    case "pending":
    case "in_process":
      paymentStatus = "pending";
      orderStatus = "pending";
      break;
    case "rejected":
    case "cancelled":
      paymentStatus = "failed";
      orderStatus = "cancelled";
      break;
    default:
      paymentStatus = "pending";
      orderStatus = "pending";
  }

  // Update order
  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      mp_payment_id: paymentId,
      payment_status: paymentStatus,
      status: orderStatus,
      paid_at: status === "approved" ? payment.date_approved || new Date().toISOString() : null,
      mp_payment_data: {
        status,
        status_detail: payment.status_detail,
        payment_method_id: payment.payment_method_id,
        payment_type_id: payment.payment_type_id,
        payer_email: payerEmail,
      },
    })
    .eq("id", order.id);

  if (updateError) {
    console.error("Error updating order:", updateError);
    return;
  }

  console.log("Order updated successfully:", {
    orderId: order.id,
    paymentStatus,
    orderStatus,
  });

  // If payment approved, update stock and send notifications
  if (status === "approved") {
    await updateStock(order.id);
    await sendPaymentNotifications(order, paymentId);
  }
}

async function updateStock(orderId: string) {
  try {
    // Get order items
    const { data: items, error } = await supabaseAdmin
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", orderId);

    if (error || !items) {
      console.error("Error fetching order items:", error);
      return;
    }

    // Update stock for each variant
    for (const item of items) {
      const { error: stockError } = await supabaseAdmin.rpc("decrement_stock", {
        variant_id: item.variant_id,
        qty: item.quantity,
      });

      if (stockError) {
        console.error("Error updating stock:", stockError);
      }
    }

    console.log("Stock updated for order:", orderId);
  } catch (error) {
    console.error("Error in updateStock:", error);
  }
}

interface OrderWithItems {
  id: string;
  external_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  order_items: {
    product_name: string;
    product_brand?: string;
    size?: string;
    variant_size?: string;
    quantity: number;
    unit_price: number;
    total_price?: number;
  }[];
}

async function sendPaymentNotifications(order: OrderWithItems, paymentId: string) {
  try {
    const emailData = {
      orderId: order.id,
      externalReference: order.external_reference,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingProvince: order.shipping_province,
      shippingPostalCode: order.shipping_postal_code,
      items: order.order_items.map((item) => ({
        productName: [item.product_brand, item.product_name]
          .filter(Boolean)
          .join(" "),
        size: item.size || item.variant_size || "",
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price || item.unit_price * item.quantity,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      total: order.total,
      paymentId,
    };

    // Send confirmation to customer
    const customerResult = await sendOrderConfirmationEmail(emailData);
    console.log("Customer email result:", customerResult);

    // Send notification to admin
    const adminResult = await sendNewOrderNotification(emailData);
    console.log("Admin notification result:", adminResult);
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}
