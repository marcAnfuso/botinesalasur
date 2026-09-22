import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nada de esto tiene que aparecer en Google
      disallow: ["/admin", "/api/", "/checkout", "/mi-pedido"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
