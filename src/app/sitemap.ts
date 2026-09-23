import type { MetadataRoute } from "next";
import { getProducts, categories } from "@/lib/supabase-data";
import { urlProducto } from "@/lib/producto-url";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.com.ar";

// Se regenera cada hora: alcanza para que un producto nuevo entre al índice.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const ahora = new Date();
  return [
    { url: `${BASE_URL}/`, lastModified: ahora, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/catalogo`, lastModified: ahora, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/botines-zona-sur`, lastModified: ahora, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/nosotros`, lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/envios-y-cambios`, lastModified: ahora, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/preguntas-frecuentes`, lastModified: ahora, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${BASE_URL}/botines/${c.slug}`,
      lastModified: ahora,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${BASE_URL}${urlProducto(p)}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : ahora,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
