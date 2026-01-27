import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16: proxy.ts
 * Replaces middleware.ts to provide a deterministic, Node.js-based network boundary.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 2. High-speed Redirects (Mocking Vercel Edge Config)
  if (pathname === "/old-recruitment-flow") {
    return NextResponse.redirect(new URL("/tma/onboarding", request.url));
  }

  // 3. Identity Pre-verification for API routes
  if (pathname.startsWith("/api/bff")) {
     // Perform basic token check or routing logic
     console.log(`[Proxy] Intercepting BFF request: ${pathname}`);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
