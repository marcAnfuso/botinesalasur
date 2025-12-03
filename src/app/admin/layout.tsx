"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Simulación de autenticación - esto se reemplazará con Supabase Auth
const ADMIN_PASSWORD = "botinesalasur2024"; // Cambiar esto en producción

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Verificar si ya está autenticado
    const auth = localStorage.getItem("admin-auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin-auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold text-xl">BAS</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
            <p className="text-gray-400 mt-2">Botinesala Sur</p>
          </div>

          <form onSubmit={handleLogin} className="bg-dark-card rounded-xl p-6">
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Ingresá la contraseña"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full">
              Ingresar
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            <Link href="/" className="hover:text-white transition-colors">
              Volver a la tienda
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Admin Header */}
      <header className="bg-dark-lighter border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">BAS</span>
                </div>
                <span className="font-semibold text-white">Admin</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/admin"
                  className={`text-sm transition-colors ${
                    pathname === "/admin"
                      ? "text-primary"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/productos"
                  className={`text-sm transition-colors ${
                    pathname?.startsWith("/admin/productos")
                      ? "text-primary"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Productos
                </Link>
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
