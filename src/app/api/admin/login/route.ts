import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";

// Pequeño freno a la fuerza bruta: la respuesta nunca tarda menos que esto,
// y los intentos fallidos suman una espera extra.
const MIN_RESPONSE_MS = 400;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST - Iniciar sesión
export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  const finish = async (response: NextResponse, extraDelay = 0) => {
    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, MIN_RESPONSE_MS - elapsed) + extraDelay;
    if (wait > 0) await delay(wait);
    return response;
  };

  if (!isAuthConfigured()) {
    console.error("ADMIN_PASSWORD no está configurada: el panel queda cerrado");
    return finish(
      NextResponse.json(
        { error: "El panel no está configurado. Falta ADMIN_PASSWORD." },
        { status: 503 }
      )
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return finish(
      NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    );
  }

  const valid = await verifyPassword(password);

  if (!valid) {
    return finish(
      NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 }),
      600
    );
  }

  const token = await createSessionToken();
  if (!token) {
    return finish(
      NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 })
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions());
  return finish(response);
}

// DELETE - Cerrar sesión
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
