// El código corto de un producto, como se muestra en toda la tienda: #0042.
// Los productos anteriores a la migración de códigos no tienen; se devuelve "".
export function formatCodigo(codigo?: number | null): string {
  if (!codigo && codigo !== 0) return "";
  return `#${String(codigo).padStart(4, "0")}`;
}
