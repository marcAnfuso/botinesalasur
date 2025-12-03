"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProductById, formatPrice, products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function ProductoPage() {
  const params = useParams();
  const product = getProductById(params.id as string);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCart();

  if (!product) {
    notFound();
  }

  const availableVariants = product.variants.filter((v) => v.stock > 0);
  const currentVariant = product.variants.find((v) => v.id === selectedVariant);
  const maxQuantity = currentVariant?.stock || 1;

  const handleAddToCart = () => {
    if (!currentVariant) return;

    addItem(product, currentVariant, quantity);
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  // Productos relacionados (misma categoría)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.active)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-white transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-white transition-colors">
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-card">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {product.featured && (
            <span className="absolute top-4 left-4 bg-primary text-white text-sm font-semibold px-3 py-1 rounded">
              Destacado
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Brand */}
          <span className="text-primary font-medium uppercase tracking-wider">
            {product.brand}
          </span>

          {/* Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <p className="text-3xl font-bold text-white mb-6">
            {formatPrice(product.price)}
          </p>

          {/* Description */}
          <p className="text-gray-400 mb-8">{product.description}</p>

          {/* Size Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Talle
            </label>
            {availableVariants.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => {
                  const isAvailable = variant.stock > 0;
                  const isSelected = selectedVariant === variant.id;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedVariant(variant.id);
                          setQuantity(1);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`w-14 h-14 rounded-lg font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-dark"
                          : isAvailable
                          ? "bg-dark-card text-white hover:bg-gray-700 border border-gray-700"
                          : "bg-dark-card text-gray-600 line-through cursor-not-allowed border border-gray-800"
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Sin stock disponible</p>
            )}
          </div>

          {/* Stock info */}
          {currentVariant && (
            <p className="text-sm text-gray-400 mb-6">
              {currentVariant.stock <= 3 ? (
                <span className="text-yellow-500">
                  ¡Últimas {currentVariant.stock} unidades!
                </span>
              ) : (
                <span className="text-field">Stock disponible</span>
              )}
            </p>
          )}

          {/* Quantity Selector */}
          {currentVariant && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-3">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-dark-card text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-semibold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                  className="w-10 h-10 rounded-lg bg-dark-card text-white hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || addedToCart}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              addedToCart
                ? "bg-field text-white"
                : selectedVariant
                ? "bg-primary hover:bg-primary-dark text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {addedToCart ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                ¡Agregado!
              </>
            ) : selectedVariant ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                Agregar al carrito
              </>
            ) : (
              "Seleccioná un talle"
            )}
          </button>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/message/CJPQFIY4XTSJC1?text=Hola! Me interesa el ${product.brand} ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 py-4 rounded-lg font-semibold text-lg bg-dark-card border border-gray-700 text-white hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6 text-field" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Consultar por WhatsApp
          </a>

          {/* Info extras */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-field"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              <span>Envío a todo el país</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-field"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
              <span>Efectivo, transferencia o MercadoPago</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-field"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Producto 100% original</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
