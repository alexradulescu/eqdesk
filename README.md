# CryptoWire

Session 1 of the interview exercise: a crypto news homepage, full article pages, and a shared price aside. All stories and prices are fictional. The original EQDesk photos and yellow accent are reused. Registration and the reading meter are intentionally outside this phase.

## Run

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000 for API documentation. The unlinked reference implementation is at http://localhost:3000/alex (including its article pages under `/alex/articles`). It is marked `noindex, nofollow`; this is not access control. Click a headline to read it, or **Older stories** for page two. Prices change slightly every five seconds without reloading the page.

The server fetches the bundled REST API at `http://localhost:3000`. For another port or a separately hosted mock API, set `CRYPTOWIRE_API_URL` to its origin (no trailing slash). Both the initial prices and browser polling use that API. This must be a public, browser-reachable URL with CORS enabled when cross-origin.

Production preview:

```sh
bun run build
CRYPTOWIRE_API_URL=http://localhost:3100 bun run start --port 3100
```

## How it works

- `app/layout.tsx` owns only the document shell and font. `app/page.tsx` is static API documentation; it does not fetch or poll prices.
- `app/alex/layout.tsx` owns the reference header, two columns, and persistent price aside.
- `app/alex/page.tsx` fetches six article summaries per page, plus one to check for the next page. It filters future publication dates before rendering.
- `app/alex/articles/[slug]/page.tsx` fetches a full article and rejects unknown or future-dated stories.
- `components/article-body.tsx` sanitizes the HTML body with an explicit tag and attribute allowlist before rendering. Title, date, category, and hero image stay separate.
- `components/price-aside.tsx` fetches the initial prices on the server. `components/prices.tsx` polls every five seconds, skips overlapping requests, aborts on unmount, and keeps last known values after a failure.
- `lib/cryptowire/articles.ts` contains the fixtures. `lib/cryptowire/prices.ts` calculates quotes from five-second time buckets. Quotes stay within 0.1% of their base values; no background timer or database is needed.

Requests use `no-store`: editorial changes appear on the next page request. The layout streams loading states while the API responds. On mobile, prices move below the article/list. Prices use each asset's declared `decimals` (including four for ETH and six for DOGE).

## Mock API

The API reflects the state of the world. Handle what it gives you.

| Endpoint | Response |
| --- | --- |
| `GET /api/articles?limit=12&offset=0` | Article summaries, without `body` |
| `GET /api/articles/:id` | Full article, or 404 |
| `GET /api/prices` | Five simulated assets |

`limit` accepts integers from 1 to 100; `offset` accepts non-negative integers. Every endpoint accepts `?latency=3000` (0–10000 ms) and `?fail=1` (HTTP 500). Invalid numeric parameters return 400. Responses include open CORS and `Cache-Control: no-store`.

Article shape:

```json
{
  "id": "bitcoin-finds-its-footing",
  "title": "Bitcoin finds its footing as investors take the long view",
  "category": "Markets",
  "publishedAt": "2026-09-05T08:00:00Z",
  "image": { "url": "/images/bitcoin.jpg", "alt": "Bitcoin coins" },
  "body": "<p>Article text...</p>"
}
```

Dates are ISO UTC. Some images are `null`. The API deliberately includes one future-dated article, including on direct API access; the news pages hide it. Article bodies are HTML strings and must be sanitized by consumers. The twelve fixtures include eleven published stories.

Price shape:

```json
{
  "symbol": "ETH",
  "name": "Ethereum",
  "price": "3042.55501200",
  "decimals": 4,
  "change24h": "0.87"
}
```

Prices and percentage changes are strings. `decimals` controls price formatting; `change24h` is a percentage, not a fraction. Prices are calculated at request time and change in five-second buckets.

This is a local exercise implementation. Public hosting, hosted rate limiting, a second cohort fixture set, the bonus categories endpoint, and Session 2 are not included.

## Verify

```sh
bun run check
bunx tsc --noEmit
bun run build
```

`check` runs Biome, the source metrics gate, and 15 tests covering the gate, API contracts, publication filtering, HTML sanitization, and price drift. The gate requires fewer than 500 lines per source/configuration file, cyclomatic complexity below 22, cognitive complexity at most 21, and Halstead difficulty below 80.

Manual checks with the dev server:

1. Open `/alex`, then an article: the same price aside remains and prices keep updating.
2. Open `/alex?page=2`: five stories, no embargoed headline.
3. Open `/alex/articles/wallets-designed-for-people`: the missing-image placeholder and full body appear.
4. Open `/alex/articles/tomorrows-market-brief`: story not found.
5. Open `/alex?latency=3000`: loading text appears before the list. Also supported on article URLs.
6. Open `/alex?fail=1`: the error state appears. **Back to latest** removes the simulated failure; **Try again** retries the same request.
7. Block `/api/prices` in browser devtools: last known prices remain with a retry notice. Unblock it: the next successful poll clears the notice.
