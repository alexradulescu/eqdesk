import { getAccessExperience } from "@/lib/amplitude/flags";
import { getReturnTo } from "@/lib/auth0/return-to";
import { auth0 } from "@/lib/auth0/server";
import { getLinkedIdentity } from "@/lib/piano/identity";
import { hasArticleAccess, simulateOfferPurchase } from "@/lib/piano/simulator";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) return new Response("Login required", { status: 401 });
  if ((await getAccessExperience()) !== "piano")
    return new Response("Subscription rollout is disabled", { status: 409 });
  const returnTo = getReturnTo((await request.formData()).get("returnTo"));
  const { uid } = getLinkedIdentity(session.user);
  if (!(await hasArticleAccess(uid))) await simulateOfferPurchase(uid);
  // The server checks resource access after the simulated offer completes.
  if (!(await hasArticleAccess(uid)))
    return new Response("Subscription pending", { status: 503 });
  return new Response(null, {
    status: 303,
    headers: { Location: returnTo, "Cache-Control": "no-store" },
  });
}
