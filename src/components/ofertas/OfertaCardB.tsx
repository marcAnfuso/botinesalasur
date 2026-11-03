import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/supabase-data";
import { urlProducto } from "@/lib/producto-url";
import { descuentoOferta } from "@/lib/ofertas";
import { CUOTAS_SIN_INTERES } from "@/lib/cuotas";

// Tarjeta de oferta: el descuento como sticker, el ahorro en
// pesos y cuántos pares quedan. Nada inventado: todo sale del producto.
export default function OfertaCardB({ product, grande = false }: { product: Product; grande?: boolean }) {
  const pct = descuentoOferta(product);
  const antes = product.comparePrice as number;
  const ahorro = antes - product.price;
  const conStock = product.variants.filter((v) => v.stock > 0);
  const pares = conStock.reduce((a, v) => a + v.stock, 0);

  return (
    <Link
      href={urlProducto(product)}
      className={`group relative block border-2 border-dark-line bg-dark-card hover:border-primary transition-colors focus:outline-none focus-visible:border-primary ${
        grande ? "md:grid md:grid-cols-2" : ""
      }`}
    >
      <div className={`relative overflow-hidden bg-white ${grande ? "aspect-[4/3] md:aspect-auto md:min-h-[280px]" : "aspect-square"}`}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes={grande ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
        <div
          className={`sticker-oferta absolute top-3 right-3 bg-primary text-white flex flex-col items-center justify-center rounded-full border-2 border-black ${
            grande ? "w-20 h-20 md:w-24 md:h-24" : "w-14 h-14 md:w-16 md:h-16"
          }`}
        >
          <span className={`display leading-none ${grande ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>−{pct}%</span>
          <span className={`label leading-none mt-1 ${grande ? "" : "text-[0.5rem] md:text-[0.6rem]"}`}>off</span>
        </div>
        {pares === 1 && (
          <span className="absolute bottom-0 left-0 bg-black text-white label px-2.5 py-1.5">Último par</span>
        )}
      </div>

      <div className={`p-4 ${grande ? "md:p-6 md:flex md:flex-col md:justify-center" : ""}`}>
        {grande && <p className="label text-primary mb-2">La mejor oferta de hoy</p>}
        <p className="label text-gray-500">{product.brand}</p>
        <h3 className={`display-tight text-white leading-tight mt-1 line-clamp-2 ${grande ? "text-2xl md:text-3xl" : "text-lg"}`}>
          {product.name}
        </h3>

        <div className={grande ? "mt-4" : "mt-3"}>
          <p className="relative inline-block text-gray-500 tnum">
            {formatPrice(antes)}
            <span aria-hidden className="absolute left-0 right-0 top-1/2 h-[2px] bg-primary -rotate-6" />
          </p>
          <p className={`display text-white tnum leading-none ${grande ? "text-4xl md:text-5xl mt-1" : "text-2xl mt-0.5"}`}>
            {formatPrice(product.price)}
          </p>
          <p className={`inline-block bg-field text-black font-bold tnum mt-2 px-2 py-0.5 ${grande ? "text-base" : "text-xs"}`}>
            Ahorrás {formatPrice(ahorro)}
          </p>
          {CUOTAS_SIN_INTERES > 0 && (
            <p className={`text-gray-400 mt-2 ${grande ? "text-base" : "text-xs"}`}>
              o {CUOTAS_SIN_INTERES} cuotas sin interés de{" "}
              <span className="text-white tnum">{formatPrice(Math.round(product.price / CUOTAS_SIN_INTERES))}</span>
            </p>
          )}
        </div>

        <div className={`flex flex-wrap items-center gap-1.5 ${grande ? "mt-6" : "mt-3"}`}>
          <span className="label text-gray-500 mr-0.5">{conStock.length === 1 ? "Talle" : "Talles"}</span>
          {conStock.map((v) => (
            <span key={v.id} className="tnum text-xs text-gray-200 border border-dark-line bg-dark px-1.5 py-0.5 whitespace-nowrap">
              {v.size}
            </span>
          ))}
        </div>

        {grande && (
          <span className="btn-primary mt-5 self-start">
            La quiero <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </Link>
  );
}
