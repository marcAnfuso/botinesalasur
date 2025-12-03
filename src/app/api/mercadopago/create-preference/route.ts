import { NextRequest, NextResponse } from "next/server";

// Tipos para MercadoPago
interface PreferenceItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface PreferenceRequest {
  items: {
    productId: string;
    productName: string;
    productBrand: string;
    variantSize: string;
    quantity: number;
    unitPrice: number;
  }[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingCost: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreferenceRequest = await request.json();
    const { items, customer, shippingCost } = body;

    // Validar que tenemos el access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "MercadoPago no está configurado" },
        { status: 500 }
      );
    }

    // Preparar los items para MercadoPago
    const mpItems: PreferenceItem[] = items.map((item) => ({
      id: item.productId,
      title: `${item.productBrand} ${item.productName} - Talle ${item.variantSize}`,
      description: `Botín ${item.productBrand} ${item.productName}`,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: "ARS",
    }));

    // Agregar el envío como item si tiene costo
    if (shippingCost > 0) {
      mpItems.push({
        id: "shipping",
        title: "Costo de envío",
        description: "Envío a domicilio",
        quantity: 1,
        unit_price: shippingCost,
        currency_id: "ARS",
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Crear la preferencia en MercadoPago
    const preferenceData = {
      items: mpItems,
      payer: {
        name: customer.name,
        email: customer.email,
        phone: {
          number: customer.phone,
        },
      },
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      auto_return: "approved",
      statement_descriptor: "BOTINESALASUR",
      external_reference: `order_${Date.now()}`,
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferenceData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de MercadoPago:", errorData);
      return NextResponse.json(
        { error: "Error al crear la preferencia de pago" },
        { status: response.status }
      );
    }

    const preference = await response.json();

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error en create-preference:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
