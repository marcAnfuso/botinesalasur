import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logEvent } from "@/lib/events-server";
import { insertarPedido } from "@/lib/insertar-pedido";
import { nombreProlijo, capitalizar, dniProlijo, emailProlijo } from "@/lib/prolijo";
import { nombreProducto } from "@/lib/nombre-producto";
import { valorarCarrito } from "@/lib/valorar-carrito";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.vercel.app";

interface CartItem {
  product: {
    id: string;
    codigo?: number | null;
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
    dni?: string;
    address: string;
    floorApt?: string;
    city: string;
    province: string;
    postalCode: string;
    shippingZone: string;
    shippingZoneLabel?: string;
    notes: string;
  };
  shippingCost: number;
  total: number;
  sessionId?: string;
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
    const { items, customer, sessionId } = data;

    // Nada de lo que vale plata viene del navegador: precios, stock y envío
    // se resuelven acá contra la base.
    const val = await valorarCarrito(
      (items ?? []).map((i) => ({ variantId: i.variant?.id, productId: i.product?.id, quantity: i.quantity })),
      customer?.shippingZone,
      "mercadopago",
      data.total,
      sessionId
    );
    if (!val.ok) {
      return NextResponse.json({ error: val.error, limpiarCarrito: val.limpiarCarrito ?? false }, { status: val.status });
    }
    const { lineas, subtotal, shippingCost, total } = val;

    const email = emailProlijo(customer?.email);
    if (!email) {
      return NextResponse.json(
        { error: "Revisá el email: no parece una dirección válida." },
        { status: 400 }
      );
    }

    // Generate unique reference
    const externalReference = generateExternalReference();

    // Create order in Supabase first
    const { data: order, error: orderError } = await insertarPedido({
      external_reference: externalReference,
      customer_name: nombreProlijo(customer.name),
      customer_email: email,
      customer_phone: customer.phone,
      customer_dni: customer.dni ? dniProlijo(customer.dni) || null : null,
      shipping_address: capitalizar(customer.address),
      shipping_floor_apt: customer.floorApt?.trim().toUpperCase() || null,
      shipping_city: capitalizar(customer.city),
      shipping_province: customer.province,
      shipping_postal_code: customer.postalCode,
      shipping_zone: customer.shippingZone,
      notes: customer.notes,
      subtotal,
      shipping_cost: shippingCost,
      total,
      status: "pending",
      payment_status: "pending",
    });

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      await logEvent("preference_failed", { sessionId, details: { paso: "orden", error: orderError?.message } });
      return NextResponse.json(
        { error: "Error al crear la orden" },
        { status: 500 }
      );
    }

    // Create order items.
    // product_brand and variant_size are NOT NULL in the schema; size and
    // total_price are the columns added by the MercadoPago migration.
    const orderItems = lineas.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      product_code: l.productCode,
      variant_id: l.variantId,
      product_name: l.productName,
      product_brand: l.productBrand,
      variant_size: l.size,
      size: l.size,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      total_price: l.totalPrice,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Without items the order is useless: the webhook cannot decrement
      // stock nor list the products in the emails. Roll the order back
      // instead of sending the customer to pay for an empty order.
      console.error("Error creating order items:", itemsError);
      await logEvent("preference_failed", { ref: externalReference, sessionId, details: { paso: "items", error: itemsError.message } });
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Error al crear la orden" },
        { status: 500 }
      );
    }

    // Build MercadoPago preference
    const mpItems = lineas.map((l) => ({
      id: l.productId,
      title: `${nombreProducto(l.productBrand, l.productName)} - Talle ${l.size}`,
      description: `Botín de fútbol talle ${l.size}`,
      picture_url: l.imageUrl ?? undefined,
      currency_id: "ARS",
      quantity: l.quantity,
      unit_price: l.unitPrice,
    }));

    // Add shipping as an item
    if (shippingCost > 0) {
      mpItems.push({
        id: "shipping",
        title: `Envío - ${val.zonaLabel}`,
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
        email,
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
      await logEvent("preference_failed", {
        ref: externalReference,
        sessionId,
        details: { paso: "mercadopago", status: mpResponse.status, error: mpData?.message ?? mpData?.error ?? null },
      });
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

    await logEvent("preference_created", {

      ref: externalReference,

      sessionId,

      details: { total, items: lineas.length, preferenceId: mpData.id },

    });


    return NextResponse.json({
      success: true,
      init_point: mpData.init_point,
      preference_id: mpData.id,
      external_reference: externalReference,
      numero: order.numero ?? null,
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
