import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/supabase-data";
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
