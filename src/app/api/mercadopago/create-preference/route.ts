import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.vercel.app";

interface CartItem {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
  };
  variant: {
    id: string;
    size: string;
  };
  quantity: number;
}

interface CheckoutData {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    shippingZone: string;
    notes: string;
  };
  shippingCost: number;
  total: number;
}

function generateExternalReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BOTS-${date}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!MP_ACCESS_TOKEN) {
      console.error("MERCADOPAGO_ACCESS_TOKEN not configured");
      return NextResponse.json(
        { error: "MercadoPago no configurado" },
        { status: 500 }
      );
    }

    const data: CheckoutData = await request.json();
    const { items, customer, shippingCost, total } = data;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No hay productos en el carrito" },
        { status: 400 }
      );
    }

    // Generate unique reference
    const externalReference = generateExternalReference();

    // Create order in Supabase first
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        external_reference: externalReference,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_province: customer.province,
        shipping_postal_code: customer.postalCode,
        shipping_zone: customer.shippingZone,
        notes: customer.notes,
        subtotal: total - shippingCost,
        shipping_cost: shippingCost,
        total: total,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Error al crear la orden" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      variant_id: item.variant.id,
      product_name: `${item.product.brand} ${item.product.name}`,
      size: item.variant.size,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
    }

    // Build MercadoPago preference
    const mpItems = items.map((item) => ({
      id: item.product.id,
      title: `${item.product.brand} ${item.product.name} - Talle ${item.variant.size}`,
      description: `Botín de fútbol talle ${item.variant.size}`,
      picture_url: item.product.imageUrl,
      currency_id: "ARS",
      quantity: item.quantity,
      unit_price: item.product.price,
    }));

    // Add shipping as an item
    if (shippingCost > 0) {
      mpItems.push({
        id: "shipping",
        title: `Envío - ${customer.shippingZone === "gba-sur" ? "GBA Sur" : "Todo el país"}`,
        description: "Costo de envío",
        picture_url: "",
        currency_id: "ARS",
        quantity: 1,
        unit_price: shippingCost,
      });
    }

    const preference = {
      items: mpItems,
      payer: {
        name: customer.name.split(" ")[0],
        surname: customer.name.split(" ").slice(1).join(" ") || "",
        email: customer.email,
        phone: {
          number: customer.phone.replace(/[^0-9]/g, ""),
        },
        address: {
          street_name: customer.address,
          zip_code: customer.postalCode,
        },
      },
      back_urls: {
        success: `${BASE_URL}/checkout/resultado?status=success&ref=${externalReference}`,
        failure: `${BASE_URL}/checkout/resultado?status=failure&ref=${externalReference}`,
        pending: `${BASE_URL}/checkout/resultado?status=pending&ref=${externalReference}`,
      },
      auto_return: "approved",
      notification_url: `${BASE_URL}/api/mercadopago/webhook`,
      external_reference: externalReference,
      statement_descriptor: "BOTINESALA SUR",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Call MercadoPago API
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": externalReference,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MercadoPago API error:", mpData);
      return NextResponse.json(
        { error: "Error al crear preferencia de pago", details: mpData.message },
        { status: mpResponse.status }
      );
    }

    // Update order with preference ID
    await supabaseAdmin
      .from("orders")
      .update({ mp_preference_id: mpData.id })
      .eq("id", order.id);

    console.log("MercadoPago preference created:", {
      preference_id: mpData.id,
      external_reference: externalReference,
      init_point: mpData.init_point,
    });

    return NextResponse.json({
      success: true,
      init_point: mpData.init_point,
      preference_id: mpData.id,
      external_reference: externalReference,
      order_id: order.id,
    });
  } catch (error) {
    console.error("Create preference error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
