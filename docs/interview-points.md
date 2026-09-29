# CryptoWire: interviewer notes

> **Interviewer only. Never share with candidates.**

What candidates get: `docs/candidate-brief.md` (session 1), `docs/candidate-brief-part-2.md` (session 2) and the public API docs at the API root. The full build is in `docs/session-one-guide.md`. This file holds the checkpoints to watch and the questions to ask.

**Format:** two sessions, one sitting or two calls.

- Session 1: manual build, 60–90 min. Hard stop at ~40 min of building, then discussion.
- Session 2: AI-assisted extension, 60–90 min.
- Nobody has to finish. The build is there to start the discussion.

---

## Session 1: checkpoints

The build ends at step 11 of the guide. After that it's extras (build if time) and questions.

| # | Checkpoint | Landmine | Good answer |
|---|---|---|---|
| 1 | Create the project | Picking defaults blindly | Knows what `--yes` turned on; Server Components are the default |
| 2 | Env var, types, API helper | Config leaked to the browser; hidden build-time caching | `API_URL` without `NEXT_PUBLIC_`; explicit `no-store`; one helper: 404 → `null`, other errors throw |
| 3 | Root layout | Header and aside duplicated per page | One root layout; aside in its own `<Suspense>` |
| 4 | Article list | Client-side fetch in `useEffect` | Async Server Component |
| 5 | Thumbnails | `image: null` crashes or shows a broken image | Placeholder when null; decorative `alt=""` on thumbnails |
| 6 | Published only | **Embargoed article** (second in the list, `publishedAt` in 2099) | Filters `publishedAt <= now`; doesn't trust upstream |
| 7 | Article page | Future article reachable by URL; unknown id crashes or returns 200; raw id pasted into the URL | `notFound()` for missing **and** unpublished; `encodeURIComponent` |
| 8 | HTML body | **XSS.** Story #3 (`<img onload/onerror>`) and #4 (`<script>`, `javascript:` link) fire alerts if rendered raw | Sanitize with an allowlist on the server before `dangerouslySetInnerHTML`; bonus: "who controls the CMS?" |
| 9 | Price aside | Aside rendered only on the client (empty first paint) | Server fetch for first paint, or client-only with a reason (e.g. keeps the layout cacheable); a price failure doesn't break the page |
| 10 | Price formatting | **Precision**: raw string, or 2 decimals for everything | `Intl.NumberFormat` with min/max fraction digits = `decimals`; `Number()` the strings |
| 11 | Live prices | Interval never cleared; one failure blanks the aside | Asks about the requirement first; clears the interval; keeps last known prices |

**Extras (build if time, or ask):**

| # | Topic | Good answer |
|---|---|---|
| 12 | Loading (trigger `?latency=3000` live) | `loading.tsx` plus Suspense fallbacks |
| 13 | Errors ("and on a 500?", `?fail=1`) | `error.tsx` (client component, `retry` prop); prices fail separately |
| 14 | Pagination | See questions |
| 15 | Caching | See questions |
| 16 | Final check | `bun run build`; reads ○ static vs ƒ dynamic |
| — | Custom 404, `next/image` | `not-found.tsx`; `remotePatterns`, `preload`, what `<img>` gives up |

**API facts worth knowing:**

- Debug params on every endpoint: `?latency=3000` (delay), `?fail=1` (500).
- Prices are strings at full precision, with `decimals` per asset (BTC/ETH/SOL 2, XRP/USDC 4, DOGE 5).
- Image URLs are absolute. Some articles have `image: null`.
- `?limit=` and `?offset=` work on `/api/articles`. `/api/categories` doesn't exist (discussion only).

## Session 1: questions

Asked as the code appears. **Bold = never cut.** Cut from the bottom under time pressure.

| When | Question | Good answer |
|---|---|---|
| Price aside built | **"Do prices need to update live? What if they tick every second across 50 assets?"** | Asks about the requirement first; polling vs SSE vs WebSocket; server first paint + client island |
| Article body renders | **"The body is HTML from the CMS. How do you render it safely?"** | Names XSS unprompted; sanitize with an allowlist on the server; "who controls the CMS?" |
| Article page done | **"An editor fixes a typo. How fast is it live, and why?"** | `revalidate` window vs on-demand `revalidateTag` from a CMS webhook; stale-while-revalidate trade-off; `generateStaticParams`; Cache Components (`"use cache"`) |
| List works | "Fine at 10 articles. What about 1 million?" | Pagination in the URL; `limit + 1` for "has next"; cursor vs offset (offset shifts under concurrent writes) |
| Aside on both pages | "Same aside on list and article: how is it structured?" | One component in the root layout, one fetch |
| Aside client-rendered | "Lighthouse flags the aside as LCP. Fix?" | Server-render initial values, update on the client after |
| Prices render | "Check a rendered price against the raw API value." | Uses `decimals`, not the raw string or a fixed 2 |
| Embargoed article | "Did you look at what the API actually returns?" | Filters defensively; reads the data, not just the docs |
| Spare time | "Marketing wants to A/B test the homepage hero without a deploy." | Edge flags; per-variant cache keys. **First to cut.** |

---

## Session 2: checkpoints

The page states (wireframes in the part 2 brief): A, anonymous with free articles left (meter, full body); B, anonymous with none left (banner, no body); C, logged in (no meter, [Logout]). The homepage doesn't change.

- **Meter:** one conditional component, or logic spread through the page?
- **Session:** the fake login is modelled as a cookie, not a boolean in React state.
- **Where the gate runs:** server-side. The likely AI first answer is **client-side-only gating**: easy to bypass, and it either hides the body from crawlers or cloaks. Catching that unprompted is the strongest signal.
- **Header:** the Register/Login → Logout swap forces an auth-state decision on every page.
- **Comprehension:** "Walk me through the final code." Anyone can generate it; the signal is understanding it.

## Session 2: questions

| When | Question | Good answer |
|---|---|---|
| Gate works | **"Google's crawler must read full articles or SEO dies. How does the gate handle that?"** | Cloaking is a policy problem, not just a tech one; bot detection; first-click-free patterns |
| Gate is server-side | **"Article pages were static and CDN-cached. Now access varies per user. What breaks?"** | Middleware rewrites, cookie-based cache variation, teaser in SSR + client unlock, or edge personalization, with reasoning |
| Cookie counting works | "User clears cookies or goes incognito. Bug?" | A *product* decision: metered walls are deliberately soft |
| Wrapping up | "Legal wants the meter enforced per user across devices once registered." | Cookie → server-side identity; fast store (Redis) in the request path; latency cost on every request |

---

## Rubric

**Build craft**
- Below: fetches only client-side, no loading/error states, fights the framework
- At: sensible server/client split, handles loading and errors, readable components
- Above: explains *why* each fetch lives where it does; loading, error and empty states unprompted

**Questions asked unprompted** (count, don't weight; 0–2 weak, 3–5 solid, 6+ excellent): price update frequency · how many articles · error handling · missing images · body format · mobile · "do you want tests?" · anything we didn't predict

**Scale discussion**
- Below: buzzwords without mechanics
- At: correct mechanics for pagination, caching, live data
- Above: frames trade-offs (cost, staleness, complexity)

**AI session**
- Below: pastes output unreviewed; can't explain it; accepts the first answer
- At: iterates on prompts, reads the diff, explains the code line by line
- Above: catches the client-side gate unprompted; puts constraints in the prompt ("enforce server-side; crawlers need full content")

**Landmines noticed:** embargoed article · body sanitized · prices at `decimals` precision · aside shared, not duplicated · AI's client-side gate

**Calibration (last, privately):** "Would I want this person debugging production with me on a Friday night?" Yes or no, one sentence why.

---

## Operating notes

- **Before:** email at least 2 days ahead. Next.js App Router, our public API with docs, their own machine and editor, their own AI assistant in part 2, nothing of ours to clone or run (fake-interview malware campaigns use clone-and-run repos).
- **Nudges are free**, noted but not deducted. If the candidate freezes completely, end the build and move to discussion.
- **Trigger failures live:** `?latency=3000` if no loading state has appeared. Ask "and on a 500?" aloud. Don't grade states they never had the chance to see.
- **Early finisher:** "Add a category filter; state lives in the URL." Filter client-side, or discuss how to add `/api/categories`.
- **Never cut:** the vague brief, the `?latency=` trigger, the embargoed article, the live-prices question, and both bold session 2 questions (they map to coindesk-next's middleware regwall and ISR with on-demand revalidation).
- **Open:** a second fixture set so answers don't leak between candidate cohorts.
