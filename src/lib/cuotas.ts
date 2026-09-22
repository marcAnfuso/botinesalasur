// Cuotas sin interés: las activa el VENDEDOR en su cuenta de MercadoPago
// (absorbe el costo de financiación); la integración no puede forzarlas.
// Hasta que estén activas de verdad, la tienda no las promete. Se prende
// con NEXT_PUBLIC_CUOTAS_SIN_INTERES=3 en Vercel (y redeploy).
export const CUOTAS_SIN_INTERES = Math.max(
  0,
  Math.floor(Number(process.env.NEXT_PUBLIC_CUOTAS_SIN_INTERES ?? 0)) || 0
);
