"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

// La autenticación la resuelve el middleware contra una cookie httpOnly
// firmada en el servidor. Este layout ya no conoce la contraseña.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // El login se muestra sin la navegación del panel
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      // Aunque falle la llamada, mandamos al login
    }
    router.push("/admin/login");
    router.refresh();
  };

  const navLink = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        active ? "text-primary" : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-dark">
      {/* Admin Header */}
      <header className="bg-dark-lighter border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <Image
                  src="/images/logo-botinesalasur-circular.png"
                  alt="Botinesala Sur"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-white">Admin</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                {navLink("/admin", "Dashboard", pathname === "/admin")}
                {navLink(
                  "/admin/productos",
                  "Productos",
                  Boolean(pathname?.startsWith("/admin/productos"))
                )}
                {navLink(
                  "/admin/pedidos",
                  "Pedidos",
                  Boolean(pathname?.startsWith("/admin/pedidos"))
                )}
                {navLink(
                  "/admin/envios",
                  "Envíos",
                  Boolean(pathname?.startsWith("/admin/envios"))
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Ver tienda
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 text-sm transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
