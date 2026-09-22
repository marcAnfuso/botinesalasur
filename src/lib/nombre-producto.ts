// "Joma" + "Joma Top Flex Rebound" no puede mostrarse como "Joma Joma Top
// Flex Rebound": si el nombre ya arranca con la marca, la marca no se repite.
export function nombreProducto(brand?: string | null, name?: string | null): string {
  const b = (brand ?? "").trim();
  const n = (name ?? "").trim();
  if (!b) return n;
  if (!n) return b;
  return n.toLowerCase().startsWith(b.toLowerCase()) ? n : `${b} ${n}`;
}
