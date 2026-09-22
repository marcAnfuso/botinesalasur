import type { Metadata } from "next";
import { jsonLdTienda } from "@/lib/seo";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SiteChrome from "@/components/SiteChrome";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Voz de titulares: grotesca condensada, peso 900, itálica real.
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://botinesalasur.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Botinesala Sur | Botines para fútsal, sintético y fútbol 11",
    template: "%s | Botinesala Sur",
  },
  description:
    "Botines de fútsal, sintético y fútbol 11 al mejor precio. Envíos a todo el país y showroom en Llavallol, GBA Sur.",
  keywords: [
    "botines",
    "futbol",
    "futsal",
    "sintetico",
    "futbol 11",
    "llavallol",
    "gba sur",
    "argentina",
  ],
  openGraph: {
    title: "Botinesala Sur | Botines para fútsal, sintético y fútbol 11",
    description:
      "Botines de fútsal, sintético y fútbol 11 al mejor precio. Envíos a todo el país y showroom en Llavallol.",
    type: "website",
    locale: "es_AR",
    siteName: "Botinesala Sur",
    url: BASE_URL,
    // La miniatura que muestran WhatsApp, Instagram y Facebook al compartir un link
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Botinesala Sur — botines para fútsal, sintético y fútbol 11" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  // Token de Google Search Console (no es secreto: es el mismo que va en el
  // DNS). Permite verificar la propiedad por etiqueta HTML.
  verification: { google: "ysmq6dqwq0Vkd1lLeAvPwc-QXyBM3DmPWLDBb0QE7PM" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${archivo.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTienda) }}
        />
        {/* El contrato de diseño se emite como comentario HTML real: React
            descarta los comentarios JSX y el build los borraría. */}
        <div
          dangerouslySetInnerHTML={{
            __html: `<!--
  THESIS: la tienda se ordena por dónde se juega, no por marca ni por grilla
  neutra de e-commerce; la cancha es la puerta de entrada.
  OWN-WORLD: negro de showroom nocturno, rojo señal del logo, blanco tiza de
  línea de cal. Titulares Archivo 900 itálica en mayúsculas apretadas, como
  estampado de camiseta. Reglas de 1px en vez de cards blandas; foto a sangre.
  STORY: el jugador reconoce su cancha, ve talle y precio sin preguntar, y
  compra online o sigue por WhatsApp.
  FIRST VIEWPORT: titular a dos líneas a la izquierda, "Tu próxima jugada /
  empieza acá" con la segunda en rojo; debajo las tres canchas enlazadas, el
  párrafo y dos acciones; a la derecha la foto del showroom, sangrando al
  borde derecho (en teléfono, debajo del texto).
  FORM: rediseño con dirección fijada por el mockup del cliente.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, DESIGN.md, and every shipping raster carrying its
  provenance.
-->`,
          }}
        />
        <CartProvider>
          <ToastProvider>
            <SiteChrome header={<Header />} footer={<Footer />}>
              {children}
            </SiteChrome>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
