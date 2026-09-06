import Link from "next/link";
import { InlineOffer } from "@/components/piano/inline-offer";
import { getAccessExperience } from "@/lib/amplitude/flags";
import { getReturnTo } from "@/lib/auth0/return-to";
import { auth0 } from "@/lib/auth0/server";
import { getLinkedIdentity } from "@/lib/piano/identity";
import { hasArticleAccess } from "@/lib/piano/simulator";
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
    session && (await hasArticleAccess(getLinkedIdentity(session.user).uid));
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
      {subscribed ? (
        <section className="subscription-offer">
          <h2>You're subscribed.</h2>
          <Link className="brand-button" href={returnTo}>
            Continue reading
          </Link>
        </section>
      ) : experience === "legacy_regwall" ? (
        <section className="subscription-offer">
          <h2>Subscriptions are not enabled for this reader.</h2>
          <p>The original registration experience is active.</p>
        </section>
      ) : (
        <InlineOffer user={session?.user ?? null} returnTo={returnTo} />
      )}
    </main>
  );
}
