import Link from "next/link";
import { getAccessExperience } from "@/lib/amplitude/flags";
import { getReturnTo } from "@/lib/auth0/return-to";
import { auth0 } from "@/lib/auth0/server";
import { hasArticlesEntitlement } from "@/lib/revenuecat/simulator";
import { getSubscriptionBenefits } from "@/lib/sanity/client";

export const metadata = { title: "Subscription benefits" };

export default async function Subscribe({
  searchParams,
}: PageProps<"/subscribe">) {
  const returnTo = getReturnTo((await searchParams).returnTo);
  const [benefits, session, experience] = await Promise.all([
    getSubscriptionBenefits(),
    auth0.getSession(),
    getAccessExperience(),
  ]);
  const subscribed =
    session && (await hasArticlesEntitlement(session.user.sub));
  const checkout = `/demo/revenuecat/checkout?returnTo=${encodeURIComponent(returnTo)}`;
  return (
    <main id="main-content" className="container subscribe-page">
      <Link className="back-link" href="/">
        ← All stories
      </Link>
      <h1>More to read. More to discover.</h1>
      <p className="subscribe-intro">One subscription. Every EQDesk article.</p>
      <ol className="benefits">
        {benefits.map((benefit) => (
          <li key={benefit.title}>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
          </li>
        ))}
      </ol>
      <section className="subscription-offer">
        {subscribed ? (
          <>
            <h2>You're subscribed.</h2>
            <Link className="brand-button" href={returnTo}>
              Continue reading
            </Link>
          </>
        ) : experience === "legacy_regwall" ? (
          <>
            <h2>Subscriptions are not enabled for this reader.</h2>
            <p>The original registration experience is active.</p>
          </>
        ) : (
          <>
            <h2>Unlimited article access</h2>
            <p>
              Local RevenueCat + Stripe Billing simulation. No payment is
              collected.
            </p>
            <a className="brand-button" href={checkout}>
              Subscribe
            </a>
          </>
        )}
      </section>
    </main>
  );
}
