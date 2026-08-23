"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/supabase-data";
import { ShippingZone, costosPorZona } from "@/lib/shipping";

type PaymentMethod = "mercadopago" | "whatsapp";

export default function CheckoutClient({ zonas }: { zonas: ShippingZone[] }) {
  // Los costos vienen del panel; el orden de las zonas también.
  const SHIPPING_COSTS = costosPorZona(zonas);
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    shippingZone: zonas[zonas.length - 1]?.slug ?? "otro",
    notes: "",
  });

  const subtotal = getTotalPrice();
  const shippingCost = SHIPPING_COSTS[formData.shippingZone] ?? 0;
  const zonaElegida = zonas.find((z) => z.slug === formData.shippingZone);
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

    if (paymentMethod === "mercadopago") {
      await handleMercadoPago();
    } else {
      await handleWhatsApp();
    }

    setIsSubmitting(false);
  };

  const handleMercadoPago = async () => {
    try {
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item.product,
            variant: item.variant,
            quantity: item.quantity,
          })),
          customer: { ...formData, shippingZoneLabel: zonaElegida?.label },
          shippingCost,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al procesar el pago");
        return;
      }

      // Clear cart before redirecting
      clearCart();

      // Redirect to MercadoPago
      window.location.href = data.init_point;
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con MercadoPago. Por favor intenta de nuevo.");
    }
  };

  const handleWhatsApp = async () => {
    // El pedido se registra ANTES de abrir el chat: si no, la venta existe
    // sólo en WhatsApp y el panel muestra una realidad incompleta.
    let referencia = "";
    try {
      const res = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item.product,
            variant: item.variant,
            quantity: item.quantity,
          })),
          customer: formData,
          shippingCost,
          total,
        }),
      });
      const data = await res.json();
      if (res.ok) referencia = data.externalReference;
      else console.error("No se pudo registrar el pedido:", data.error);
    } catch (error) {
      // Un fallo al registrar no puede costarle la venta al negocio:
      // se sigue al chat igual y queda el aviso en los logs.
      console.error("Error registrando el pedido de WhatsApp:", error);
    }

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
Zona: ${zonaElegida?.label ?? formData.shippingZone}

*Productos:*
${itemsText}

*Subtotal:* ${formatPrice(subtotal)}
*Envío:* ${formatPrice(shippingCost)}
*TOTAL:* ${formatPrice(total)}

${formData.notes ? `*Notas:* ${formData.notes}` : ""}`;

    const whatsappUrl = `https://wa.me/message/CJPQFIY4XTSJC1?text=${encodeURIComponent(message)}`;

    clearCart();
    window.open(whatsappUrl, "_blank");
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
        <h1 className="display text-3xl text-white mb-4">
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
      <h1 className="display text-4xl md:text-5xl text-white mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos personales */}
            <div className="bg-dark-card rounded-none p-6">
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
            <div className="bg-dark-card rounded-none p-6">
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
                    {zonas.map((z) => (
                      <option key={z.slug} value={z.slug}>
                        {z.label} —{" "}
                        {z.cost === 0 ? "sin cargo" : formatPrice(z.cost)}
                      </option>
                    ))}
                  </select>
                  {zonas.find((z) => z.slug === formData.shippingZone)
                    ?.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {
                        zonas.find((z) => z.slug === formData.shippingZone)
                          ?.description
                      }
                    </p>
                  )}
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

            {/* Método de pago */}
            <div className="bg-dark-card rounded-none p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Método de pago
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === "mercadopago"
                      ? "border-primary bg-primary/10"
                      : "border-dark-line hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mercadopago"
                    checked={paymentMethod === "mercadopago"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="sr-only"
                  />
                  <div className="flex-shrink-0 w-10 h-10 bg-[#00B1EA] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">MercadoPago</p>
                    <p className="text-sm text-gray-400">
                      Tarjeta de crédito, débito, efectivo en Rapipago/Pago Fácil
                    </p>
                  </div>
                  {paymentMethod === "mercadopago" && (
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === "whatsapp"
                      ? "border-primary bg-primary/10"
                      : "border-dark-line hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="whatsapp"
                    checked={paymentMethod === "whatsapp"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="sr-only"
                  />
                  <div className="flex-shrink-0 w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">WhatsApp</p>
                    <p className="text-sm text-gray-400">
                      Coordinar transferencia o efectivo
                    </p>
                  </div>
                  {paymentMethod === "whatsapp" && (
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </label>
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
              ) : paymentMethod === "mercadopago" ? (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Pagar con MercadoPago
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
              {paymentMethod === "mercadopago"
                ? "Serás redirigido a MercadoPago para completar el pago de forma segura."
                : "Al confirmar, te redirigiremos a WhatsApp para coordinar el pago y envío."}
            </p>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div>
          <div className="bg-dark-card rounded-none p-6 sticky top-24">
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
            <div className="border-t border-dark-line pt-4 space-y-3">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío ({zonaElegida?.label ?? "a coordinar"})</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-dark-line">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Seguridad */}
            <div className="mt-6 pt-6 border-t border-dark-line">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
