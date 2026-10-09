import { NextResponse, type NextRequest } from "next/server";
import { verifyTicket } from "../../../../lib/cms/auth";
import { readSnapshot } from "../../../../lib/cms/releases";
import { getStore } from "../../../../lib/cms/storage";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has("exit")) {
    const response = NextResponse.redirect(new URL("/projects", request.url));
    response.cookies.delete("hq-preview");
    return response;
  }
  try {
    const ticket = request.nextUrl.searchParams.get("ticket") || "";
    const version = verifyTicket(ticket);
    if (!version)
      return new Response("Invalid or expired preview link", { status: 401 });
    await readSnapshot(getStore(), "drafts", version);
    const response = NextResponse.redirect(
      new URL("/projects?category=all", request.url),
    );
    response.cookies.set("hq-preview", ticket, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 1800,
    });
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return new Response("Preview unavailable", { status: 503 });
  }
}
