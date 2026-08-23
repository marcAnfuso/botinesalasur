import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import SiteChrome from "@/components/SiteChrome";

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
  },
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
  FIRST VIEWPORT: titular a tres líneas a la izquierda con "fútsal, sintético y
  fútbol 11" en rojo, tres pruebas en línea y dos acciones; a la derecha el
  botín sobre la pelota, sangrando al borde derecho.
  FORM: rediseño con dirección fijada por el mockup del cliente.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, DESIGN.md, and every shipping raster carrying its
  provenance.
-->`,
          }}
        />
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
