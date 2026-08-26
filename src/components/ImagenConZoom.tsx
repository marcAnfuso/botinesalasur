"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ImagenConZoomProps {
  src: string;
  alt: string;
  priority?: boolean;
  children?: React.ReactNode;
}

// Dos formas de mirar de cerca, cada una donde corresponde:
// con mouse, la lupa sigue al puntero sobre la propia foto; al tocar o
// hacer clic, la foto se abre a pantalla completa.
export default function ImagenConZoom({
  src,
  alt,
  priority,
  children,
}: ImagenConZoomProps) {
  const [abierta, setAbierta] = useState(false);
  const [lupa, setLupa] = useState(false);
  const [origen, setOrigen] = useState("50% 50%");
  const marco = useRef<HTMLButtonElement>(null);

  // Con la foto abierta, el fondo no scrollea y Escape cierra.
  useEffect(() => {
    if (!abierta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(false);
    };
    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierta]);

  const seguirPuntero = (e: React.MouseEvent) => {
    const caja = marco.current?.getBoundingClientRect();
    if (!caja) return;
    const x = ((e.clientX - caja.left) / caja.width) * 100;
    const y = ((e.clientY - caja.top) / caja.height) * 100;
    setOrigen(`${x}% ${y}%`);
  };

  return (
    <>
      <button
        ref={marco}
        type="button"
        onClick={() => setAbierta(true)}
        onMouseEnter={() => setLupa(true)}
        onMouseLeave={() => setLupa(false)}
        onMouseMove={seguirPuntero}
        aria-label={`Ampliar la foto: ${alt}`}
        className="group relative block w-full aspect-square overflow-hidden bg-dark-card cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-200 ease-out"
          style={{
            transform: lupa ? "scale(2)" : "scale(1)",
            transformOrigin: origen,
          }}
        />

        {children}

        <span
          aria-hidden
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-dark/80 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 border border-dark-line opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 15.75 21 21m-3.75-8.25a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0ZM12 9.75v3m1.5-1.5h-3"
            />
          </svg>
          Ampliar
        </span>
      </button>

      {abierta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setAbierta(false)}
          className="fixed inset-0 z-[60] bg-dark/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setAbierta(false)}
            aria-label="Cerrar"
            autoFocus
            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="relative w-full max-w-4xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <p className="absolute bottom-5 inset-x-0 text-center text-xs text-gray-500">
            Tocá fuera de la foto o apretá Esc para cerrar
          </p>
        </div>
      )}
    </>
  );
}
