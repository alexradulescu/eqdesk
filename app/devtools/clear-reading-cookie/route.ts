import { cookies } from "next/headers";
import { READING_COOKIE } from "@/lib/reading-meter";

export async function POST() {
  (await cookies()).delete(READING_COOKIE);
  // Return to the list so resetting does not immediately count the current article again.
  return new Response(null, {
    status: 303,
    headers: { Location: "/", "Cache-Control": "no-store" },
  });
}
