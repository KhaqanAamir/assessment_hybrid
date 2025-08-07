import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/" || pathname === "/register";

  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/register", "/dashboard/:path*"],
};
