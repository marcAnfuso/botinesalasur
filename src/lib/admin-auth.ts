// Sesión del panel admin.
//
// La contraseña vive solo en el servidor (env ADMIN_PASSWORD) y nunca se
// manda al cliente. Al ingresar se emite una cookie httpOnly con un token
// firmado por HMAC-SHA256, que el middleware valida en cada request.
//
// Usa Web Crypto (globalThis.crypto.subtle), disponible tanto en el runtime
// Edge del middleware como en Node 18+ de las API routes.

export const ADMIN_COOKIE = "admin_session";

// Duración de la sesión: 12 horas
const SESSION_MS = 12 * 60 * 60 * 1000;

function getPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length > 0 ? pw : null;
}

// El secreto de firma es independiente de la contraseña si se define
// ADMIN_SESSION_SECRET. Si no, se deriva de la contraseña: cambiarla
// invalida las sesiones abiertas, que es el comportamiento deseable.
function getSecret(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit && explicit.length > 0) return explicit;
  const pw = getPassword();
  return pw ? `derived:${pw}` : null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return toHex(signature);
}

// Comparación en tiempo constante: no revela cuántos caracteres coinciden.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Valida la contraseña ingresada contra la del entorno.
export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = getPassword();
  if (!expected) return false;

  // Se comparan los hashes y no las cadenas, para que el tiempo de
  // ejecución no dependa del largo de la contraseña ingresada.
  const secret = getSecret();
  if (!secret) return false;

  const [a, b] = await Promise.all([
    sign(candidate, secret),
    sign(expected, secret),
  ]);
  return safeEqual(a, b);
}

// Token de sesión: "<expiración>.<firma>"
export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expiresAt = String(Date.now() + SESSION_MS);
  const signature = await sign(expiresAt, secret);
  return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = await sign(expiresAt, secret);
  if (!safeEqual(signature, expected)) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MS / 1000,
  };
}

// Si no hay contraseña configurada el panel queda cerrado por completo,
// en lugar de quedar accesible sin credenciales.
export function isAuthConfigured(): boolean {
  return getPassword() !== null;
}
