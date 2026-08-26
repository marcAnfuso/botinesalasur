import { Suspense } from "react";
import { getOrders } from "@/lib/supabase-data";
import PedidosAdminClient from "./PedidosAdminClient";

// Los pedidos cambian seguido: no cachear
export const revalidate = 0;

export default async function PedidosAdminPage() {
  const orders = await getOrders();

  return (
    <Suspense fallback={null}>
      <PedidosAdminClient initialOrders={orders} />
    </Suspense>
  );
}
