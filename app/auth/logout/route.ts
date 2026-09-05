import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getReturnTo } from "@/lib/auth0/return-to";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth0/server";

export async function GET(request: Request) {
  (await cookies()).set(SESSION_COOKIE, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: getReturnTo(new URL(request.url).searchParams.get("returnTo")),
      "Cache-Control": "no-store",
    },
  });
}
