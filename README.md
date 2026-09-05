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

## RevenueCat comparison branch — local simulation

This branch starts from `origin/main` and contains only the RevenueCat option. The separate Piano branch starts from the same commit. No RevenueCat, Stripe, Amplitude, or HubSpot network requests occur; this is a working simulation of the application boundaries, not an installed provider SDK.

Run `bun run build` then `bun run start --port 3110`. The initial flag is `legacy_regwall`. In the bottom devtools, choose **Switch to RevenueCat paywall**. That server-read, HTTP-only cookie stands in for an Amplitude flag evaluation.

1. Read three distinct stories. The fourth requires a subscription, even when logged in.
2. Open **View subscription benefits** for Benefit 1–5 and lorem ipsum content from the mock Sanity adapter.
3. Choose **Subscribe**, log in through the existing Auth0 chooser, and confirm the simulated payment.
4. The server grants the current Auth0 subject 30 days of access and verifies the entitlement before returning to the original article.
5. Switch users to verify purchase isolation. Toggle the flag off and on to verify rollback. **Clear reading cookie** never clears paid access; **Reset my demo subscription** resets only the current user's local paid record.

The original three-free-articles cookie remains shared across anonymous and signed-in reading in a browser. It is unchanged by rollout, login, checkout, and flag rollback. Legacy logged-in readers continue to have unlimited access while the legacy flag is selected.

### Integration boundaries

- `lib/article-access.ts` owns the server access policy used by list links, read counting, and protected article rendering.
- `lib/amplitude/flags.ts` is the local server flag stub. Replace it with authenticated Amplitude server evaluation and exposure instrumentation; never accept a client flag as a production access authority.
- `lib/revenuecat/simulator.ts` returns the relevant RevenueCat REST v1 customer shape (`subscriber.entitlements.articles`) and checks expiry. Replace the simulator read with a server RevenueCat customer lookup keyed to the verified Auth0 subject.
- `/demo/revenuecat/checkout` and its POST purchase route stand in for RevenueCat Web SDK + Stripe Billing checkout. There are no card fields, real prices, payment sessions, or live charges. The purchase route ignores submitted user IDs and uses the server session.
- `.demo-data/revenuecat/` stores ignored per-user JSON records. Files survive server restarts and are isolated to this worktree. This is local-only storage, not a production subscription database.

For a real integration, connect your Stripe sandbox in RevenueCat, configure an offering and `articles` entitlement, use the RevenueCat Web SDK with the verified user mapping, and add authenticated, idempotent webhook refresh. Handle payment-pending and provider-unavailable states. HubSpot and Amplitude lifecycle delivery, real recurring billing, taxes, refunds, customer portal, and provider outage handling are intentionally not simulated here.

Run the complete regression and simulation suite against this running preview:

```sh
TEST_BASE_URL=http://localhost:3110 node --test tests/registration-wall.test.mjs
```

Provider references: [Stripe Billing](https://www.revenuecat.com/docs/web/integrations/stripe), [Web SDK](https://www.revenuecat.com/docs/web/web-billing/web-sdk), [Customer API](https://www.revenuecat.com/docs/api-v1/customers).
