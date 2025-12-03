import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Botinesala Sur | Botines de Fútbol al Mejor Precio",
  description:
    "Botines de fútsal, sintético y fútbol 11 a los mejores precios. Envíos a toda Argentina. Showroom en Llavallol, GBA Sur.",
  keywords: [
    "botines",
    "futbol",
    "futsal",
    "sintetico",
    "adidas",
    "nike",
    "puma",
    "llavallol",
    "gba sur",
    "argentina",
  ],
  openGraph: {
    title: "Botinesala Sur | Botines de Fútbol al Mejor Precio",
    description:
      "Botines de fútsal, sintético y fútbol 11 a los mejores precios. Envíos a toda Argentina.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
