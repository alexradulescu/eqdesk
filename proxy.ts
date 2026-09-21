import { type NextRequest, NextResponse } from "next/server";
import { PASSWORD, SESSION_COOKIE, validSession } from "@/lib/access";
import { json } from "@/lib/cryptowire/api";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/login" || path === "/api/session") return NextResponse.next();
  const api = path.startsWith("/api/");
  if (api && request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Cache-Control": "no-store",
      },
    });
  }
  const session = validSession(request.cookies.get(SESSION_COOKIE)?.value);
  const bearer = request.headers.get("authorization") === `Bearer ${PASSWORD}`;
  if (session || (api && bearer)) return NextResponse.next();
  if (api)
    return json({ error: "Unauthorized. Send a valid bearer token." }, 401);
  const login = new URL("/login", request.url);
  login.searchParams.set("next", path + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/|images/|favicon.ico).*)"],
};
