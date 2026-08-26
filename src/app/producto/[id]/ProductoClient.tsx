"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice, categories } from "@/lib/supabase-data";
import ProductCard from "@/components/ProductCard";
import ImagenConZoom from "@/components/ImagenConZoom";
import { ShippingZone } from "@/lib/shipping";
import { track } from "@/lib/events";

interface ProductoClientProps {
  product: Product;
  relatedProducts: Product[];
  zonas: ShippingZone[];
}

const WHATSAPP = "https://wa.me/message/CJPQFIY4XTSJC1";

export default function ProductoClient({
  product,
  relatedProducts,
  zonas,
}: ProductoClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => {
      // Seleccionar automáticamente la primera variante con stock
      const withStock = product.variants.find((v) => v.stock > 0);
      return withStock || null;
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    track("product_view", { productId: product.id, name: product.name, brand: product.brand });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const hasStock = product.variants.some((v) => v.stock > 0);
  const category = categories.find((c) => c.slug === product.category);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock < 1) return;

    addItem(product, selectedVariant, quantity);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center gap-2 text-gray-400">
          <li>
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/catalogo" className="hover:text-white transition-colors">
              Catálogo
            </Link>
          </li>
          {category && (
            <>
              <li>/</li>
              <li>
                <Link
                  href={`/catalogo?categoria=${category.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-white truncate">{product.name}</li>
        </ol>
      </nav>

      {/* Product Detail */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <ImagenConZoom
            src={product.imageUrl}
            alt={`${product.brand} ${product.name}`}
            priority
          >
            {product.featured && (
              <span className="absolute top-0 left-0 bg-primary text-white label px-3 py-1.5">
                Destacado
              </span>
            )}
            {!hasStock && (
              <span className="absolute top-0 right-0 bg-dark/90 text-gray-300 label px-3 py-1.5 border-l border-b border-dark-line">
                Sin stock
              </span>
            )}
          </ImagenConZoom>

          {/* Thumbnails (if multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-dark-card cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand & Name */}
          <div>
            <span className="text-primary font-medium uppercase tracking-wider">
              {product.brand}
            </span>
            <h1 className="display text-3xl lg:text-4xl text-white mt-1.5">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-white">
            {formatPrice(product.price)}
          </div>

          {/* Description */}
          <p className="text-gray-400 leading-relaxed">{product.description}</p>

          {/* Size Selector */}
          <div>
            <h3 className="font-semibold text-white mb-3">
              Seleccioná tu talle
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    if (variant.stock > 0) {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }
                  }}
                  disabled={variant.stock < 1}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedVariant?.id === variant.id
                      ? "border-primary bg-primary/10 text-white"
                      : variant.stock > 0
                      ? "border-dark-line text-gray-300 hover:border-gray-500"
                      : "border-dark-line text-gray-600 cursor-not-allowed line-through"
                  }`}
                >
                  {variant.size}
                  {variant.stock > 0 && variant.stock <= 2 && (
                    <span className="ml-1 text-xs text-yellow-500">
                      ({variant.stock})
                    </span>
                  )}
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.stock <= 3 && (
              <p className="text-primary text-sm mt-2">
                {selectedVariant.stock === 1
                  ? "¡Última unidad en este talle!"
                  : `¡Últimas ${selectedVariant.stock} unidades en este talle!`}
              </p>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {hasStock && selectedVariant && (
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <h3 className="font-semibold text-white mb-3">Cantidad</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg bg-dark-card border border-dark-line flex items-center justify-center text-white hover:bg-dark-lighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= selectedVariant.stock}
                    className="w-10 h-10 rounded-lg bg-dark-card border border-dark-line flex items-center justify-center text-white hover:bg-dark-lighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              >
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
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                Agregar al carrito
              </button>

              {/* Added Message */}
              {showAddedMessage && (
                <div className="bg-field/20 text-field rounded-lg p-3 text-center animate-fadeIn">
                  ¡Producto agregado al carrito!
                </div>
              )}
            </div>
          )}

          {/* No Stock Message */}
          {!hasStock && (
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-center">
                Este producto no tiene stock disponible actualmente.
              </p>
              <Link
                href="/catalogo"
                className="block mt-3 text-center text-primary hover:text-primary-light transition-colors"
              >
                Ver otros productos
              </Link>
            </div>
          )}

          {/* WhatsApp Contact */}
          <a
            href={`https://wa.me/5491123456789?text=Hola! Me interesa el producto: ${product.name} (${selectedVariant?.size || ""})`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Consultá por WhatsApp
          </a>
        </div>
      </div>

      {/* Cómo llega y cómo se paga. Sólo hechos ya confirmados: los costos
          salen de la tabla de envíos y el resto es lo que la tienda ofrece. */}
      <section className="mt-12 border border-dark-line bg-dark-card">
        <div className="grid md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-dark-line">
          <div className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <svg
                className="w-5 h-5 text-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              Envíos
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-400">
              {zonas.map((z) => (
                <li key={z.slug}>
                  <span className="text-white">{z.label}</span>
                  {z.description && (
                    <span className="block text-xs text-gray-500">{z.description}</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              El costo del envío lo ves al finalizar la compra. La entrega se
              coordina con vos por WhatsApp.
            </p>
          </div>

          <div className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <svg
                className="w-5 h-5 text-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
              Cómo pagar
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-400">
              <li>Tarjeta de crédito o débito por MercadoPago</li>
              <li>Efectivo en Rapipago o Pago Fácil</li>
              <li>Transferencia o efectivo, coordinando por WhatsApp</li>
            </ul>
          </div>

          <div className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <svg
                className="w-5 h-5 text-primary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.615m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72"
                />
              </svg>
              Probátelo antes
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Tenemos showroom en Llavallol: podés venir, probarte el par y
              llevártelo en el momento.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-primary hover:text-primary-light transition-colors"
            >
              Preguntanos por el talle →
            </a>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="display text-3xl text-white mb-6">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
