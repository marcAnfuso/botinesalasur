import { supabaseAdmin } from "./supabase";
import { getShippingZones } from "./shipping";
import { logEvent } from "./events-server";

// El navegador manda qué talles y cuántos; el precio, el stock y el envío
// los pone el servidor mirando la base. Es lo que impide que alguien edite
// el pedido en el navegador y pague $1 por un botín, o compre un talle que
// ya no está.

export interface ItemPedido {
  variantId: string;
  productId: string;
  quantity: number;
}

export interface LineaValorada {
  productId: string;
  variantId: string;
  productName: string;
  productBrand: string;
  productCode: number | null;
  imageUrl: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type Valoracion =
  | { ok: true; lineas: LineaValorada[]; subtotal: number; shippingCost: number; total: number; zonaLabel: string; zonaSlug: string }
  | { ok: false; status: number; error: string; limpiarCarrito?: boolean };

export async function valorarCarrito(
  items: ItemPedido[],
  zonaSlug: string,
  modo: "mercadopago" | "transferencia",
  totalCliente: number | undefined,
  sessionId: string | null | undefined
): Promise<Valoracion> {
  const limpios = (items ?? [])
    .map((i) => ({ variantId: String(i.variantId ?? ""), productId: String(i.productId ?? ""), quantity: Math.floor(Number(i.quantity)) }))
    .filter((i) => i.variantId && i.productId && i.quantity > 0 && i.quantity <= 10);
  if (limpios.length === 0) return { ok: false, status: 400, error: "No hay productos en el carrito" };

  const { data: variantes, error } = await supabaseAdmin
    .from("product_variants")
    .select("id, size, stock, product_id, products(id, name, brand, codigo, image_url, price, transfer_price, active)")
    .in("id", limpios.map((i) => i.variantId));
  if (error) return { ok: false, status: 500, error: "No pudimos verificar los productos" };

  const porId = new Map<string, any>((variantes ?? []).map((v: any) => [v.id, v]));
  const lineas: LineaValorada[] = [];
  for (const it of limpios) {
    const v = porId.get(it.variantId);
    const p = v?.products;
    if (!v || !p || v.product_id !== it.productId || p.id !== it.productId) {
      return { ok: false, status: 409, error: "Uno de los productos del carrito ya no existe. Volvé a armarlo.", limpiarCarrito: true };
    }
    if (!p.active) {
      return { ok: false, status: 409, error: `${p.brand} ${p.name} ya no está a la venta.`, limpiarCarrito: true };
    }
    if (v.stock < it.quantity) {
      return {
        ok: false,
        status: 409,
        error: v.stock > 0
          ? `Del ${p.brand} ${p.name} talle ${v.size} quedan ${v.stock}. Bajá la cantidad.`
          : `El ${p.brand} ${p.name} talle ${v.size} se acaba de agotar.`,
        limpiarCarrito: v.stock === 0,
      };
    }
    const precio = Number(modo === "transferencia" && p.transfer_price != null ? p.transfer_price : p.price);
    lineas.push({
      productId: p.id,
      variantId: v.id,
      productName: p.name,
      productBrand: p.brand,
      productCode: p.codigo ?? null,
      imageUrl: p.image_url ?? null,
      size: v.size,
      quantity: it.quantity,
      unitPrice: precio,
      totalPrice: precio * it.quantity,
    });
  }

  const zonas = await getShippingZones();
  const zona = zonas.find((z) => z.slug === zonaSlug);
  if (!zona) return { ok: false, status: 400, error: "Elegí cómo querés recibir el pedido." };

  const subtotal = lineas.reduce((s, l) => s + l.totalPrice, 0);
  const total = subtotal + zona.cost;

  // Si el navegador dice otro total, o cambió un precio mientras armaba el
  // carrito, o alguien tocó el pedido a mano. En los dos casos: no se sigue,
  // y queda registrado para verlo en Actividad.
  if (typeof totalCliente === "number" && Math.round(totalCliente) !== Math.round(total)) {
    await logEvent("price_mismatch", {
      sessionId: sessionId ?? null,
      details: { cliente: totalCliente, servidor: total, modo, items: limpios },
    });
    return {
      ok: false,
      status: 409,
      error: "Los precios se actualizaron mientras armabas el pedido. Volvé a agregar los productos al carrito.",
      limpiarCarrito: true,
    };
  }

  return { ok: true, lineas, subtotal, shippingCost: zona.cost, total, zonaLabel: zona.label, zonaSlug: zona.slug };
}
