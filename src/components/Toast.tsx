"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Avisos flotantes: aparecen en el centro de la pantalla, no bloquean nada
// y se van solos. Para confirmar una acción ("Guardado", "Agregado al
// carrito") sin dejar un cartel pegado arriba de la página.

type Tono = "ok" | "error" | "info";

interface Aviso {
  id: number;
  texto: string;
  tono: Tono;
  saliendo: boolean;
}

interface ToastApi {
  success: (texto: string) => void;
  error: (texto: string) => void;
  info: (texto: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURACION: Record<Tono, number> = { ok: 2600, info: 3200, error: 5000 };
const SALIDA_MS = 220;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguiente = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const quitar = useCallback((id: number) => {
    setAvisos((prev) => prev.map((a) => (a.id === id ? { ...a, saliendo: true } : a)));
    const t = setTimeout(() => {
      setAvisos((prev) => prev.filter((a) => a.id !== id));
      timers.current.delete(id);
    }, SALIDA_MS);
    timers.current.set(id, t);
  }, []);

  const mostrar = useCallback(
    (texto: string, tono: Tono) => {
      const id = siguiente.current++;
      // Un aviso a la vez: el nuevo reemplaza al anterior en vez de apilarse
      setAvisos((prev) => {
        prev.forEach((a) => {
          const t = timers.current.get(a.id);
          if (t) clearTimeout(t);
        });
        return [{ id, texto, tono, saliendo: false }];
      });
      const t = setTimeout(() => quitar(id), DURACION[tono]);
      timers.current.set(id, t);
    },
    [quitar]
  );

  useEffect(() => {
    const mapa = timers.current;
    return () => mapa.forEach((t) => clearTimeout(t));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (t) => mostrar(t, "ok"),
      error: (t) => mostrar(t, "error"),
      info: (t) => mostrar(t, "info"),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center px-4"
      >
        {avisos.map((a) => (
          <div
            key={a.id}
            role={a.tono === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-center gap-3 max-w-md border px-5 py-3.5 shadow-lift backdrop-blur-md transition-all duration-200 ease-out ${
              a.saliendo ? "opacity-0 translate-y-1 scale-[0.98]" : "opacity-100 translate-y-0 scale-100 animate-rise-in"
            } ${
              a.tono === "ok"
                ? "border-field/40 bg-dark-lighter/95 text-white"
                : a.tono === "error"
                ? "border-red-500/50 bg-dark-lighter/95 text-white"
                : "border-dark-line bg-dark-lighter/95 text-white"
            }`}
          >
            <span
              aria-hidden
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                a.tono === "ok"
                  ? "bg-field/20 text-field"
                  : a.tono === "error"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-white/10 text-gray-300"
              }`}
            >
              {a.tono === "ok" ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : a.tono === "error" ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                </svg>
              )}
            </span>
            <p className="text-sm font-medium leading-snug">{a.texto}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fuera del provider (no debería pasar): no rompe, avisa por consola
    return {
      success: (t) => console.log("[toast]", t),
      error: (t) => console.error("[toast]", t),
      info: (t) => console.log("[toast]", t),
    };
  }
  return ctx;
}
