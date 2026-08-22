"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Fútsal", href: "/catalogo?categoria=futsal" },
  { label: "Sintético", href: "/catalogo?categoria=sintetico" },
  { label: "Fútbol 11", href: "/catalogo?categoria=futbol11" },
  { label: "Accesorios", href: "/catalogo?categoria=accesorios" },
];

// useSearchParams obliga a una frontera de Suspense: vive acá y no en el
// Header, para que el resto del sitio siga prerenderizándose estático.
function useIsActive() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria");

  return (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    const cat = query?.split("=")[1];
    return cat ? categoria === cat : !categoria;
  };
}

export function NavDesktop() {
  const isActive = useIsActive();

  return (
    <nav className="hidden lg:flex items-center gap-7">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-5 text-sm transition-colors ${
              active ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {item.label}
            <span
              aria-hidden
              className={`absolute left-0 right-0 bottom-0 h-[2px] bg-primary origin-left transition-transform duration-200 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function NavMobile({ onNavigate }: { onNavigate: () => void }) {
  const isActive = useIsActive();

  return (
    <div className="flex flex-col">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`display-tight text-xl py-3 border-b border-dark-line/60 transition-colors ${
            isActive(item.href)
              ? "text-primary"
              : "text-gray-300 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

// Mismo espacio ocupado mientras Suspense resuelve, para que no salte el header
export function NavDesktopFallback() {
  return (
    <nav className="hidden lg:flex items-center gap-7" aria-hidden>
      {NAV.map((item) => (
        <span key={item.href} className="py-5 text-sm text-gray-400">
          {item.label}
        </span>
      ))}
    </nav>
  );
}
