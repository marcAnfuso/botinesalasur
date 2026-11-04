import Link from "next/link";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";

// Cinta roja que corre de lado a lado. Todo lo que dice es real: el
// descuento máximo sale de los productos cargados.
export default function CintaOfertas({ maximo }: { maximo: number }) {
  const frases = [
    `Ofertas hasta −${maximo}%`,
    "Hasta agotar stock",
    ...(CUOTAS_SIN_INTERES > 0 ? [`${CUOTAS_SIN_INTERES} cuotas sin interés`] : []),
  ];
  const tira = (
    <div className="flex shrink-0 items-center" aria-hidden>
      {Array.from({ length: 3 }).flatMap((_, r) =>
        frases.map((f, i) => (
          <span key={`${r}-${i}`} className="display-tight text-sm md:text-base text-white px-4 flex items-center gap-4 whitespace-nowrap">
            {f}
            <span className="inline-block w-1.5 h-1.5 bg-white rotate-45" />
          </span>
        ))
      )}
    </div>
  );
  return (
    <Link
      href="/ofertas"
      className="cinta block bg-primary rayas-oferta border-y border-black overflow-hidden py-1.5 -rotate-[0.6deg] scale-[1.01]"
      aria-label={`Ofertas hasta ${maximo}% de descuento`}
    >
      <div className="cinta-track">
        {tira}
        {tira}
      </div>
    </Link>
  );
}
