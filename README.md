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

## Quality checks

Run `bun run check` locally or in CI after `bun install --frozen-lockfile`.
It runs Biome, the metrics gate, and the gate's regression tests. `bun run lint`
also enforces all four limits; `bun run metrics` prints the numerical report.

| Metric | Scope | Passing value |
| --- | --- | --- |
| Cognitive complexity | Each function, using Biome 2.4.2 | ≤ 21 |
| Cyclomatic complexity | Each function, using `@makerx/complexity-verifier` 1.0.0 | ≤ 21 |
| Halstead difficulty | Each function, using the same analyzer | < 80 |
| Physical lines | Each source/configuration file, including blanks and comments | ≤ 499 |

The metrics gate scans Git-tracked and untracked, non-ignored JS/TS/JSX/TSX
(including module variants), CSS, and JSON files. Tests and scripts are included.
Dependencies, bundled `.agents`/`.claude` skills, `.next`, `dist`, `build`, `out`, `coverage`, `public`, `docs`, and
TypeScript declaration files are excluded. A final newline does not add a line.
CSS and JSON receive only the line-count check. Functionless modules have no
function metrics; zero in the report means no measured functions.

The analyzer and its TypeScript parser are pinned by `bun.lock`; installation
must use the frozen lockfile in CI. Parsing failures fail the metrics command.
Functions include declarations, expressions, arrows, methods, constructors, and
accessors. Following this analyzer's convention, enclosing functions include
nested-function syntax; nested functions are also checked individually.

Cyclomatic complexity starts at 1 and adds branches for `if`, loops, `case`,
`catch`, ternaries, and `&&`, `||`, `??`. Halstead difficulty is
`(distinct operators / 2) × (total operands / distinct operands)`, or zero when
there are no operands. The pinned analyzer counts identifiers, numeric literals,
and string literals as operands. It counts its recognized expression and control
operators; JSX tags/attributes contribute identifier and string operands, JSX
text and markup punctuation do not, and embedded expressions are traversed.
These are analyzer-specific conventions, not interchangeable scores from other tools.

Failures name the file, function location, metric, and required limit. Keep
component boundaries unchanged until a responsibility or measured hotspot
justifies extraction; do not compress lines or add memoization to game the gate.


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
