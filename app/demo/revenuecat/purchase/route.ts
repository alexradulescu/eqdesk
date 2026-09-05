import { getAccessExperience } from "@/lib/amplitude/flags";
import { getReturnTo } from "@/lib/auth0/return-to";
import { auth0 } from "@/lib/auth0/server";
import {
  hasArticlesEntitlement,
  simulatePurchase,
} from "@/lib/revenuecat/simulator";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) return new Response("Login required", { status: 401 });
  if ((await getAccessExperience()) !== "revenuecat")
    return new Response("Subscription rollout is disabled", { status: 409 });
  const returnTo = getReturnTo((await request.formData()).get("returnTo"));
  if (!(await hasArticlesEntitlement(session.user.sub)))
    await simulatePurchase(session.user.sub);
  // Server verification, not a client success parameter, determines access.
  if (!(await hasArticlesEntitlement(session.user.sub)))
    return new Response("Subscription pending", { status: 503 });
  return new Response(null, {
    status: 303,
    headers: { Location: returnTo, "Cache-Control": "no-store" },
  });
}
