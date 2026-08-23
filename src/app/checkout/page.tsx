import { getShippingZones } from "@/lib/shipping";
import CheckoutClient from "./CheckoutClient";

// Los costos de envío se editan desde el panel: no se cachean.
export const revalidate = 0;

export default async function CheckoutPage() {
  const zonas = await getShippingZones();
  return <CheckoutClient zonas={zonas} />;
}
