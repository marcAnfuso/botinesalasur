// El cliente ve "#1043". El código largo (BOTS-…) es la referencia interna
// para MercadoPago y sólo aparece si el número todavía no existe.
export function numeroPedido(numero?: number | null, fallback?: string | null): string {
  if (numero != null && numero > 0) return `#${numero}`;
  return fallback ?? "";
}

// "#1043", "1043" o " # 1043 " → 1043; cualquier otra cosa → null
export function leerNumeroPedido(texto: string): number | null {
  const m = texto.trim().match(/^#?\s*(\d{1,8})$/);
  return m ? Number(m[1]) : null;
}
