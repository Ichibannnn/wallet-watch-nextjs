// src/proxy.ts (Next.js 16 renamed Middleware -> Proxy)
//
// Optimistic gate only: redirect based on the *presence* of the session cookie.
// Per the Next.js docs, Proxy must not do DB lookups or real authorization —
// that lives in the Route Handlers (see lib/rbac/guard.ts). This just keeps
// signed-out visitors off the dashboard and signed-in users off the auth pages.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

const DASHBOARD_PREFIXES = [
  "/transactions",
  "/statistics",
  "/accounts",
  "/categories",
  "/user-management",
];

const AUTH_PAGES = ["/signin", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isDashboard = DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isDashboard && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/transactions";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
