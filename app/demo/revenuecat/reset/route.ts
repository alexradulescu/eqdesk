import { auth0 } from "@/lib/auth0/server";
import { resetSubscription } from "@/lib/revenuecat/simulator";

export async function POST() {
  const session = await auth0.getSession();
  if (!session) return new Response("Login required", { status: 401 });
  await resetSubscription(session.user.sub);
  return new Response(null, {
    status: 303,
    headers: { Location: "/", "Cache-Control": "no-store" },
  });
}
