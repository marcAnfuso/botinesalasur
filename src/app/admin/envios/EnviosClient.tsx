"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShippingZone } from "@/lib/shipping";
import { formatPrice } from "@/lib/supabase-data";

export default function EnviosClient({
  zonasIniciales,
}: {
  zonasIniciales: ShippingZone[];
}) {
  const router = useRouter();
  const [zonas, setZonas] = useState(zonasIniciales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cambiado =
    JSON.stringify(zonas) !== JSON.stringify(zonasIniciales);

  const editar = (slug: string, campo: keyof ShippingZone, valor: string) =>
    setZonas((prev) =>
      prev.map((z) =>
        z.slug === slug
          ? {
              ...z,
              [campo]:
                campo === "cost"
                  ? valor === ""
                    ? 0
                    : Math.max(0, Math.round(Number(valor.replace(/\D/g, ""))))
                  : valor,
            }
          : z
      )
    );

  const guardar = async () => {
    setGuardando(true);
    setError("");
    setExito("");
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zonas: zonas.map((z) => ({
            slug: z.slug,
            cost: z.cost,
            label: z.label,
            description: z.description ?? "",
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setExito("Costos actualizados. Ya se ven en la tienda.");
      router.refresh();
      setTimeout(() => setExito(""), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Envíos</h1>
        <p className="text-gray-400 mt-1">
          Lo que se cobra por el envío según la zona que elige el cliente en el
          checkout.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {zonas.map((zona) => (
          <div
            key={zona.slug}
            className="bg-dark-card rounded-lg border border-dark-line p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`label-${zona.slug}`}
                  className="block text-sm text-gray-400 mb-1.5"
                >
                  Nombre de la zona
                </label>
                <input
                  id={`label-${zona.slug}`}
                  type="text"
                  value={zona.label}
                  onChange={(e) => editar(zona.slug, "label", e.target.value)}
                  className="input-field"
                  maxLength={80}
                />

                <label
                  htmlFor={`desc-${zona.slug}`}
                  className="block text-sm text-gray-400 mt-3 mb-1.5"
                >
                  Aclaración (opcional)
                </label>
                <input
                  id={`desc-${zona.slug}`}
                  type="text"
                  value={zona.description ?? ""}
                  onChange={(e) =>
                    editar(zona.slug, "description", e.target.value)
                  }
                  placeholder="Ej: Llavallol, Lanús, Lomas. Envío en moto."
                  className="input-field"
                  maxLength={160}
                />
              </div>

              <div className="sm:w-44 shrink-0">
                <label
                  htmlFor={`cost-${zona.slug}`}
                  className="block text-sm text-gray-400 mb-1.5"
                >
                  Costo del envío
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    id={`cost-${zona.slug}`}
                    type="text"
                    inputMode="numeric"
                    value={zona.cost === 0 ? "" : String(zona.cost)}
                    onChange={(e) => editar(zona.slug, "cost", e.target.value)}
                    placeholder="0"
                    className="input-field pl-7 tnum"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 tnum">
                  {zona.cost === 0 ? "Envío gratis" : formatPrice(zona.cost)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400 max-w-2xl" role="alert">
          {error}
        </p>
      )}
      {exito && (
        <p className="mt-4 text-sm text-field max-w-2xl" role="status">
          {exito}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={guardar}
          disabled={!cambiado || guardando}
          className="btn-primary"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        {cambiado && !guardando && (
          <button
            onClick={() => setZonas(zonasIniciales)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Descartar
          </button>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-500 max-w-2xl">
        Los cambios se aplican al toque en el checkout y en el pie de la tienda.
        Los pedidos que ya se hicieron mantienen el costo que se les cobró.
      </p>
    </div>
  );
}
