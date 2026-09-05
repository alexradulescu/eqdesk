import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getReturnTo } from "@/lib/auth0/return-to";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth0/server";
import { mockUsers } from "@/lib/auth0/users";

// Simulate a successful Auth0 callback using a selected mock identity instead of an OAuth code.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = mockUsers.find(
    (user) => user.sub === url.searchParams.get("user"),
  );
  if (!user) {
    return NextResponse.json(
      { error: "Choose one of the four demo users." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  (await cookies()).set(SESSION_COOKIE, user.sub, sessionCookieOptions);
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: getReturnTo(url.searchParams.get("returnTo")),
      "Cache-Control": "no-store",
    },
  });
}
