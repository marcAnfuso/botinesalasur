import type { MetadataRoute } from "next";
import { getProducts, categories } from "@/lib/supabase-data";

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
    ...categories.map((c) => ({
      url: `${BASE_URL}/catalogo?categoria=${c.slug}`,
      lastModified: ahora,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${BASE_URL}/producto/${p.id}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : ahora,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
