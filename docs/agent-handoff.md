# Agent handoff: coaching Alex through the CryptoWire Session 1 build

Read this whole file first, then `docs/session-one-guide.md`.

## Paste this to start the new session

> I'm rehearsing the CryptoWire interview exercise as if I were the candidate. Read `docs/agent-handoff.md` and `docs/session-one-guide.md` in the `alexradulescu/eqdesk` repo. I'll go step by step: I'll tell you the step number, what I wrote, and what I think the landmines are. Review my code against the guide, answer my questions, and tell me what I missed only when I ask.

## Background

- **Who:** Alex is hiring web engineers in London for CoinDesk (the CDM team). They wrote this exercise and are now doing it themselves to check the timing and to relearn Next.js. They last used Next.js a long time ago (Pages Router era). Since then they've built client-side React (a TanStack-based crypto exchange), so React itself is familiar and Next.js 16 App Router concepts are what's rusty.
- **Repo:** `alexradulescu/eqdesk`, a Next.js 16 app with two parts:
  1. **The mock API** the candidate builds against: `app/api/articles`, `app/api/articles/[id]`, `app/api/prices`, with fixtures in `lib/cryptowire/` and public API docs at `/` (`app/page.tsx`).
  2. **Alex's reference implementation** at `/alex` (`app/alex/*`, `components/*`).
- **Interviewer notes:** `docs/interview-points.md`. Checkpoints, questions and rubric for both sessions. Candidates never see it; their material is `docs/candidate-brief.md`.
- **Scope now:** Session 1 only (the manual build). Session 2 (the registration wall with AI) comes later.
- **The rehearsal setup:** a fresh `bun create next-app` project, TypeScript, no Tailwind. Alex styles with next-yak (CSS-in-JS), so ignore CSS entirely; the guide uses plain `className`s. The mock API URL comes from the `API_URL` env var, which Alex will fill in. They type everything by hand in VS Code (with autocomplete), with a terminal and a browser on the side.
- **The guide:** `docs/session-one-guide.md`, 16 numbered steps, about 40 minutes of building with a hard stop. Steps 13–15 are talk only (errors, pagination, caching); step 11 (live prices) and the Extras (custom 404, `next/image`) are built only if time allows. It uses a plain `<img>` and a server-only price aside.
- **Candidate brief:** `docs/candidate-brief.md` is the only written material the candidate gets, besides the API docs page. Every snippet was built and run against the mock API on Next 16.3.6, React 19.2 and bun: it type-checks, builds, filters the embargoed article, and fires none of the XSS traps.

## How to coach

- Go **one step at a time**, using the guide's numbers. For each step Alex sends, compare their code with the guide. Point out bugs and meaningful differences. Accept a different approach if it's sound; the guide is one good answer, not the only one.
- **Don't volunteer landmines.** Alex wants to find them first. When they list what they think the landmines are, confirm the ones they got right, then, only if they ask "what did I miss?", give the rest from the key below.
- Explain Next.js 16 concepts in terms of the client-side React they already know (e.g. "a Server Component is like the data loader and the component in one, and it never ships to the browser").
- Keep a rough time log if Alex gives you times, and compare it with the guide's estimates at the end.
- No over-engineering: the most readable, shortest correct code.
- **Verify Next.js 16 APIs before stating them.** The installed docs live in `node_modules/next/dist/docs/` of this repo (run `bun install` first). Your training data may be older than Next 16.

## Next.js 16 facts already checked (don't re-derive)

- `create-next-app --yes` defaults: TypeScript, Tailwind, ESLint, App Router, Turbopack, `@/*`, and it writes `AGENTS.md`/`CLAUDE.md`. Use `--no-tailwind --empty`.
- `cacheComponents` is **off** by default. With it off, a `fetch` with no cache option that runs before any request-time API can be cached at build time, so the guide uses `cache: "no-store"`.
- `params` and `searchParams` are Promises. `PageProps<"/route">` and `LayoutProps<"/route">` are global generated types (red squiggles until `next dev` or `next typegen` has run).
- `error.tsx` must be a client component, and its recovery prop is **`retry`** (older material says `reset`).
- The API returns **absolute** image URLs (list, detail and `<img>` tags in the body). Types are copyable from the API docs page.
- `<Image>`: `priority` is deprecated in favour of `preload`. Remote hosts need `images.remotePatterns` (a `new URL(...)` works). Images from a private IP (e.g. `localhost`) are refused unless `images.dangerouslyAllowLocalIP: true` is set or the image is `unoptimized`.
- `revalidateTag(tag)` with one argument is deprecated; use `revalidateTag(tag, "max")`, or `{ expire: 0 }` from a webhook route handler.
- `notFound()` in a streamed page (one with `loading.tsx`) returns status 200 with a `noindex` meta tag. That's documented behaviour.

## Landmine key, by step (give only when asked)

| Step | Landmine or challenge | Good answer |
|---|---|---|
| 1 | Picking defaults blindly | Knows what `--yes` turned on; Server Components are the default |
| 2 | Leaking config to the browser; hidden build-time caching | `API_URL` without `NEXT_PUBLIC_`; explicit `no-store`; types copied from the API docs; one helper that turns 404 into `null` and throws on other errors |
| 3 | Duplicating the header and aside per page | One root layout; the aside lives there with its own `<Suspense>` |
| 4 | Fetching client-side with `useEffect` | An async Server Component that awaits the data; a fixed "latest" block (no pagination) |
| 5 | `image: null` crashes or shows a broken image | Placeholder when null; plain `<img>` is fine; decorative `alt=""` on thumbnails. Extra: `next/image` trade-offs and `remotePatterns` |
| 6 | **Embargoed article** (the list's second item has a 2099 `publishedAt`) | Filter by `publishedAt <= now`; don't trust upstream |
| 7 | Future article still reachable by URL; unknown id crashes; raw id in the URL | `notFound()` for missing **and** unpublished (default 404 page is fine); `encodeURIComponent` |
| 8 | **XSS in the body.** Stories #3 (`<img onload/onerror>`) and #4 (`<script>` and a `javascript:` link) fire harmless alerts if rendered raw | Sanitize with an allowlist on the server (`sanitize-html`) before `dangerouslySetInnerHTML`; bonus: "who controls the CMS?" |
| 9 | Aside rendered only on the client (empty first paint, LCP) | Async Server Component; a price failure must not break the page |
| 10 | **Precision**: printing the raw string or hard-coding 2 decimals | `Intl.NumberFormat` with `min`/`maxFractionDigits = decimals`; `Number()` the strings |
| 11 | Talk (build if time): should prices be live at all? | Ask about the requirement first; polling (or TanStack Query `refetchInterval`) for 6 assets, SSE/WebSockets at scale; server first paint + client island; clear the interval; keep last known prices on failure |
| 12 | No loading state (the interviewer triggers `?latency=3000`) | `loading.tsx` plus Suspense fallbacks |
| 13 | Talk: "and on a 500?" | `error.tsx` (client, `retry`); prices fail separately |
| 14 | Talk: "10 articles fine, what about 1 million?" | "Latest" is a fixed block; paging lives in archives/categories; state in the URL; `limit + 1` for "has next"; cursor vs offset (offset shifts under concurrent writes) |
| 15 | Talk: "An editor fixes a typo. How fast is it live?" | `revalidate` window vs on-demand `revalidateTag` from a CMS webhook; `generateStaticParams`; the Cache Components model |
| 16 | Shipping without a build | `bun run build`; read the ○ static vs ƒ dynamic markers |

Interviewer questions from the spec that aren't tied to one step: the A/B-test hero without a deploy (edge flags, cache keys), and "did you look at what the API actually returns?"
