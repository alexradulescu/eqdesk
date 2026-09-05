import { redirect } from "next/navigation";
import { getAccessExperience } from "@/lib/amplitude/flags";
import { getReturnTo } from "@/lib/auth0/return-to";
import { auth0 } from "@/lib/auth0/server";

export const metadata = { title: "Demo checkout" };

export default async function Checkout({
  searchParams,
}: PageProps<"/demo/revenuecat/checkout">) {
  const returnTo = getReturnTo((await searchParams).returnTo);
  if ((await getAccessExperience()) !== "revenuecat") redirect("/subscribe");
  const session = await auth0.getSession();
  if (!session)
    redirect(
      `/auth/login?returnTo=${encodeURIComponent(`/demo/revenuecat/checkout?returnTo=${encodeURIComponent(returnTo)}`)}`,
    );
  return (
    <main id="main-content" className="container subscribe-page">
      <p className="login-eyebrow">REVENUECAT / STRIPE BILLING · SIMULATION</p>
      <h1>Complete your demo subscription.</h1>
      <p className="subscribe-intro">
        Subscribe as {session.user.name}. This simulates a successful payment
        and grants 30 days of article access. No card or payment is needed.
      </p>
      <form action="/demo/revenuecat/purchase" method="post">
        <input type="hidden" name="returnTo" value={returnTo} />
        <button className="brand-button" type="submit">
          Simulate successful payment
        </button>
      </form>
      <a className="back-link" href={returnTo}>
        Cancel and return
      </a>
    </main>
  );
}
