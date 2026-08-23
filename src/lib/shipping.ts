import { supabase, supabaseAdmin } from "./supabase";

export interface ShippingZone {
  slug: string;
  label: string;
  description: string | null;
  cost: number;
  sortOrder: number;
}

// Los valores que estuvieron escritos en el código hasta que existió la
// tabla. Se usan como respaldo para que la tienda siga cobrando envío
// aunque la migración todavía no se haya corrido.
export const ZONAS_POR_DEFECTO: ShippingZone[] = [
  {
    slug: "gba-sur",
    label: "GBA Sur",
    description: "Llavallol, Lanús, Lomas y alrededores. Envío en moto.",
    cost: 2500,
    sortOrder: 1,
  },
  {
    slug: "otro",
    label: "Todo el país",
    description: "Envío por correo al resto de Argentina.",
    cost: 5500,
    sortOrder: 2,
  },
];

function transformZone(row: {
  slug: string;
  label: string;
  description: string | null;
  cost: number;
  sort_order: number;
}): ShippingZone {
  return {
    slug: row.slug,
    label: row.label,
    description: row.description,
    cost: row.cost,
    sortOrder: row.sort_order,
  };
}

export async function getShippingZones(): Promise<ShippingZone[]> {
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("slug, label, description, cost, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    // La tabla puede no existir todavía: no es motivo para romper el checkout.
    if (error) console.error("Error fetching shipping zones:", error.message);
    return ZONAS_POR_DEFECTO;
  }

  return data.map(transformZone);
}

export async function updateShippingZone(
  slug: string,
  cambios: { cost?: number; label?: string; description?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (cambios.cost !== undefined) update.cost = cambios.cost;
  if (cambios.label !== undefined) update.label = cambios.label;
  if (cambios.description !== undefined) update.description = cambios.description;

  const { error } = await supabaseAdmin
    .from("shipping_zones")
    .update(update)
    .eq("slug", slug);

  if (error) {
    console.error("Error updating shipping zone:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// Mapa slug -> costo, que es lo que necesita el checkout para calcular.
export function costosPorZona(zonas: ShippingZone[]): Record<string, number> {
  return Object.fromEntries(zonas.map((z) => [z.slug, z.cost]));
}
