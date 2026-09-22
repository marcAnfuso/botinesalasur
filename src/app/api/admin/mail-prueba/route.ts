import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  destinatariosAviso,
  sendNewOrderNotification,
  sendOrderConfirmationEmail,
  sendPendingPaymentEmail,
} from "@/lib/email";

// Manda los tres mails con un pedido de ejemplo a una casilla, para ver cómo
// llegan sin tener que comprar. Protegido por el middleware del panel.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const a = String(body?.to ?? "").trim() || destinatariosAviso()[0];
  if (!a || !a.includes("@")) {
    return NextResponse.json({ error: "Falta una casilla de destino" }, { status: 400 });
  }

  // Productos reales, para que se vean fotos y códigos de verdad
  const { data: productos } = await supabaseAdmin
    .from("products")
    .select("name, brand, codigo, image_url, price")
    .eq("active", true)
    .not("image_url", "is", null)
    .limit(2);
  const items = (productos ?? []).map((p, i) => ({
    productName: [p.brand, p.name].filter(Boolean).join(" "),
    productCode: p.codigo ?? null,
    imageUrl: p.image_url ?? null,
    size: i === 0 ? "42ARG" : "40ARG",
    quantity: i === 0 ? 1 : 2,
    unitPrice: Number(p.price),
    totalPrice: Number(p.price) * (i === 0 ? 1 : 2),
  }));
  const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);

  const datos = {
    orderId: "00000000-0000-0000-0000-000000000000",
    externalReference: "BOTS-PRUEBA-000000",
    numero: 1234,
    customerName: "PRUEBA DE MAIL",
    customerEmail: a,
    customerPhone: "11 2323-7214",
    customerDni: "31234567",
    shippingAddress: "Manuel Castro 444",
    shippingFloorApt: "2° K",
    shippingCity: "Lomas de Zamora",
    shippingProvince: "Buenos Aires",
    shippingPostalCode: "1832",
    shippingZone: "coordinar",
    shippingZoneLabel: "Coordinar con el vendedor",
    notes: "Esto es un mail de prueba mandado desde el panel. No es una venta.",
    items,
    subtotal,
    shippingCost: 0,
    total: subtotal,
    paymentId: "000000000000",
    paymentMethod: "credit_card",
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const resultados = {
    aviso: await sendNewOrderNotification(datos, [a]),
    confirmacion: await sendOrderConfirmationEmail(datos),
    pendiente: await sendPendingPaymentEmail(datos),
  };
  const fallidos = Object.entries(resultados).filter(([, r]) => !r.success).map(([k]) => k);
  if (fallidos.length === 3) {
    return NextResponse.json(
      { error: "No se pudo mandar ninguno. ¿Está configurado Resend en Vercel?" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, a, fallidos });
}
