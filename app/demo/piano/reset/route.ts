import { auth0 } from "@/lib/auth0/server";
import { getLinkedIdentity } from "@/lib/piano/identity";
import { resetSubscription } from "@/lib/piano/simulator";

export async function POST() {
  const session = await auth0.getSession();
  if (!session) return new Response("Login required", { status: 401 });
  await resetSubscription(getLinkedIdentity(session.user).uid);
  return new Response(null, {
    status: 303,
    headers: { Location: "/", "Cache-Control": "no-store" },
  });
}
