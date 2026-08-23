"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

// El panel trae su propia navegación: mostrarle además el header y el footer
// de la tienda dejaba dos barras superpuestas y el pie de la tienda al final
// de cada pantalla de trabajo.
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const esPanel = pathname?.startsWith("/admin");

  if (esPanel) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
