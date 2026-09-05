import { cookies } from "next/headers";
import { EXPERIENCE_COOKIE } from "@/lib/amplitude/flags";

export async function POST(request: Request) {
  const experience = (await request.formData()).get("experience");
  if (experience !== "legacy_regwall" && experience !== "revenuecat")
    return new Response("Unknown experience", { status: 400 });
  (await cookies()).set(EXPERIENCE_COOKIE, experience, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return new Response(null, {
    status: 303,
    headers: { Location: "/", "Cache-Control": "no-store" },
  });
}
