"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/supabase-data";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: ProductCardProps) {
  const inStock = product.variants.filter((v) => v.stock > 0);
  const hasStock = inStock.length > 0;
  const sizes = inStock.map((v) => v.size);
  const lowStock = hasStock && inStock.every((v) => v.stock <= 2);

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group block focus:outline-none"
    >
      <article className="relative h-full flex flex-col border border-dark-line bg-dark-card transition-colors duration-200 group-hover:border-gray-600 group-focus-visible:border-primary">
        <div className="relative aspect-square overflow-hidden bg-dark-lighter">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
              hasStock ? "" : "grayscale opacity-45"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {product.featured && hasStock && (
            <span className="absolute top-0 left-0 bg-primary text-white label px-2.5 py-1.5">
              Destacado
            </span>
          )}

          {!hasStock && (
            <span className="absolute top-0 left-0 bg-dark/90 text-gray-300 label px-2.5 py-1.5 border-r border-b border-dark-line">
              Agotado
            </span>
          )}

        </div>

        <div className="flex flex-col flex-1 p-4">
          <span className="label text-primary">{product.brand}</span>

          <h3 className="display-tight text-lg leading-tight mt-1.5 text-white line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-snug">
              {product.description}
            </p>
          )}

          {hasStock ? (
            <>
              <p className="mt-3 text-xs text-gray-500 line-clamp-1">
                <span className="label text-gray-500">Talles</span>{" "}
                <span className="tnum text-gray-300">{sizes.join(" · ")}</span>
              </p>
              {lowStock && (
                <p className="mt-1.5 text-xs text-primary">Últimos pares</p>
              )}
            </>
          ) : (
            <p className="mt-3 text-xs text-gray-500">
              Escribinos y te avisamos cuando vuelva
            </p>
          )}

          <div className="mt-auto pt-4 flex items-end justify-between gap-3">
            <span
              className={`display text-2xl tnum ${
                hasStock ? "text-white" : "text-gray-500"
              }`}
            >
              {formatPrice(product.price)}
            </span>
            <span
              className="text-xs text-gray-400 group-hover:text-primary transition-colors whitespace-nowrap"
              aria-hidden
            >
              Ver →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
