import { NextResponse, type NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(
    "x-hq-locale",
    /^\/zh(?:\/|$)/.test(request.nextUrl.pathname) ? "zh" : "en",
  );
  const response = NextResponse.next({ request: { headers } });
  if (process.env.VERCEL_ENV === "preview" || request.cookies.has("hq-preview"))
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = { matcher: ["/((?!_next|assets|api|favicon.ico).*)"] };
