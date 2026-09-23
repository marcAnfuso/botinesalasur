import { Product } from "@/types";
import { nombreProducto } from "./nombre-producto";

// "/producto/nike-street-gato-tiempo-32": el nombre en la URL lo leen Google
// y la gente; el código al final es lo que identifica al producto, así que
// si el nombre cambia la URL vieja sigue resolviendo (y redirige a la nueva).
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export function urlProducto(p: Pick<Product, "id" | "brand" | "name" | "codigo">): string {
  if (!p.codigo) return `/producto/${p.id}`;
  const slug = slugify(nombreProducto(p.brand, p.name)) || "botin";
  return `/producto/${slug}-${p.codigo}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Qué llegó en la URL: un id viejo (uuid), o un slug que termina en el código
export function leerParamProducto(param: string): { id: string } | { codigo: number } | null {
  if (UUID.test(param)) return { id: param };
  const m = param.match(/-(\d{1,8})$/) ?? param.match(/^(\d{1,8})$/);
  return m ? { codigo: Number(m[1]) } : null;
}
