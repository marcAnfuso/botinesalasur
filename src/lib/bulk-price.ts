// Cálculo de precios en lote. Módulo propio para que el cliente pueda
// previsualizar exactamente lo mismo que después aplica el servidor.

export type BulkPriceMode = "percent" | "amount" | "fixed";

export const BULK_PRICE_MODES: BulkPriceMode[] = ["percent", "amount", "fixed"];

// Los precios se guardan como enteros (pesos sin centavos).
export function calcularPrecio(
  actual: number,
  mode: BulkPriceMode,
  value: number,
  redondear: boolean
): number {
  let nuevo: number;

  switch (mode) {
    case "percent":
      nuevo = actual * (1 + value / 100);
      break;
    case "amount":
      nuevo = actual + value;
      break;
    case "fixed":
      nuevo = value;
      break;
    default:
      nuevo = actual;
  }

  nuevo = redondear ? Math.round(nuevo / 100) * 100 : Math.round(nuevo);

  // La columna tiene CHECK (price >= 0): nunca devolvemos negativos.
  return Math.max(0, nuevo);
}
