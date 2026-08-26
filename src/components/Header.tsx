"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { NavDesktop, NavDesktopFallback, NavMobile } from "./HeaderNav";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-dark-line bg-dark/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/images/logo-botinesalasur-circular.png"
                alt=""
                width={40}
                height={40}
                priority
                className="w-9 h-9 rounded-full"
              />
              <span className="display-tight text-lg hidden sm:block">
                Botinesala<span className="text-primary">Sur</span>
              </span>
            </Link>

            <Suspense fallback={<NavDesktopFallback />}>
              <NavDesktop />
            </Suspense>

            <div className="flex items-center gap-1">
              <Link
                href="/catalogo?buscar=1"
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Buscar en el catálogo"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                aria-label={
                  totalItems > 0
                    ? `Ver carrito, ${totalItems} ${totalItems === 1 ? "producto" : "productos"}`
                    : "Ver carrito"
                }
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMenuOpen}
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <nav className="lg:hidden pb-4 border-t border-dark-line animate-fadeIn">
              <Suspense fallback={null}>
                <NavMobile onNavigate={() => setIsMenuOpen(false)} />
              </Suspense>
            </nav>
          )}
        </div>
      </header>

      <div className="h-16" />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
