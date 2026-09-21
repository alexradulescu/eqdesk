import { NextResponse } from "next/server";
import {
  createSession,
  PASSWORD,
  SESSION_COOKIE,
  SESSION_SECONDS,
} from "@/lib/access";

export async function POST(request: Request) {
  const data = await request.formData();
  if (data.get("password") !== PASSWORD) {
    return Response.json(
      { error: "Incorrect password. Try again." },
      { status: 401 },
    );
  }
  const response = NextResponse.json(
    { ok: true },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
  response.cookies.set(SESSION_COOKIE, createSession(), {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
