"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/supabase-data";

const SHIPPING_COSTS = {
  "gba-sur": 2500,
  otro: 5500,
};

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    shippingZone: "otro" as "gba-sur" | "otro",
    notes: "",
  });

  const subtotal = getTotalPrice();
  const shippingCost = SHIPPING_COSTS[formData.shippingZone];
  const total = subtotal + shippingCost;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Integrar con MercadoPago y Supabase
    // Por ahora simulamos el proceso
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Crear mensaje para WhatsApp con el resumen del pedido
    const itemsText = items
      .map(
        (item) =>
          `- ${item.product.brand} ${item.product.name} (Talle ${item.variant.size}) x${item.quantity} = ${formatPrice(item.product.price * item.quantity)}`
      )
      .join("\n");

    const message = `*Nuevo Pedido - Botinesala Sur*

*Cliente:* ${formData.name}
*Email:* ${formData.email}
*Teléfono:* ${formData.phone}

*Dirección de envío:*
${formData.address}
${formData.city}, ${formData.province}
CP: ${formData.postalCode}
Zona: ${formData.shippingZone === "gba-sur" ? "GBA Sur" : "Interior/Otro"}

*Productos:*
${itemsText}

*Subtotal:* ${formatPrice(subtotal)}
*Envío:* ${formatPrice(shippingCost)}
*TOTAL:* ${formatPrice(total)}

${formData.notes ? `*Notas:* ${formData.notes}` : ""}`;

    const whatsappUrl = `https://wa.me/message/CJPQFIY4XTSJC1?text=${encodeURIComponent(message)}`;

    // Limpiar carrito y redirigir a WhatsApp
    clearCart();
    window.open(whatsappUrl, "_blank");

    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-20 h-20 mx-auto text-gray-600 mb-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-white mb-4">
          Tu carrito está vacío
        </h1>
        <p className="text-gray-400 mb-8">
          Agregá productos para poder finalizar tu compra.
        </p>
        <Link href="/catalogo" className="btn-primary">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos personales */}
            <div className="bg-dark-card rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Datos personales
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="juan@email.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="11 1234-5678"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-dark-card rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Dirección de envío
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="shippingZone"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Zona de envío *
                  </label>
                  <select
                    id="shippingZone"
                    name="shippingZone"
                    required
                    value={formData.shippingZone}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="gba-sur">
                      GBA Sur (Llavallol, Lanús, Lomas, etc.) - {formatPrice(SHIPPING_COSTS["gba-sur"])}
                    </option>
                    <option value="otro">
                      Otro / Interior - {formatPrice(SHIPPING_COSTS.otro)}
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.shippingZone === "gba-sur"
                      ? "Envío en moto, coordinamos horario"
                      : "Envío por Correo Argentino"}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Dirección *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Av. Ejemplo 1234, Piso 2, Depto B"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Ciudad / Localidad *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Llavallol"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="province"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Provincia *
                    </label>
                    <input
                      type="text"
                      id="province"
                      name="province"
                      required
                      value={formData.province}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Buenos Aires"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="input-field w-32"
                    placeholder="1836"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Notas adicionales
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-field resize-none"
                    placeholder="Indicaciones para la entrega, horarios, etc."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Confirmar pedido por WhatsApp
                </>
              )}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Al confirmar, te redirigiremos a WhatsApp para coordinar el pago y envío.
            </p>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div>
          <div className="bg-dark-card rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-white mb-4">
              Resumen del pedido
            </h2>

            {/* Items */}
            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.variant.id}`}
                  className="flex gap-4"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark flex-shrink-0">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary">{item.product.brand}</p>
                    <p className="text-sm text-white font-medium line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Talle: {item.variant.size}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totales */}
            <div className="border-t border-gray-700 pt-4 space-y-3">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío ({formData.shippingZone === "gba-sur" ? "GBA Sur" : "Interior"})</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-gray-700">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Métodos de pago */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3">Métodos de pago aceptados:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-dark rounded text-sm text-gray-300">
                  Efectivo
                </span>
                <span className="px-3 py-1 bg-dark rounded text-sm text-gray-300">
                  Transferencia
                </span>
                <span className="px-3 py-1 bg-dark rounded text-sm text-gray-300">
                  MercadoPago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
