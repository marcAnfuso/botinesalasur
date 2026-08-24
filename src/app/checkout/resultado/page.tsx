"use client";

import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentResult {
  verified: boolean;
  payment?: {
    order_id?: string;
    external_reference?: string;
    payment_id?: string;
    amount?: number;
    status?: string;
    paid_at?: string;
    customer_name?: string;
    customer_email?: string;
  };
  order?: {
    id: string;
    external_reference: string;
    status: string;
    payment_status: string;
    total: number;
  };
  message?: string;
}

function LoadingSpinner() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-400">Verificando tu pago...</p>
    </div>
  );
}

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const externalRef = searchParams.get("ref");
  const paymentId = searchParams.get("payment_id");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    async function verifyPayment() {
      if (!externalRef && !paymentId) {
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (externalRef) params.append("ref", externalRef);
        if (paymentId) params.append("payment_id", paymentId);

        const response = await fetch(`/api/mercadopago/verify-payment?${params}`);
        const data = await response.json();
        setResult(data);

        // Recién acá se vacía: el pago ya salió, y si hubiera fallado el
        // cliente conserva su carrito para reintentar.
        if (data?.verified) clearCart();
      } catch (error) {
        console.error("Error verifying payment:", error);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
    // clearCart es estable entre renders del provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalRef, paymentId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // El éxito exige verificación real: el parámetro de la URL lo escribe
  // MercadoPago al redirigir, pero también puede escribirlo cualquiera.
  if (result?.verified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-dark-card rounded-none p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>

          <h1 className="display text-4xl text-white mb-2">
            ¡Pago exitoso!
          </h1>
          <p className="text-gray-400 mb-8">
            Tu compra ha sido confirmada. Te enviaremos un email con los detalles.
          </p>

          {result?.payment && (
            <div className="bg-dark rounded-none p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-white mb-4">Detalles del pedido</h2>
              <dl className="space-y-3 text-sm">
                {result.payment.external_reference && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Número de orden:</dt>
                    <dd className="text-white font-mono">{result.payment.external_reference}</dd>
                  </div>
                )}
                {result.payment.amount && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Total:</dt>
                    <dd className="text-white font-semibold">
                      ${result.payment.amount.toLocaleString("es-AR")}
                    </dd>
                  </div>
                )}
                {result.payment.customer_name && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Cliente:</dt>
                    <dd className="text-white">{result.payment.customer_name}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="space-y-4">
            <Link href="/catalogo" className="btn-primary w-full block text-center">
              Seguir comprando
            </Link>
            <a
              href="https://wa.me/message/CJPQFIY4XTSJC1"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 rounded-lg bg-[#25D366] text-white font-medium text-center hover:bg-[#20BD5A] transition-colors"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Pending state
  // MercadoPago volvió con éxito pero la confirmación todavía no llegó:
  // suele ser el webhook demorándose unos segundos.
  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-dark-card rounded-none p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          <h1 className="display text-4xl text-white mb-2">
            Estamos confirmando tu pago
          </h1>
          <p className="text-gray-400 mb-8">
            MercadoPago nos avisó que lo completaste. En cuanto se confirme te
            mandamos el mail con los detalles. Suele tardar unos segundos.
          </p>

          {externalRef && (
            <p className="text-sm text-gray-500 mb-8">
              Tu pedido: <span className="text-white">{externalRef}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Actualizar
            </button>
            <a
              href="https://wa.me/message/CJPQFIY4XTSJC1"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-dark-card rounded-none p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          </div>

          <h1 className="display text-4xl text-white mb-2">
            Pago pendiente
          </h1>
          <p className="text-gray-400 mb-8">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
            {result?.order?.external_reference && (
              <span className="block mt-2 font-mono text-sm">
                Orden: {result.order.external_reference}
              </span>
            )}
          </p>

          <div className="space-y-4">
            <Link href="/catalogo" className="btn-primary w-full block text-center">
              Seguir comprando
            </Link>
            <a
              href="https://wa.me/message/CJPQFIY4XTSJC1"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 rounded-lg bg-[#25D366] text-white font-medium text-center hover:bg-[#20BD5A] transition-colors"
            >
              Consultar estado por WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Failure state
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-dark-card rounded-none p-8 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        </div>

        <h1 className="display text-4xl text-white mb-2">
          Pago no completado
        </h1>
        <p className="text-gray-400 mb-8">
          Hubo un problema con tu pago. Podés intentar de nuevo o contactarnos por WhatsApp.
        </p>

        <div className="space-y-4">
          <Link href="/checkout" className="btn-primary w-full block text-center">
            Intentar de nuevo
          </Link>
          <a
            href="https://wa.me/message/CJPQFIY4XTSJC1"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 rounded-lg bg-[#25D366] text-white font-medium text-center hover:bg-[#20BD5A] transition-colors"
          >
            Contactar por WhatsApp
          </a>
          <Link
            href="/catalogo"
            className="block w-full py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-medium text-center hover:border-gray-500 transition-colors"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutResultContent />
    </Suspense>
  );
}
