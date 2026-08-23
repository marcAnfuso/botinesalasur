import { NextRequest, NextResponse } from "next/server";
import { getShippingZones, updateShippingZone } from "@/lib/shipping";

// Techo defensivo: un cero de más en el panel no debería cobrarse.
const COSTO_MAXIMO = 500000;

export async function GET() {
  const zonas = await getShippingZones();
  return NextResponse.json({ zonas });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { zonas } = body as {
      zonas: { slug: string; cost: number; label?: string; description?: string }[];
    };

    if (!Array.isArray(zonas) || zonas.length === 0) {
      return NextResponse.json({ error: "No hay zonas para guardar" }, { status: 400 });
    }

    for (const z of zonas) {
      const costo = Number(z.cost);
      if (!Number.isFinite(costo) || !Number.isInteger(costo)) {
        return NextResponse.json(
          { error: `El costo de "${z.label ?? z.slug}" tiene que ser un número entero` },
          { status: 400 }
        );
      }
      if (costo < 0) {
        return NextResponse.json(
          { error: "El costo no puede ser negativo" },
          { status: 400 }
        );
      }
      if (costo > COSTO_MAXIMO) {
        return NextResponse.json(
          { error: `El costo no puede superar $${COSTO_MAXIMO.toLocaleString("es-AR")}` },
          { status: 400 }
        );
      }
      if (z.label !== undefined && z.label.trim() === "") {
        return NextResponse.json(
          { error: "El nombre de la zona no puede quedar vacío" },
          { status: 400 }
        );
      }
    }

    const fallidas: string[] = [];
    for (const z of zonas) {
      const r = await updateShippingZone(z.slug, {
        cost: Number(z.cost),
        label: z.label?.trim(),
        description: z.description?.trim() || null,
      });
      if (!r.ok) fallidas.push(z.slug);
    }

    if (fallidas.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se pudieron guardar algunas zonas. ¿Corriste supabase-migration-envios.sql?",
          fallidas,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, zonas: await getShippingZones() });
  } catch (error) {
    console.error("Error updating shipping zones:", error);
    return NextResponse.json(
      { error: "Error al guardar los costos de envío" },
      { status: 500 }
    );
  }
}
