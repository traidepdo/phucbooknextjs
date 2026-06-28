import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-at-least-32-characters";
const key = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let userPayload: { userId: string; email: string; role: "USER" | "ADMIN" } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      userPayload = payload as any;
    } catch (e) {
      // Invalid/expired token
    }
  }

  // Define route protection rules
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // 1. If trying to access protected routes but not logged in
  if ((isAdminRoute || isDashboardRoute) && !userPayload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin routes require ADMIN role
  if (isAdminRoute && userPayload && userPayload.role !== "ADMIN") {
    // Redirect non-admins to dashboard with unauthorized status
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Authenticated users shouldn't access login/register
  if (isAuthRoute && userPayload) {
    const destination = userPayload.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
