import { revalidatePath } from "next/cache";

// Las páginas de la tienda se cachean (ISR de 60 s). Cuando el panel cambia
// un producto, un precio o el stock, sin esto el cambio tarda hasta un
// minuto en verse y parece que no se guardó.
export function revalidarTienda() {
  revalidatePath("/", "layout");
}
