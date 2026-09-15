"use client";

import { useEffect, useRef, useState } from "react";

// La tabla que Alan y Fede usan por WhatsApp: talle argentino contra
// longitud de la plantilla. La referencia es medir la plantilla de un
// calzado que ya le quede bien al cliente.
const TALLES: [string, string][] = [
  ["37", "24,5 cm"],
  ["38", "25 cm"],
  ["39", "26 cm"],
  ["40", "26,5 cm"],
  ["41", "27,5 cm"],
  ["42", "28 cm"],
  ["43", "29 cm"],
  ["44", "30 cm"],
];

export default function GuiaDeTalles() {
  const [abierta, setAbierta] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierta) return;
    cerrarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(false);
    };
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", esc);
    };
  }, [abierta]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="text-sm text-gray-400 underline underline-offset-4 decoration-gray-600 hover:text-white hover:decoration-white transition-colors"
      >
        Guía de talles
      </button>

      {abierta && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Guía de talles"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setAbierta(false)}
            className="absolute inset-0 bg-dark/75 backdrop-blur-[2px] cursor-default"
          />
          <div className="relative w-full max-w-sm bg-dark-lighter border border-dark-line shadow-lift animate-rise-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-dark-line">
              <h2 className="font-semibold text-white">Guía de talles</h2>
              <button
                ref={cerrarRef}
                type="button"
                onClick={() => setAbierta(false)}
                className="p-1.5 -mr-1.5 text-gray-400 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-300 leading-relaxed">
                La medida es el <strong className="text-white">largo de la plantilla</strong>.
                Para comprar a distancia, medí la plantilla de un calzado que ya
                uses y compará con la tabla.
              </p>

              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 px-3 bg-dark text-gray-400 font-medium label">Talle ARG</th>
                    <th className="py-2 px-3 bg-dark text-gray-400 font-medium label text-right">Plantilla</th>
                  </tr>
                </thead>
                <tbody>
                  {TALLES.map(([arg, cm]) => (
                    <tr key={arg} className="border-b border-dark-line">
                      <td className="py-2 px-3 text-white font-medium tnum">{arg}</td>
                      <td className="py-2 px-3 text-gray-300 tnum text-right">{cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                Algunos talles pueden variar medio punto según marca, horma y
                modelo — Umbro y Joma, por ejemplo, pueden venir 40,5 o 43,5. Si
                dudás entre dos, consultanos por WhatsApp antes de comprar.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
