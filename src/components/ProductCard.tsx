"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/supabase-data";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasStock = product.variants.some((v) => v.stock > 0);
  const availableSizes = product.variants
    .filter((v) => v.stock > 0)
    .map((v) => v.size);

  return (
    <Link href={`/producto/${product.id}`}>
      <article className="product-card bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 group">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-dark-lighter">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Badge destacado */}
          {product.featured && (
            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
              Destacado
            </span>
          )}
          {/* Badge sin stock */}
          {!hasStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Marca */}
          <span className="text-xs text-primary font-medium uppercase tracking-wider">
            {product.brand}
          </span>

          {/* Nombre */}
          <h3 className="font-semibold text-white mt-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Descripción */}
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
            {product.description}
          </p>

          {/* Talles disponibles */}
          {hasStock && (
            <div className="mt-3">
              <span className="text-xs text-gray-500">Talles: </span>
              <span className="text-xs text-gray-300">
                {availableSizes.join(" - ")}
              </span>
            </div>
          )}

          {/* Precio */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-white">
              {formatPrice(product.price)}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                hasStock
                  ? "bg-field/20 text-field"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {hasStock ? "Disponible" : "Agotado"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
