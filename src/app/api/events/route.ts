import { NextRequest, NextResponse } from "next/server";
import { EVENT_NAMES, EventName } from "@/lib/events";
import { logEvent } from "@/lib/events-server";

// Recibe los eventos que manda el navegador. Es una ruta pública, así que
// no le cree a nada: sólo nombres conocidos, tamaños acotados, y siempre
// responde bien para que el cliente nunca se entere si algo falló.

const MAX_DETAILS = 2000;
const REF_OK = /^[A-Z]{2,5}-\d{8}-[A-Z0-9]{4,8}$/;
const SESSION_OK = /^[A-Za-z0-9-]{8,64}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body?.event as string;

    if (!EVENT_NAMES.includes(event as EventName)) {
      return new NextResponse(null, { status: 204 });
    }

    const ref =
      typeof body.ref === "string" && REF_OK.test(body.ref) ? body.ref : null;
    const sessionId =
      typeof body.sessionId === "string" && SESSION_OK.test(body.sessionId)
        ? body.sessionId
        : null;

    let details: Record<string, unknown> | undefined;
    if (body.details && typeof body.details === "object") {
      const texto = JSON.stringify(body.details);
      details =
        texto.length <= MAX_DETAILS
          ? body.details
          : { truncado: true, inicio: texto.slice(0, MAX_DETAILS) };
    }

    const path =
      typeof body.path === "string" ? body.path.slice(0, 200) : null;

    await logEvent(event as EventName, {
      source: "client",
      ref,
      sessionId,
      details,
      path,
      userAgent: request.headers.get("user-agent"),
    });
  } catch {
    // cuerpo inválido: se ignora
  }

  return new NextResponse(null, { status: 204 });
}
