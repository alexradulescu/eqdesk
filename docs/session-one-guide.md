# CryptoWire, Session 1: step-by-step build

A fresh Next.js 16 (App Router) project, built the shortest readable way. CSS is left out: every element has a plain `className` for you to style. Every snippet below was built and run against the mock API (Next 16.3.6, React 19.2, bun).

- Steps 13–15 are **talk only**: the interviewer asks, nothing is built.
- Step 11 and the **Extras** at the end are for candidates with time left.
- The build stops at ~40 minutes whatever state it's in; the rest is discussion.

**Finished file tree**

```text
app/
  layout.tsx              header + two columns + price aside (shared by every page)
  page.tsx                article list
  loading.tsx             loading state
  articles/[id]/page.tsx  article page
components/
  meta.tsx                "category · date" line (list + article)
  article-body.tsx        sanitized HTML body
  price-aside.tsx         prices, rendered on the server
lib/api.ts                types (copied from the API docs) + fetch helper
.env.local                API_URL
```

| # | Step | Time |
|---|---|---|
| 1 | Create the project | 3 min |
| 2 | Env var, types and API helper | 4 min |
| 3 | Root layout: header + two columns | 4 min |
| 4 | Article list | 5 min |
| 5 | Thumbnails and `image: null` | 2 min |
| 6 | Only published articles | 2 min |
| 7 | Article page and 404 | 5 min |
| 8 | Render the HTML body safely | 5 min |
| 9 | Price aside, server-rendered | 4 min |
| 10 | Price formatting | 3 min |
| 11 | Live prices | talk, or build if time |
| 12 | Loading states | 3 min |
| 13 | Error states | talk |
| 14 | Pagination | talk |
| 15 | Caching and "an editor fixes a typo" | talk |
| 16 | Final check | 2 min |

About 40 minutes of typing if nothing goes wrong.

---

## 1. Create the project

```sh
bun create next-app@latest cryptowire --yes --no-tailwind --empty
cd cryptowire
bun add sanitize-html && bun add -d @types/sanitize-html
bun dev
```

- `--yes` takes the defaults: TypeScript, App Router, Turbopack, ESLint, `@/*` alias. `--empty` gives a one-line `page.tsx` instead of the demo page. Candidates who like Tailwind can drop `--no-tailwind`.
- It also writes `AGENTS.md` / `CLAUDE.md` for coding agents. Harmless.
- Cache Components (`cacheComponents` in `next.config.ts`) is **off** by default. Keep it off for this session; step 15 explains what it changes.
- What's new since older Next: the `app/` folder is the router. A folder is a URL segment, `page.tsx` makes it a route, `layout.tsx` wraps it. Components are **Server Components** by default: they can be `async` and `await fetch` directly. Only files that start with `"use client"` run in the browser.

## 2. Env var, types and API helper

`.env.local`

```sh
API_URL=https://<the-mock-api>.vercel.app
```

`lib/api.ts`

```ts
// Types copied from the API docs page.
export type ArticleSummary = {
  id: string;
  title: string;
  category: string;
  publishedAt: string; // ISO 8601, UTC
  image: { url: string; alt: string } | null;
};

export type Article = ArticleSummary & {
  body: string; // HTML
};

export type Price = {
  symbol: string;
  name: string;
  price: string; // full precision
  decimals: number; // digits to display
  change24h: string; // percent
};

export const API_URL = process.env.API_URL;

// Returns null on 404 so pages can call notFound(); throws on anything else.
export async function api<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
  return res.json();
}

export const isPublished = (a: { publishedAt: string }) =>
  new Date(a.publishedAt).getTime() <= Date.now();
```

- The types are copied from the "TypeScript types" section of the API docs page.
- `API_URL` has no `NEXT_PUBLIC_` prefix, so it only exists on the server.
- `cache: "no-store"`: without Cache Components, a `fetch` with no option that runs before any request-time API (`searchParams`, `cookies()`…) can be cached forever at build time. Being explicit avoids that surprise.
- One helper, one place for error handling: `null` means 404, anything else non-OK throws (step 13).

## 3. Root layout: header + two columns

`app/layout.tsx`

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PriceAside } from "@/components/price-aside";
import "./globals.css";

export const metadata: Metadata = { title: "CryptoWire" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <Link href="/">CRYPTOWIRE</Link>
        </header>
        <div className="columns">
          <main>{children}</main>
          <aside className="aside">
            <h2>Prices</h2>
            <Suspense fallback={<p>Loading prices…</p>}>
              <PriceAside />
            </Suspense>
          </aside>
        </div>
      </body>
    </html>
  );
}
```

- The layout wraps **every** page and does not re-render when you navigate between them, so the header and aside are written once and shared by the list and article pages. That answers "same aside on both pages, how is it structured?"
- `LayoutProps<"/">` and `PageProps<"/…">` are global types generated by Next. The editor may show a red squiggle on them until `bun dev` has run once.
- `<Suspense>` lets the page stream without waiting for prices. `PriceAside` arrives in step 9; comment those three lines out until then.
- `globals.css` is yours.

## 4. Article list

`app/page.tsx`

```tsx
import Link from "next/link";
import { Meta } from "@/components/meta";
import { type ArticleSummary, api, isPublished } from "@/lib/api";

export default async function Home() {
  const rows = await api<ArticleSummary[]>("/articles?limit=10");
  const articles = (rows ?? []).filter(isPublished);

  return (
    <>
      <h1>Latest</h1>
      {articles.length === 0 && <p>No stories yet.</p>}
      <ul className="list">
        {articles.map((a) => (
          <li key={a.id}>
            <Link href={`/articles/${a.id}`} className="row">
              {a.image ? (
                <img src={a.image.url} alt="" width={120} height={80} />
              ) : (
                <div className="thumb-placeholder" />
              )}
              <div>
                <h2>{a.title}</h2>
                <Meta category={a.category} publishedAt={a.publishedAt} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

- An `async` Server Component: `await` the data, return JSX. No `useEffect`, no loading flags.
- `limit=10` is a fixed "latest" block; more lists belong elsewhere on the site (step 14).
- `<Link>` is Next's client-side navigation; it also prefetches.

`components/meta.tsx`

```tsx
export function Meta({
  category,
  publishedAt,
}: {
  category: string;
  publishedAt: string;
}) {
  return (
    <p className="meta">
      {category} · {new Date(publishedAt).toDateString()}
    </p>
  );
}
```

- Any readable date is fine; formatting isn't what's being assessed. `toDateString()` gives `Sat Sep 05 2026`.

## 5. Thumbnails and `image: null`

In step 4's code: `a.image ? <img …/> : <div className="thumb-placeholder" />`.

- Image URLs from the API are absolute, so they go straight into `src`. No config needed.
- ESLint warns that `<img>` could be slower than `next/image`. That's expected here; `next/image` is an extra (see the end).
- Thumbnail `alt=""`: the title next to it already describes the row, so the image is decorative.

## 6. Only published articles

In step 4's code: `.filter(isPublished)` (from `lib/api.ts`).

- `isPublished` compares `publishedAt` with now.

## 7. Article page and 404

`app/articles/[id]/page.tsx`, a dynamic route: `[id]` becomes `params.id`.

`app/articles/[id]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { Meta } from "@/components/meta";
import { type Article, api, isPublished } from "@/lib/api";

export default async function ArticlePage({
  params,
}: PageProps<"/articles/[id]">) {
  const { id } = await params;
  const article = await api<Article>(`/articles/${encodeURIComponent(id)}`);
  if (!article || !isPublished(article)) notFound();

  return (
    <article>
      <Link href="/">← Back to latest</Link>
      <h1>{article.title}</h1>
      <Meta category={article.category} publishedAt={article.publishedAt} />
      {article.image && <img src={article.image.url} alt={article.image.alt} />}
      <ArticleBody html={article.body} />
    </article>
  );
}
```

- `params` is a **Promise** in Next 15+, so it is awaited. Same for `searchParams`.
- `encodeURIComponent(id)`: the id comes from the URL, so don't paste it raw into another URL.
- `notFound()` throws and shows Next's default 404 page. It also covers a future-dated article opened by URL, not only via the list. A custom `not-found.tsx` is an extra.
- If the page streams (a `loading.tsx` is present), the 404 page is sent with status 200 plus a `noindex` tag. That's Next's documented behavior, not a bug in your code.

## 8. Render the HTML body safely

`components/article-body.tsx`

```tsx
import sanitizeHtml from "sanitize-html";

// Allowlist: sanitize-html's defaults (no <script>, no on* handlers,
// no javascript: URLs) plus <img>.
const options = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
};

export function ArticleBody({ html }: { html: string }) {
  return (
    <div
      className="body"
      // Safe: sanitized on the server before it reaches the browser.
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html, options) }}
    />
  );
}
```

- React escapes strings, so `{article.body}` would print tags as text. `dangerouslySetInnerHTML` renders the HTML, including anything harmful in it.
- `sanitize-html` runs on the server (this is a Server Component), so no sanitizer is shipped to the browser. Its defaults already drop `<script>`, `on*` attributes and `javascript:` URLs; we only add `<img>`.
- Test it: open a few articles and check that no alert pops up.

## 9. Price aside, server-rendered

`components/price-aside.tsx`

```tsx
import { type Price, api } from "@/lib/api";

const format = (p: Price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
  }).format(Number(p.price));

// Server component: prices are in the first HTML, no client JS.
export async function PriceAside() {
  const prices = await api<Price[]>("/prices").catch(() => null);
  if (!prices) return <p className="error">Prices unavailable.</p>;

  return (
    <ul className="prices">
      {prices.map((p) => {
        const up = Number(p.change24h) >= 0;
        return (
          <li key={p.symbol}>
            <strong>{p.symbol}</strong> {format(p)}{" "}
            <span className={up ? "up" : "down"}>
              {up ? "▲ +" : "▼ "}
              {p.change24h}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
```

- An async Server Component: prices are in the initial HTML (no empty aside, good for LCP) and no JavaScript ships for it.
- `.catch(() => null)`: a price outage must not take the whole page down. The aside shows its own message instead.
- Now un-comment `<PriceAside />` in the layout.

## 10. Price formatting

The `format` function in step 9.

- `price` is a string with full precision; `decimals` says how many digits to show. `Intl.NumberFormat` adds the `$`, thousands separators and rounding.
- `change24h` is a string too; `Number()` it before comparing with 0.

## 11. Live prices (talk, or build if time)

The bold question: "Do prices need to update live? What if they tick every second across 50 assets?"

- Ask about the requirement first. For the build, "load once" is fine.
- Options: polling (a `setInterval`, or TanStack Query's `refetchInterval`), server-sent events, WebSockets. Polling is fine for 6 assets; a stream is the "every second, 50 assets" answer.
- Structure: keep the server fetch for the first paint, then hand the prices to a small `"use client"` component that updates them. Its props must be plain data, so the API URL is passed as a string.
- Failure: keep showing the last known prices with a message rather than blanking the aside.

If there's time to build it, `components/price-aside.tsx` becomes a thin server wrapper:

`components/price-aside.tsx`

```tsx
import { API_URL, type Price, api } from "@/lib/api";
import { Prices } from "./prices";

// Server component: first paint has real prices, then the client polls.
export async function PriceAside() {
  const prices = await api<Price[]>("/prices").catch(() => null);
  return <Prices initial={prices ?? []} url={`${API_URL}/api/prices`} />;
}
```

`components/prices.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import type { Price } from "@/lib/api";

const format = (p: Price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
  }).format(Number(p.price));

export function Prices({ initial, url }: { initial: Price[]; url: string }) {
  const [prices, setPrices] = useState(initial);
  const [failed, setFailed] = useState(initial.length === 0);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        setPrices(await res.json());
        setFailed(false);
      } catch {
        setFailed(true); // keep showing the last known prices
      }
    }, 5000);
    return () => clearInterval(id);
  }, [url]);

  return (
    <>
      {failed && <p className="error">Prices unavailable, retrying…</p>}
      <ul className="prices">
        {prices.map((p) => {
          const up = Number(p.change24h) >= 0;
          return (
            <li key={p.symbol}>
              <strong>{p.symbol}</strong> {format(p)}{" "}
              <span className={up ? "up" : "down"}>
                {up ? "▲ +" : "▼ "}
                {p.change24h}%
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
```

- The API sends `Access-Control-Allow-Origin: *`, so the browser can call it directly.
- With TanStack Query: `useQuery({ queryKey: ["prices"], queryFn, initialData: initial, refetchInterval: 5000 })` replaces the `useEffect`, and needs a `QueryClientProvider` in a client component around the app.

## 12. Loading states

`app/loading.tsx`

```tsx
export default function Loading() {
  return <p>Loading…</p>;
}
```

- `loading.tsx` wraps the page in a Suspense boundary automatically: the layout (header + aside) shows immediately and this replaces the page until its data arrives.
- The aside already has its own `<Suspense fallback>` from step 3.
- Test: temporarily add `?latency=3000` to the articles fetch.

## 13. Error states (talk)

"And on a 500?" (`?fail=1`). What a good answer covers:

- `app/error.tsx`: an error boundary for the page. It must be a Client Component (`"use client"`), keeps the layout around it, and gets a **`retry`** prop to try again (Next 16.3 name; older material says `reset`). `api()` already throws on a 500, so the boundary would catch it.
- Prices fail separately: the aside shows its own message, so the page keeps working.
- `global-error.tsx` for errors in the root layout itself.

## 14. Pagination (talk)

"This is fine at 10 articles. What changes at 1 million?"

- "Latest" is a fixed block of N; archives, category pages and search are where paging lives.
- Page state in the URL (`?page=` or `?cursor=`, read from `searchParams`) so it's shareable and the back button works.
- Offset vs cursor: offset is simple but shifts when new articles are published while someone is paging; a cursor (the last `publishedAt` + id) is stable and cheaper for the database.
- Fetch `limit + 1` to know if there's a next page without a count query.

## 15. Caching and "an editor fixes a typo" (talk)

What the code does now: every request fetches fresh (`no-store`, pages marked `ƒ Dynamic` in `bun run build`).

- **Time-based:** `fetch(url, { next: { revalidate: 60 } })` serves a cached copy and refreshes it in the background at most once a minute. A typo fix is live within ~60 s.
- **On demand:** `fetch(url, { next: { tags: ["article-" + id] } })`, then a route handler called by a CMS webhook runs `revalidateTag("article-" + id, "max")` (Next 16 wants the second argument: `"max"` serves the old copy once while refetching, `{ expire: 0 }` makes the next request wait for fresh data).
- **Pre-render articles:** `generateStaticParams()` in `articles/[id]/page.tsx` builds known ids at build time; unknown ones render on first request.
- **Cache Components (Next 16's new model, `cacheComponents: true`):** caching becomes opt-in with a `"use cache"` directive plus `cacheLife()` / `cacheTag()`, and uncached data must sit inside `<Suspense>`. A static shell (header, layout) is served instantly and the dynamic parts stream in.

## 16. Final check

```sh
bun run build   # type-checks and shows each route as static (○) or dynamic (ƒ)
bun start
```

Click through: list → article → back, and an unknown id (`/articles/nope`).

---

## Extras (if time, or as questions)

**Custom 404.** `notFound()` renders the nearest `not-found.tsx`:

`app/not-found.tsx`

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>Story not found</h1>
      <Link href="/">← Back to latest</Link>
    </div>
  );
}
```

**`next/image` instead of `<img>`.** It resizes images per screen width, converts to WebP/AVIF, lazy-loads by default and prevents layout shift (it requires `width`/`height`). The cost: config, and resizing runs on your server or Vercel.

```tsx
import Image from "next/image";

<Image src={article.image.url} alt={article.image.alt} width={1200} height={675} preload />
```

```ts
// next.config.ts
images: {
  remotePatterns: [new URL(`${process.env.API_URL}/images/**`)],
  // Only while API_URL is localhost: Next 16 refuses private IPs by default.
  dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
},
```

- `preload` is Next 16's replacement for the old `priority` prop; use it on the page's main image.
- Restart `bun dev` after changing `next.config.ts`.
- When the CMS or an image CDN already resizes images, pass `<Image>` a custom `loader` that builds the CDN's URL, or use `<img>` with the CDN's `srcset`.
