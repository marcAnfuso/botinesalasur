"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types";
import { formatCodigo } from "@/lib/codigo";
import { useToast } from "@/components/Toast";

interface AjusteStockProps {
  product: Product;
  onCerrar: () => void;
  onCambio: (variantId: string, stock: number) => void;
}

// Descontar una unidad cuando se vende en el showroom tiene que ser un toque,
// no entrar a editar el producto. Cada cambio se guarda solo; los toques
// seguidos sobre el mismo talle se agrupan para no mandar una llamada por toque.
const ESPERA_MS = 600;

export default function AjusteStock({ product, onCerrar, onCambio }: AjusteStockProps) {
  const [stocks, setStocks] = useState<Record<string, number>>(() =>
    Object.fromEntries(product.variants.map((v) => [v.id, v.stock]))
  );
  const [guardando, setGuardando] = useState<Record<string, boolean>>({});
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const temporizadores = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const ultimoOk = useRef<Record<string, number>>(
    Object.fromEntries(product.variants.map((v) => [v.id, v.stock]))
  );
  const toast = useToast();

  useEffect(() => {
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", esc);
    const pendientes = temporizadores.current;
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", esc);
      // Al cerrar no se pierde lo último tocado
      Object.values(pendientes).forEach(clearTimeout);
    };
  }, [onCerrar]);

  const guardar = async (variantId: string, stock: number) => {
    setGuardando((g) => ({ ...g, [variantId]: true }));
    try {
      const res = await fetch(`/api/admin/variants/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      if (!res.ok) throw new Error();
      ultimoOk.current[variantId] = stock;
      onCambio(variantId, stock);
    } catch {
      // Si falla, el número vuelve a lo último confirmado: que no quede
      // mostrando un stock que la base no tiene.
      setStocks((s) => ({ ...s, [variantId]: ultimoOk.current[variantId] }));
      toast.error("No se pudo guardar el stock. Probá de nuevo.");
    } finally {
      setGuardando((g) => ({ ...g, [variantId]: false }));
    }
  };

  const ajustar = (variantId: string, delta: number) => {
    const actual = stocks[variantId] ?? 0;
    const nuevo = Math.max(0, actual + delta);
    if (nuevo === actual) return;
    setStocks((s) => ({ ...s, [variantId]: nuevo }));
    clearTimeout(temporizadores.current[variantId]);
    temporizadores.current[variantId] = setTimeout(() => guardar(variantId, nuevo), ESPERA_MS);
  };

  const total = Object.values(stocks).reduce((a, b) => a + b, 0);
  const nombre = [product.brand, product.name].filter(Boolean).join(" ");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Stock de ${nombre}`}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-dark/75 backdrop-blur-[2px] cursor-default"
      />

      <div className="relative w-full sm:max-w-sm bg-dark-lighter border-t sm:border border-dark-line shadow-lift animate-rise-in max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-dark-line">
          <div className="min-w-0">
            <h2 className="font-semibold text-white truncate">{nombre}</h2>
            <p className="text-xs text-gray-500 tnum">
              {product.codigo ? `${formatCodigo(product.codigo)} · ` : ""}
              {total} {total === 1 ? "unidad" : "unidades"} en total
            </p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            className="p-1.5 -mr-1.5 text-gray-400 hover:text-white transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {product.variants.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            Este producto no tiene talles cargados.
          </p>
        ) : (
          <ul className="divide-y divide-dark-line overflow-y-auto">
            {product.variants.map((v) => {
              const stock = stocks[v.id] ?? 0;
              return (
                <li key={v.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="flex-1 min-w-0 text-white truncate">
                    Talle <span className="font-medium">{v.size}</span>
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => ajustar(v.id, -1)}
                      disabled={stock === 0}
                      aria-label={`Descontar una unidad del talle ${v.size}`}
                      className="w-11 h-11 flex items-center justify-center rounded border border-dark-line text-white text-xl leading-none hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-dark-line disabled:hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <span
                      className={`w-12 text-center tnum tabular-nums ${
                        stock === 0 ? "text-gray-600" : stock <= 2 ? "text-yellow-500" : "text-white"
                      }`}
                      aria-live="polite"
                    >
                      {stock}
                      {guardando[v.id] && <span className="sr-only"> guardando</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => ajustar(v.id, 1)}
                      aria-label={`Sumar una unidad al talle ${v.size}`}
                      className="w-11 h-11 flex items-center justify-center rounded border border-dark-line text-white text-xl leading-none hover:border-field hover:text-field transition-colors"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="px-5 py-3 border-t border-dark-line text-xs text-gray-500">
          Los cambios se guardan solos y se ven en la tienda enseguida.
        </p>
      </div>
    </div>
  );
}
