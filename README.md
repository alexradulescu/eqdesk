# EQDesk

A minimal news-site proof of concept for registration-wall experiments. Five fictional articles come from an asynchronous mock Sanity adapter. Login is simulated with four fixed users.

## Run

```sh
bun install
bun run dev
```

For a production preview on port 3100:

```sh
bun run build
bun run start --port 3100
```

## Reading and login

- Anonymous readers can open three distinct articles. Refreshing or revisiting one does not consume another read.
- A fourth distinct article shows its title, image, byline, and login prompt. Its body and ads are omitted from the server response.
- The first three articles remain available after reaching the limit.
- Log in as Alison, John, Maria, or Xavier to read everything. Logout preserves the anonymous reading history.
- **Clear reading cookie** resets the allowance and returns to the list. It does not log the user out.
- Reading history and login use separate HTTP-only browser-session cookies. The demo requires cookies; it is a browser-local meter, not a durable account ledger.

## Code map

- `lib/sanity/mock-data.ts`: article fixtures with Sanity-style documents and Portable Text blocks. Photos are local mock assets originally sourced from Unsplash.
- `lib/sanity/client.ts`: asynchronous mock CMS reads, with 60-second cache revalidation. Next.js can serve stale data during revalidation; entries expire after 120 seconds.
- `app/articles/[slug]/page.tsx`: uncached session and allowance checks, followed by server-rendered article content when allowed.
- `app/read/[slug]/route.ts`: records a new distinct read before redirecting to the article. This separate route lets the server set the cookie before page streaming begins.
- `components/article-body.tsx`: inserts a full-width, 100px yellow advertisement after every two paragraphs.
- `lib/auth0/`: the mock login adapter, provider, and hook. See its README for the Auth0-shaped API and deliberate mock behavior.
- `app/devtools/clear-reading-cookie/route.ts`: POST endpoint that clears only the reading cookie.

Article links use full-page navigation so automatic prefetching does not consume the allowance. The list sends new anonymous reads directly to `/read`, saving one redirect. Previously read articles, signed-in users, and readers at the limit link directly to `/articles`. Direct article URLs still enforce access. Authentication and reading history are kept outside the shared CMS cache. There is no HubSpot integration.

## Verify

```sh
bun run lint
bun run build
# With the production preview running:
node --test tests/registration-wall.test.mjs
```

Set `TEST_BASE_URL` to test another local port. Each test manages its own cookies and does not change the browser's session.

The integration tests cover distinct reads, refreshes, HTML/RSC content withholding, all four login identities, logout, reset, malformed cookies, unknown articles, and devtools placement.

## Piano comparison branch — local simulation

This branch starts from `origin/main` and contains only the Piano option. RevenueCat is implemented in a separate branch from the same baseline. No Piano, Stripe, Amplitude, or HubSpot network requests occur; the simulation demonstrates application boundaries, not an installed provider SDK.

Run `bun run build` then `bun run start --port 3120`. Use the bottom devtools to switch from the default **Legacy regwall** to **Piano paywall**.

1. Read three distinct articles. The fourth requires a subscription, even when logged in.
2. Open **View subscription benefits** for Benefit 1–5 and lorem ipsum content from the mock Sanity adapter.
3. The Piano-style inline offer is on that same page. **Log in to subscribe** uses the existing Auth0 chooser and returns to the offer. Cancelling login returns to the original article.
4. **Simulate successful payment** grants the current user's Piano UID access to the `EQDESK_ARTICLES` resource for 30 days. The server verifies access before redirecting to the original article.
5. Switch users to verify access isolation. Toggle the rollout off and on to verify rollback. **Clear reading cookie** preserves subscriptions; **Reset my demo subscription** resets only the logged-in user's paid record.

The same browser-session reading cookie is used for anonymous and logged-in non-subscribers. It is never reset by switching rollout flags, logging in, or purchasing. Logged-in readers retain unlimited access under the original legacy flag.

### Integration boundaries

- `lib/article-access.ts` owns the server access policy used by list links, read counting, and article rendering.
- `lib/amplitude/flags.ts` is the local server flag stub. Its HTTP-only cookie is a devtool stand-in, not production flag security or an actual Amplitude integration.
- `lib/piano/identity.ts` maps a server-verified Auth0 user to Piano UID. This simulates **Identity Linking**; there is no Piano ID login and no fake token is presented as a real JWT.
- `lib/piano/simulator.ts` returns the relevant shape of Piano's `publisher/user/access/check`: `code`, `access.granted`, `access.expire_date` (Unix seconds), and resource ID.
- `components/piano/inline-offer.tsx` stands in for `tp.offer.show` with inline mode and a `loginRequired` callback. It contains no Piano JS bundle, actual iframe, payment fields, real price, or charge.
- `/demo/piano/purchase` accepts POST only, ignores browser-supplied user IDs, and uses the verified Auth0-to-Piano mapping. It checks resource access after purchase instead of trusting a success query string.
- `.demo-data/piano/` holds ignored per-user JSON records that survive restarts and are isolated to this worktree. This is local-only storage.

For a live integration, arrange Piano Identity Linking and Stripe Billing access, connect your Stripe sandbox, configure a resource/term/offer, and implement the verified JWT bridge. Replace the inline offer and access simulator with Piano JS and server REST calls. Add authenticated idempotent webhooks, paid-state refresh, provider-outage handling, and HubSpot/Amplitude lifecycle events. Real recurring billing, taxes, refunds, and subscription management are outside this local simulation.

Piano's current docs distinguish keeping Auth0 for login from storing linked subscription profiles. Its Stripe Billing integration needs account enablement; manage Piano-created subscriptions through Piano. These account-specific requirements cannot be verified by this simulator.

```sh
TEST_BASE_URL=http://localhost:3120 node --test tests/registration-wall.test.mjs
```

References: [Identity Linking](https://docs.piano.io/en/subscriptions/identity-management-identity-linking), [Checking access](https://docs.piano.io/en/subscriptions/checking-access), [Inline offers](https://docs.piano.io/en/subscriptions/how-to-show-an-offer-using-javascript), [Stripe setup](https://docs.piano.io/en/subscriptions/piano-stripe-billing-integration-guide-setup).
