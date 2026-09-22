import { Product } from "@/types";
import { nombreProducto } from "./nombre-producto";
import { formatCodigo } from "./codigo";
import { categories } from "./supabase-data";
import { TIENDA } from "./tienda";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.com.ar";

export function nombreCategoria(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function urlAbsoluta(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Descripción corta para Google y para la vista previa al compartir
export function descripcionProducto(p: Product): string {
  const nombre = nombreProducto(p.brand, p.name);
  const talles = p.variants.filter((v) => v.stock > 0).map((v) => v.size);
  const base = p.description?.trim() || `${nombre}, botines de ${nombreCategoria(p.category).toLowerCase()}.`;
  const extra = talles.length ? ` Talles disponibles: ${talles.slice(0, 6).join(", ")}.` : "";
  const texto = `${base}${extra} Envíos a todo el país y showroom en Llavallol.`;
  return texto.length > 160 ? texto.slice(0, 157).replace(/\s+\S*$/, "") + "…" : texto;
}

// Schema.org Product: es lo que hace que Google muestre precio y stock en el
// resultado. El código corto va como SKU.
export function jsonLdProducto(p: Product) {
  const hayStock = p.variants.some((v) => v.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: nombreProducto(p.brand, p.name),
    image: [urlAbsoluta(p.imageUrl)],
    description: descripcionProducto(p),
    sku: p.codigo ? formatCodigo(p.codigo).replace("#", "") : undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    category: nombreCategoria(p.category),
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/producto/${p.id}`,
      priceCurrency: "ARS",
      price: p.price,
      availability: hayStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Botinesala Sur" },
    },
  };
}

export const jsonLdTienda = {
  "@context": "https://schema.org",
  "@type": "SportingGoodsStore",
  name: "Botinesala Sur",
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo-botinesalasur.png`,
  image: `${BASE_URL}/og.jpg`,
  description: "Botines de fútsal, sintético y fútbol 11. Envíos a todo el país y showroom en Llavallol, GBA Sur.",
  address: {
    "@type": "PostalAddress",
    ...(TIENDA.direccion ? { streetAddress: TIENDA.direccion } : {}),
    addressLocality: TIENDA.localidad,
    addressRegion: TIENDA.provincia,
    addressCountry: "AR",
  },
  geo: { "@type": "GeoCoordinates", latitude: TIENDA.geo.lat, longitude: TIENDA.geo.lng },
  areaServed: [TIENDA.partido, "Lanús", "Almirante Brown", "Esteban Echeverría", "Zona Sur del Gran Buenos Aires", "Argentina"].map((n) => ({ "@type": "Place", name: n })),
  sameAs: [TIENDA.instagram],
  currenciesAccepted: "ARS",
  paymentAccepted: "MercadoPago, transferencia, efectivo",
};
