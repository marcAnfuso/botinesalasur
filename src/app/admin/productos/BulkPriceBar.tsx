"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/supabase-data";
import { BulkPriceMode } from "@/lib/bulk-price";
import { useToast } from "@/components/Toast";

interface Vista {
  nombre: string;
  antes: number;
  despues: number;
}

interface BulkPriceBarProps {
  seleccionados: number;
  onLimpiar: () => void;
  onPrevisualizar: (
    mode: BulkPriceMode,
    value: number,
    round: boolean
  ) => Vista[];
  onAplicar: (
    mode: BulkPriceMode,
    value: number,
    round: boolean
  ) => Promise<{ actualizados: number; fallidos: number }>;
}

const MODOS: { id: BulkPriceMode; label: string; ayuda: string }[] = [
  { id: "percent", label: "Porcentaje", ayuda: "Ej: 15 sube 15%, -10 baja 10%" },
  { id: "amount", label: "Sumar o restar", ayuda: "Ej: 5000 suma $5.000 a cada uno" },
  { id: "fixed", label: "Precio fijo", ayuda: "Deja todos en el mismo precio" },
];

export default function BulkPriceBar({
  seleccionados,
  onLimpiar,
  onPrevisualizar,
  onAplicar,
}: BulkPriceBarProps) {
  const [abierto, setAbierto] = useState(false);
  const [mode, setMode] = useState<BulkPriceMode>("percent");
  const [valor, setValor] = useState("");
  const [redondear, setRedondear] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const toast = useToast();

  if (seleccionados === 0) return null;

  const numero = Number(valor.replace(",", "."));
  const valido = valor.trim() !== "" && Number.isFinite(numero);
  const vistas = valido ? onPrevisualizar(mode, numero, redondear) : [];
  const muestra = vistas.slice(0, 3);
  const sinCambios =
    vistas.length > 0 && vistas.every((v) => v.antes === v.despues);

  const cerrar = () => {
    setAbierto(false);
    setValor("");
  };

  const aplicar = async () => {
    if (!valido || aplicando) return;
    setAplicando(true);
    try {
      const r = await onAplicar(mode, numero, redondear);
      const texto =
        r.fallidos > 0
          ? `${r.actualizados} actualizados, ${r.fallidos} con error`
          : `${r.actualizados} ${r.actualizados === 1 ? "precio actualizado" : "precios actualizados"}`;
      if (r.fallidos > 0) toast.error(texto); else toast.success(texto);
      cerrar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudieron actualizar");
    } finally {
      setAplicando(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-dark-line bg-dark-lighter/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        {abierto && (
          <div className="py-4 border-b border-dark-line">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Tipo de cambio */}
              <div className="lg:w-72">
                <span className="block text-sm text-gray-400 mb-2">
                  Tipo de cambio
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-dark rounded-lg">
                  {MODOS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      aria-pressed={mode === m.id}
                      className={`py-2 px-1 rounded text-xs font-medium transition-colors ${
                        mode === m.id
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div className="lg:w-56">
                <label
                  htmlFor="bulk-valor"
                  className="block text-sm text-gray-400 mb-2"
                >
                  {mode === "percent" ? "Porcentaje" : "Monto en pesos"}
                </label>
                <div className="relative">
                  {mode !== "percent" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                  )}
                  <input
                    id="bulk-valor"
                    type="text"
                    inputMode="decimal"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={mode === "percent" ? "15" : "5000"}
                    autoFocus
                    className={`input-field tnum ${mode !== "percent" ? "pl-7" : ""} ${
                      mode === "percent" ? "pr-8" : ""
                    }`}
                  />
                  {mode === "percent" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  {MODOS.find((m) => m.id === mode)?.ayuda}
                </p>
              </div>

              {/* Previsualización */}
              <div className="flex-1 min-w-0">
                <span className="block text-sm text-gray-400 mb-2">
                  Cómo quedan
                </span>
                {!valido ? (
                  <p className="text-sm text-gray-500">
                    Escribí un valor para ver el resultado.
                  </p>
                ) : sinCambios ? (
                  <p className="text-sm text-yellow-500">
                    Con ese valor los precios quedan igual.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {muestra.map((v, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm min-w-0"
                      >
                        <span className="truncate text-gray-400 max-w-[10rem]">
                          {v.nombre}
                        </span>
                        <span className="tnum text-gray-500 line-through shrink-0">
                          {formatPrice(v.antes)}
                        </span>
                        <span aria-hidden className="text-gray-600 shrink-0">
                          →
                        </span>
                        <span className="tnum text-white font-medium shrink-0">
                          {formatPrice(v.despues)}
                        </span>
                      </li>
                    ))}
                    {vistas.length > muestra.length && (
                      <li className="text-xs text-gray-500">
                        y {vistas.length - muestra.length} más
                      </li>
                    )}
                  </ul>
                )}

                <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={redondear}
                    onChange={(e) => setRedondear(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  Redondear a la centena (89.999 → 90.000)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Barra */}
        <div className="py-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-white">
            <span className="font-semibold tnum">{seleccionados}</span>{" "}
            {seleccionados === 1 ? "seleccionado" : "seleccionados"}
          </p>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onLimpiar}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Limpiar
            </button>

            {abierto ? (
              <>
                <button
                  onClick={cerrar}
                  disabled={aplicando}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={aplicar}
                  disabled={!valido || aplicando || sinCambios}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  {aplicando ? "Aplicando..." : "Aplicar a los precios"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setAbierto(true)}
                className="btn-primary py-2 px-4 text-sm"
              >
                Cambiar precio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
