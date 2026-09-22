import { supabaseAdmin } from "./supabase";

// Cada migración agrega columnas a orders, y los chicos las corren cuando
// pueden. Un pedido no puede fallar porque una columna todavía no existe:
// si PostgREST no la encuentra, se saca esa columna y se reintenta.
const COLUMNA_INEXISTENTE = /Could not find the '(\w+)' column|column "?(\w+)"? .* does not exist/i;

export async function insertarPedido(
  orden: Record<string, unknown>
): Promise<{ data: Record<string, any> | null; error: { message: string } | null }> {
  let fila: Record<string, unknown> = { ...orden };
  for (let intento = 0; intento < 5; intento++) {
    const r = await supabaseAdmin.from("orders").insert(fila).select().single();
    if (!r.error) return { data: r.data as Record<string, any>, error: null };
    const m = r.error.message.match(COLUMNA_INEXISTENTE);
    const columna = m?.[1] ?? m?.[2];
    if (!columna || !(columna in fila)) return { data: null, error: r.error };
    console.warn(`orders: la columna ${columna} no existe todavía; el pedido se guarda sin ella`);
    const { [columna]: _omitida, ...resto } = fila;
    fila = resto;
  }
  return { data: null, error: { message: "Demasiadas columnas faltantes en orders" } };
}
