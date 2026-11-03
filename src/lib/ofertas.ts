import type { Product } from "@/types";

// Un producto está en oferta cuando tiene un "precio antes" cargado y es
// mayor que el precio actual. Lo que se cobra es siempre el precio actual.
export function enOferta(p: Pick<Product, "price" | "comparePrice">): boolean {
  return p.comparePrice != null && p.comparePrice > p.price;
}

// Porcentaje redondeado hacia abajo: nunca prometer más descuento del real.
export function descuentoOferta(p: Pick<Product, "price" | "comparePrice">): number {
  if (!enOferta(p)) return 0;
  return Math.floor((1 - p.price / (p.comparePrice as number)) * 100);
}
