// Cuotas sin interés: las activa el VENDEDOR en su cuenta de MercadoPago
// (Costos y cuotas → Checkout → Por ofrecer cuotas); absorbe el costo de
// financiación y la integración no puede forzarlas. Activadas el 22-9-2026
// hasta 3 cuotas, así que 3 es el valor por defecto. Si algún día las apagan
// en la cuenta, NEXT_PUBLIC_CUOTAS_SIN_INTERES=0 en Vercel (y redeploy)
// saca el anuncio de la tienda.
const crudo = process.env.NEXT_PUBLIC_CUOTAS_SIN_INTERES;
export const CUOTAS_SIN_INTERES =
  crudo === undefined || crudo === "" ? 3 : Math.max(0, Math.floor(Number(crudo)) || 0);
