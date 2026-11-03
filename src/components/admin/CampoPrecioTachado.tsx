"use client";

import { formatPrice } from "@/lib/supabase-data";

// Precio tachado de una oferta. Si es mayor que el precio a pagar, el botín
// pasa a Ofertas con este precio tachado al lado. Lo que se cobra es siempre
// el precio a pagar.
export default function CampoPrecioTachado({
  value,
  precio,
  onChange,
}: {
  value: string;
  precio: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const tachado = Number(value);
  const pagar = Number(precio);
  const vale = value !== "" && pagar > 0 && tachado > pagar;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">
        Precio tachado (opcional, para ofertas)
      </label>
      <input
        type="number"
        name="comparePrice"
        value={value}
        onChange={onChange}
        min="0"
        className="input-field"
        placeholder="Vacío = no está en oferta"
      />
      {value === "" ? (
        <p className="mt-1 text-xs text-gray-500">
          Poné un precio mayor al precio a pagar y el botín pasa a Ofertas, con este precio tachado.
        </p>
      ) : vale ? (
        <p className="mt-1 text-xs text-field">
          Se va a ver:{" "}
          <span className="line-through text-gray-500 tnum">{formatPrice(tachado)}</span>{" "}
          <span className="text-white font-semibold tnum">{formatPrice(pagar)}</span>{" "}
          · Oferta −{Math.floor((1 - pagar / tachado) * 100)}%
        </p>
      ) : (
        <p className="mt-1 text-xs text-yellow-500">
          Tiene que ser mayor que el precio a pagar; si no, no se muestra como oferta.
        </p>
      )}
    </div>
  );
}
