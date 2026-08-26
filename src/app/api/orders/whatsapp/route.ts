import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logEvent } from "@/lib/events-server";

interface CartItem {
  product: { id: string; name: string; brand: string; price: number };
  variant: { id: string; size: string };
  quantity: number;
}

interface WhatsAppOrder {
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
    notes?: string;
  };
  shippingCost: number;
  total: number;
  sessionId?: string;
}

function generarReferencia(): string {
  const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const azar = Math.random().toString(36).substring(2, 8).toUpperCase();
  // El prefijo distinto deja ver el canal de un vistazo en el panel.
  return `WA-${hoy}-${azar}`;
}

export async function POST(request: NextRequest) {
  try {
    const data: WhatsAppOrder = await request.json();
    const { items, customer, shippingCost, total, sessionId } = data;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No hay productos en el carrito" },
        { status: 400 }
      );
    }

    const externalReference = generarReferencia();

    const orden = {
      external_reference: externalReference,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: customer.address,
      shipping_city: customer.city,
      shipping_province: customer.province,
      shipping_postal_code: customer.postalCode,
      shipping_zone: customer.shippingZone,
      notes: customer.notes || null,
      subtotal: total - shippingCost,
      shipping_cost: shippingCost,
      total,
      // Queda pendiente a propósito: el pago se acuerda por chat y lo
      // confirma la tienda a mano desde el panel.
      status: "pending",
      payment_status: "pending",
      channel: "whatsapp",
    };

    let creada = await supabaseAdmin
      .from("orders")
      .insert(orden)
      .select()
      .single();

    // La columna channel llega con supabase-migration-envios.sql. Si todavía
    // no se corrió, el pedido igual tiene que quedar registrado.
    if (creada.error && /channel/i.test(creada.error.message)) {
      const { channel, ...sinCanal } = orden;
      creada = await supabaseAdmin
        .from("orders")
        .insert(sinCanal)
        .select()
        .single();
    }

    if (creada.error || !creada.data) {
      console.error("Error creating WhatsApp order:", creada.error);
      await logEvent("whatsapp_order_failed", { sessionId, details: { paso: "orden", error: creada.error?.message } });
      return NextResponse.json(
        { error: "No se pudo registrar el pedido" },
        { status: 500 }
      );
    }

    const orderId = creada.data.id;

    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.product.id,
      variant_id: item.variant.id,
      product_name: item.product.name,
      product_brand: item.product.brand,
      variant_size: item.variant.size,
      size: item.variant.size,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }));

    const { error: errorItems } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (errorItems) {
      // Sin items el pedido no sirve para nada: se revierte.
      console.error("Error creating WhatsApp order items:", errorItems);
      await logEvent("whatsapp_order_failed", { ref: externalReference, sessionId, details: { paso: "items", error: errorItems.message } });
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return NextResponse.json(
        { error: "No se pudo registrar el pedido" },
        { status: 500 }
      );
    }

    await logEvent("whatsapp_order_created", {
      ref: externalReference,
      sessionId,
      details: { total, items: items.length },
    });

    return NextResponse.json({
      success: true,
      orderId,
      externalReference,
    });
  } catch (error) {
    console.error("Error in WhatsApp order:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el pedido" },
      { status: 500 }
    );
  }
}
