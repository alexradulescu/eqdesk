# CryptoWire, Session 1: step-by-step build

A fresh Next.js 16 (App Router) project, built the shortest readable way. CSS is left out: every element has a plain `className` for you to style. Every snippet below was built and run against the mock API (Next 16.3.6, React 19.2, bun).

**Finished file tree**

```text
app/
  layout.tsx            header + two columns + price aside (shared by every page)
  page.tsx              article list + pagination
  loading.tsx           loading state
  error.tsx             error state
  not-found.tsx         404
  articles/[id]/page.tsx  article page
components/
  meta.tsx              "category · date" line (list + article)
  article-body.tsx      sanitized HTML body
  price-aside.tsx       server: first fetch of prices
  prices.tsx            client: formatting + polling
lib/api.ts              types + fetch helper
next.config.ts          allowed image host
.env.local              API_URL
```

| # | Step | Time |
|---|---|---|
| 1 | Create the project | 3 min |
| 2 | Env var and API helper | 5 min |
| 3 | Root layout: header + two columns | 4 min |
| 4 | Article list | 6 min |
| 5 | Thumbnails and `image: null` | 4 min |
| 6 | Only published articles | 2 min |
| 7 | Article page and 404 | 7 min |
| 8 | Render the HTML body safely | 5 min |
| 9 | Price aside, server-rendered | 4 min |
| 10 | Price formatting | 3 min |
| 11 | Live prices (client polling) | 6 min |
| 12 | Loading states | 3 min |
| 13 | Error states | 4 min |
| 14 | Pagination | 4 min |
| 15 | Caching and "an editor fixes a typo" | talk |
| 16 | Final check | 3 min |

Roughly 60 minutes of typing if nothing goes wrong.

---

## 1. Create the project

```sh
bun create next-app@latest cryptowire --yes --no-tailwind --empty
cd cryptowire
bun add sanitize-html && bun add -d @types/sanitize-html
bun dev
```

- `--yes` takes the defaults: TypeScript, App Router, Turbopack, ESLint, `@/*` alias. `--empty` gives a one-line `page.tsx` instead of the demo page.
- It also writes `AGENTS.md` / `CLAUDE.md` for coding agents. Harmless.
- Cache Components (`cacheComponents` in `next.config.ts`) is **off** by default. Keep it off for this session; step 15 explains what it changes.
- What's new since older Next: the `app/` folder is the router. A folder is a URL segment, `page.tsx` makes it a route, `layout.tsx` wraps it. Components are **Server Components** by default: they can be `async` and `await fetch` directly. Only files that start with `"use client"` run in the browser.

## 2. Env var and API helper

`.env.local`

```sh
API_URL=https://<the-mock-api>.vercel.app
```

`lib/api.ts`

```ts
export type ArticleSummary = {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  image: { url: string; alt: string } | null;
};

export type Article = ArticleSummary & { body: string };

export type Price = {
  symbol: string;
  name: string;
  price: string;
  decimals: number;
  change24h: string;
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

export const imageUrl = (url: string) => `${API_URL}${url}`;
```

- `API_URL` has no `NEXT_PUBLIC_` prefix, so it only exists on the server. The browser gets the URL later as a prop (step 11).
- `cache: "no-store"`: without Cache Components, a `fetch` with no option that runs before any request-time API (`searchParams`, `cookies()`…) can be cached forever at build time. Being explicit avoids that surprise.
- One helper, one place for error handling: `null` means 404, anything else non-OK throws (caught by `error.tsx` in step 13).
- Image URLs from the API are relative (`/images/…`), so they need the API origin in front.

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

Start with titles only, then fill in the rest in steps 5, 6 and 14. The finished file:

`app/page.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import { Meta } from "@/components/meta";
import { type ArticleSummary, api, imageUrl, isPublished } from "@/lib/api";

const PAGE_SIZE = 6;

export default async function Home({ searchParams }: PageProps<"/">) {
  const { page: raw } = await searchParams;
  const page = Math.max(1, Number(raw) || 1);

  // Ask for one extra row: if it comes back, there is a next page.
  const rows = await api<ArticleSummary[]>(
    `/articles?limit=${PAGE_SIZE + 1}&offset=${(page - 1) * PAGE_SIZE}`,
  );
  const hasNext = (rows?.length ?? 0) > PAGE_SIZE;
  const articles = (rows ?? []).slice(0, PAGE_SIZE).filter(isPublished);

  return (
    <>
      <h1>Latest</h1>
      {articles.length === 0 && <p>No stories yet.</p>}
      <ul className="list">
        {articles.map((a) => (
          <li key={a.id}>
            <Link href={`/articles/${a.id}`} className="row">
              {a.image ? (
                <Image
                  src={imageUrl(a.image.url)}
                  alt=""
                  width={120}
                  height={80}
                />
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
      <nav className="pager">
        {page > 1 && <Link href={`/?page=${page - 1}`}>← Newer</Link>}
        {hasNext && <Link href={`/?page=${page + 1}`}>Older →</Link>}
      </nav>
    </>
  );
}
```

- An `async` Server Component: `await` the data, return JSX. No `useEffect`, no loading flags.
- `searchParams` is a **Promise** in Next 15+, so it is awaited.
- `<Link>` is Next's client-side navigation; it also prefetches.

`components/meta.tsx`, used by the list and the article page:

```tsx
export function Meta({
  category,
  publishedAt,
}: {
  category: string;
  publishedAt: string;
}) {
  const date = new Date(publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <p className="meta">
      {category} · <time dateTime={publishedAt}>{date}</time>
    </p>
  );
}
```

- `timeZone: "UTC"` keeps the date the same on any server.

## 5. Thumbnails and `image: null`

In step 4's code: `a.image ? <Image …/> : <div className="thumb-placeholder" />`.

`next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`${process.env.API_URL}/images/**`)],
  },
};

export default nextConfig;
```

- `next/image` optimizes images through the Next server and only accepts remote hosts you allow here. Restart `bun dev` after changing the config.
- Thumbnail `alt=""`: the title next to it already describes the row, so the image is decorative.
- **Local gotcha:** if `API_URL` is `http://localhost:…`, Next 16 refuses to optimize images from a private IP (SSRF protection) and the image 400s. With a deployed API it just works. Locally, add `dangerouslyAllowLocalIP: true` under `images` or pass `unoptimized` to `<Image>`.

## 6. Only published articles

In step 4's code: `.filter(isPublished)` (from `lib/api.ts`).

- `isPublished` compares `publishedAt` with now. Filter **after** slicing, so the pagination count stays tied to the API's pages.

## 7. Article page and 404

`app/articles/[id]/page.tsx`, a dynamic route: `[id]` becomes `params.id`.

`app/articles/[id]/page.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { Meta } from "@/components/meta";
import { type Article, api, imageUrl, isPublished } from "@/lib/api";

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
      {article.image && (
        <Image
          src={imageUrl(article.image.url)}
          alt={article.image.alt}
          width={1200}
          height={675}
          preload
        />
      )}
      <ArticleBody html={article.body} />
    </article>
  );
}
```

- `params` is a Promise too.
- `encodeURIComponent(id)`: the id comes from the URL, so don't paste it raw into another URL.
- `notFound()` throws and renders the nearest `not-found.tsx`. It also covers a future-dated article opened by URL, not only via the list.
- `preload` on the hero image (Next 16's replacement for the old `priority` prop) because it's the page's largest image.
- If the page streams (a `loading.tsx` is present), the 404 page is sent with status 200 plus a `noindex` tag. That's Next's documented behavior, not a bug in your code.

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
import { API_URL, type Price, api } from "@/lib/api";
import { Prices } from "./prices";

// Server component: first paint has real prices, then the client polls.
export async function PriceAside() {
  const prices = await api<Price[]>("/prices").catch(() => null);
  return <Prices initial={prices ?? []} url={`${API_URL}/api/prices`} />;
}
```

- A server component does the first fetch, so prices are in the initial HTML (no empty aside, good for LCP), then hands them to a client component.
- `.catch(() => null)`: a price outage must not take the whole page down. The aside shows its own error instead (step 11).
- Now un-comment `<PriceAside />` in the layout.

## 10. Price formatting

In `components/prices.tsx` (full file in step 11):

```tsx
const format = (p: Price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
  }).format(Number(p.price));
```

- `price` is a string with full precision; `decimals` says how many digits to show. `Intl.NumberFormat` adds the `$`, thousands separators and rounding.
- `change24h` is a string too; `Number()` it before comparing with 0.

## 11. Live prices (client polling)

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

- `"use client"` makes this a Client Component: it can use state and effects. Its props must be serializable (plain data, no functions), which is why the URL is passed as a string.
- Polling every 5 s with `setInterval` in `useEffect`, cleaned up on unmount. Simple and enough for 6 assets; SSE or WebSockets are the "every second, 50 assets" answer.
- On failure it keeps the last prices and shows a message instead of blanking the aside.
- The API sends `Access-Control-Allow-Origin: *`, so the browser can call it directly.

## 12. Loading states

`app/loading.tsx`

```tsx
export default function Loading() {
  return <p>Loading…</p>;
}
```

- `loading.tsx` wraps the page in a Suspense boundary automatically: the layout (header + aside) shows immediately and this replaces the page until its data arrives.
- The aside already has its own `<Suspense fallback>` from step 3.
- Test: temporarily add `?latency=3000` to the fetch URL in `lib/api.ts` (or to the articles call only).

## 13. Error states

`app/error.tsx`

```tsx
"use client";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div>
      <h1>Couldn’t load the news</h1>
      <button type="button" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
```

- `error.tsx` must be a Client Component. It catches errors thrown while rendering the page (our `api()` throws on 500) and keeps the layout around it.
- Next 16.3 names the prop **`retry`** (older docs and tutorials say `reset`).
- Test: temporarily add `?fail=1` to the articles fetch. For prices, add it to the polling URL and the aside shows its message while the page keeps working.

## 14. Pagination

Already in step 4's code:

- `?page=N` in the URL, read from `searchParams`. The URL is the state, so pages are shareable and the back button works.
- Ask for `PAGE_SIZE + 1` rows: if the extra one comes back, show "Older →". No count endpoint needed.
- `Math.max(1, Number(raw) || 1)` turns `?page=abc` or `?page=-3` into page 1.

## 15. Caching and "an editor fixes a typo"

Nothing to build; this is the discussion step. What the code does now: every request fetches fresh (`no-store`, pages marked `ƒ Dynamic` in `bun run build`).

- **Time-based:** `fetch(url, { next: { revalidate: 60 } })` serves a cached copy and refreshes it in the background at most once a minute. A typo fix is live within ~60 s.
- **On demand:** `fetch(url, { next: { tags: ["article-" + id] } })`, then a route handler called by a CMS webhook runs `revalidateTag("article-" + id)`. The fix is live on the next request.
- **Pre-render articles:** `generateStaticParams()` in `articles/[id]/page.tsx` builds known ids at build time; unknown ones render on first request.
- **Cache Components (Next 16's new model, `cacheComponents: true`):** caching becomes opt-in with a `"use cache"` directive plus `cacheLife()` / `cacheTag()`, and uncached data must sit inside `<Suspense>`. A static shell (header, layout) is served instantly and the dynamic parts stream in.

## 16. Final check

```sh
bun run build   # type-checks and shows each route as static (○) or dynamic (ƒ)
bun start
```

Click through: list → article → back, page 2, an unknown id (`/articles/nope`), and watch the prices change every 5 s.
