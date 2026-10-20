/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Las fotos viven en Supabase Storage, que las manda con
    // `cache-control: no-cache`. Next 14 respeta eso y sólo retiene la
    // imagen optimizada 60 segundos: en el ciclo de octubre de 2026 cada
    // variante se regeneró ~46 veces (72.900 transformaciones para ~1.600
    // variantes posibles), USD 6 de los 6,5 que consumía el proyecto.
    // Con un año de TTL se genera una vez y listo. No hay riesgo de servir
    // una foto vieja: al resubir, el archivo cambia de nombre (timestamp).
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Por defecto Next genera 16 anchos por foto, hasta 3840 px, para
    // fotos de producto de 350 KB. Con estos alcanza (misma config que
    // russo-prop): 4 para pantallas + 4 para miniaturas.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    formats: ["image/webp"],
  },
};

export default nextConfig;
