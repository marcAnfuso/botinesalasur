import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nada de esto tiene que aparecer en Google
        disallow: ["/admin", "/api/", "/checkout", "/mi-pedido"],
      },
      // Los rastreadores de los asistentes de IA, permitidos a propósito: si
      // alguien le pregunta a ChatGPT o Perplexity dónde comprar botines en
      // Zona Sur, tienen que haber leído el sitio.
      ...["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"].map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/mi-pedido"],
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
