import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/supabase-data";
import { getEventsForOrder } from "@/lib/events-server";

// Actividad de un pedido, para el panel lateral del listado.
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  const eventos = order.externalReference
    ? await getEventsForOrder(order.externalReference)
    : [];
  return NextResponse.json({
    eventos: eventos.map((e) => ({
      id: e.id,
      createdAt: e.createdAt,
      event: e.event,
      source: e.source,
      details: e.details,
    })),
  });
}
