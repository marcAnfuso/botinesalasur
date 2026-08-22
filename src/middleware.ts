import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

// Protege el panel y las APIs de administración.
// Las rutas de MercadoPago quedan fuera a propósito: el webhook lo llama
// MercadoPago, no un usuario con sesión.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  // El endpoint de login tiene que ser alcanzable sin sesión
  if (isLoginApi) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  if (isLoginPage) {
    // Con sesión válida no tiene sentido mostrar el login
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (authenticated) return NextResponse.next();

  // Las APIs responden 401 en lugar de redirigir, para que el cliente
  // pueda distinguir "sesión vencida" de un error de la operación.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  // Al volver del login se retoma la página que se estaba intentando abrir
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
