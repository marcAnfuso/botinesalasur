import { getShippingZones } from "@/lib/shipping";
import EnviosClient from "./EnviosClient";

export const revalidate = 0;

export default async function EnviosAdminPage() {
  const zonas = await getShippingZones();
  return <EnviosClient zonasIniciales={zonas} />;
}
