import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === "/admin/login";
  const session = request.cookies.get("admin_session")?.value || "";

  // Proteger rutas de administración (comprobación rápida de presencia de cookie).
  // La verificación real de la firma del JWT se hace en app/admin/layout.js.
  if (path.startsWith("/admin") && !isPublicPath && !session) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }

  // Evitar que un usuario ya autenticado vea la página de login.
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/admin", request.nextUrl));
  }

  // Propagar el pathname para que el layout pueda distinguir la página de login.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
