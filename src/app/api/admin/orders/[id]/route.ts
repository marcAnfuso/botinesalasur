import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/supabase-data";
import { supabaseAdmin } from "@/lib/supabase";
import { logEvent } from "@/lib/events-server";
import { OrderStatus } from "@/types";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// PATCH - Cambiar el estado de un pedido.
// Solo el estado de preparación/envío: payment_status lo maneja el webhook.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido: ${status}` },
        { status: 400 }
      );
    }

    const ok = await updateOrderStatus(params.id, status);

    if (!ok) {
      return NextResponse.json(
        { error: "No se pudo actualizar el pedido" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}

// DELETE - Borrar un pedido cancelado.
// Solo los que Alan ya marcó como cancelados y no tienen un pago aprobado:
// así no se puede borrar por error una venta cobrada. Los ítems se van con
// el pedido (ON DELETE CASCADE). El stock no se toca: un pedido sin pagar
// nunca lo descontó.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: pedido, error } = await supabaseAdmin
    .from("orders")
    .select("status, payment_status, numero, external_reference, customer_name, total")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !pedido) {
    return NextResponse.json({ error: "El pedido no existe" }, { status: 404 });
  }
  const p = pedido as { status: string; payment_status: string; numero: number | null; external_reference: string; customer_name: string; total: number };
  if (p.status !== "cancelled") {
    return NextResponse.json(
      { error: "Solo se pueden borrar pedidos cancelados. Marcalo como cancelado primero." },
      { status: 409 }
    );
  }
  if (p.payment_status === "paid") {
    return NextResponse.json(
      { error: "Este pedido tiene un pago aprobado en MercadoPago: no se puede borrar. Si lo devolviste, queda como registro." },
      { status: 409 }
    );
  }

  const { error: errBorrar } = await supabaseAdmin.from("orders").delete().eq("id", params.id);
  if (errBorrar) {
    console.error("Error borrando pedido:", errBorrar);
    return NextResponse.json({ error: "No se pudo borrar el pedido" }, { status: 500 });
  }

  await logEvent("order_deleted", {
    ref: p.external_reference,
    details: { numero: p.numero, cliente: p.customer_name, total: p.total },
  });

  return NextResponse.json({ success: true });
}
