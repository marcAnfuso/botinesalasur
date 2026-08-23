"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

// El panel trae su propia navegación: mostrarle además el header y el footer
// de la tienda dejaba dos barras superpuestas.
// El header y el pie llegan ya renderizados desde el layout, que es un server
// component: el pie consulta los costos de envío y no puede ser hijo directo
// de un componente cliente.
export default function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
      {footer}
    </>
  );
}
