import type { Metadata } from "next";
import MiPedidoClient from "./MiPedidoClient";

export const metadata: Metadata = {
  title: "Mi pedido",
  description: "Consultá el estado de tu compra con la referencia y tu mail.",
  robots: { index: false },
};

export default function MiPedidoPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return <MiPedidoClient refInicial={searchParams.ref ?? ""} />;
}
