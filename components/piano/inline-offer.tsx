import type { User } from "@/lib/auth0/users";

// Stand-in for tp.offer.show({ displayMode: "inline", ... }) and its loginRequired callback.
export function InlineOffer({
  user,
  returnTo,
}: {
  user: User | null;
  returnTo: string;
}) {
  const subscribePage = `/subscribe?returnTo=${encodeURIComponent(returnTo)}`;
  return (
    <section className="subscription-offer">
      <p className="login-eyebrow">PIANO INLINE OFFER · SIMULATION</p>
      <h2>Unlimited article access</h2>
      <p>
        Local Piano checkout connected to a simulated Stripe payment. No card or
        payment is needed.
      </p>
      {user ? (
        <>
          <p>Subscribe as {user.name} for 30 days of demo access.</p>
          <form action="/demo/piano/purchase" method="post">
            <input type="hidden" name="returnTo" value={returnTo} />
            <button className="brand-button" type="submit">
              Simulate successful payment
            </button>
          </form>
        </>
      ) : (
        <a
          className="brand-button"
          href={`/auth/login?returnTo=${encodeURIComponent(subscribePage)}`}
        >
          Log in to subscribe
        </a>
      )}
      <a className="back-link" href={returnTo}>
        Cancel and return
      </a>
    </section>
  );
}
