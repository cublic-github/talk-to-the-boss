import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Basic Auth middleware (production only)
export function middleware(req: NextRequest) {
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";
  if (!isProd) {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER ?? "cublic";
  const pass = process.env.BASIC_AUTH_PASSWORD ?? "cublic9269";

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, credentials] = auth.split(" ");
    if (scheme === "Basic" && credentials) {
      try {
        // Decode base64 "username:password"
        const decoded = atob(credentials);
        const idx = decoded.indexOf(":");
        const u = decoded.slice(0, idx);
        const p = decoded.slice(idx + 1);
        if (u === user && p === pass) {
          return NextResponse.next();
        }
      } catch (_) {
        // fall through to challenge
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

// Exclude Next.js assets and common public files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/).*)",
  ],
};
