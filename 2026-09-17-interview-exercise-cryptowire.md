# Interview Exercise: "CryptoWire": Next.js News Site

**Status:** draft.
**Audience:** interviewers for web/new-hire roles on the CDM team.
**Format:** two sessions, one sitting (or split across two calls).

- Session 1: manual build, 60-90 min
- Session 2: AI-assisted extension, 60-90 min
- No requirement to finish. The build exists to surface discussion.

---

## 1. What the candidate sees

### Pre-interview email (send at least 2 days ahead)

> The practical session uses Next.js (App Router). You'll build against a small public REST API we provide, documentation included, no keys, no signup. You will not be asked to clone or run any repository of ours; you create your own project from scratch. You'll use your own machine, your own editor. In the second half you'll use whatever AI assistant you normally work with. We're not expecting a finished product. We want to see how you think.

Rationale: fake-interview malware campaigns (clone-and-run repo traps) are documented. Nothing of ours executes on the candidate's machine.

### The brief (session 1, read out or pasted in chat, deliberately vague)

> **CryptoWire**, a crypto news homepage.
>
> Layout: a header with the site name; below it a two-column area, article list on the left, price list aside on the right. The article page keeps the same two-column layout (article left, prices aside right). List rows are thumbnail + title + category + date, no excerpt. Title, meta and hero image come as separate fields; the body below them is one HTML string. Match this shape, don't polish it. Plain text and minimal styling are fine.
>
> - The aside lists a few major assets with current prices.
> - The main area lists the latest articles.
> - Clicking an article opens the full article page (rough is fine, it just needs to exist).
>
> API docs: `https://<your-mock-api>.vercel.app`, everything you need is there.
> You have about 75 minutes. You don't need to finish. Think out loud; ask me anything.

Deliberately omitted (each omission is a question a strong candidate asks):

- How many articles / assets to show
- Whether the prices update live or are fetch-on-load
- What happens on API errors, slow loads, missing images
- Mobile / responsiveness expectations
- The embargoed article in the list response (see §3)

Layout is given because CSS work is not scored; session time goes to decisions. Behavior stays unspecified. The vagueness is the test instrument.

### Canonical given layout (interviewer reference; describe in words, or paste)

Main page, desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ CRYPTOWIRE                                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  ┌────────────┐  │
│  │ LATEST                                │  │ PRICES     │  │
│  │ ┌──────┐  headline                    │  │ BTC        │  │
│  │ │ img  │  category · publishedAt      │  │ $63,164.12 │  │
│  │ └──────┘                              │  │ ▼ -1.24%   │  │
│  │ ┌──────┐  headline                    │  │            │  │
│  │ │ img  │  category · publishedAt      │  │ ETH        │  │
│  │ └──────┘                              │  │ $3,042.56  │  │
│  │ ...                                   │  │ ▲ +0.87%   │  │
│  │                                       │  │ ...        │  │
│  └───────────────────────────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘

list row = thumbnail + title + category · date. No excerpt/preview.
```

Article page, desktop, same two-column layout, aside persists:

```text
┌─────────────────────────────────────────────────────────────┐
│ CRYPTOWIRE                                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  ┌────────────┐  │
│  │ ← Back to latest                      │  │ PRICES     │  │
│  │ title   (separate field, not body)    │  │ (same      │  │
│  │ category · publishedAt                │  │  aside)    │  │
│  │ ┌──────────────────────────────────┐  │  │            │  │
│  │ │ hero image                       │  │  │            │  │
│  │ └──────────────────────────────────┘  │  │            │  │
│  │ body: ONE HTML string                 │  │            │  │
│  │ <p> <h2> <img> ...                    │  │            │  │
│  └───────────────────────────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Column split is the candidate's choice; not scored. The wireframe encodes three tests: header + aside shared across both pages (one component + one fetch, or duplicated?), missing images handled without the wireframe saying so, and the body-as-HTML boundary drawn explicitly (title and hero are structured fields above the HTML).

### The extension (session 2)

> CryptoWire wants a metered registration wall. Unregistered visitors can read **3 full articles**. From the 4th, they see the headline, the hero image, and a "register or login to read unlimited articles" banner, no body. While they still have articles left, a small meter below the hero reads "N/3 free articles, register or login for unlimited views". Registration and login are the same fake one-click action, no form, no input; just mark them logged in. Logged-in users see full articles with no meter, and the header swaps [Register] [Login] for [Logout].
>
> Use your AI assistant. Talk me through what you're doing and why.

Extension layouts (interviewer reference). Main page is unchanged in all states; only article pages differ.

State A, anonymous, N of 3 used, N ≤ 3. Full body, meter below hero:

```text
┌─────────────────────────────────────────────────────────────┐
│ CRYPTOWIRE                              [Register] [Login]  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  ┌────────────┐  │
│  │ ← Back to latest                      │  │ PRICES     │  │
│  │ title                                 │  │ (same      │  │
│  │ category · publishedAt                │  │  aside)    │  │
│  │ ┌──────────────────────────────────┐  │  │            │  │
│  │ │ hero image                       │  │  │            │  │
│  │ └──────────────────────────────────┘  │  │            │  │
│  │ ┌──────────────────────────────────┐  │  │            │  │
│  │ │ 2/3 free articles, register or   │  │  │            │  │
│  │ │ login for unlimited views        │  │  │            │  │
│  │ └──────────────────────────────────┘  │  │            │  │
│  │ body: full HTML string                │  │            │  │
│  │ <p> <h2> <img> ...                    │  │            │  │
│  └───────────────────────────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

State B, anonymous, N > 3. Title + hero + banner, body NOT rendered:

```text
┌─────────────────────────────────────────────────────────────┐
│ CRYPTOWIRE                              [Register] [Login]  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  ┌────────────┐  │
│  │ ← Back to latest                      │  │ PRICES     │  │
│  │ title                                 │  │ (same      │  │
│  │ category · publishedAt                │  │  aside)    │  │
│  │ ┌──────────────────────────────────┐  │  │            │  │
│  │ │ hero image                       │  │  │            │  │
│  │ └──────────────────────────────────┘  │  │            │  │
│  │ ┌──────────────────────────────────┐  │  │            │  │
│  │ │ Register or login to read        │  │  │            │  │
│  │ │ unlimited articles               │  │  │            │  │
│  │ └──────────────────────────────────┘  │  │            │  │
│  │          (body NOT rendered)          │  │            │  │
│  └───────────────────────────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

State C, logged in. Full body, no meter, no banner:

```text
┌─────────────────────────────────────────────────────────────┐
│ CRYPTOWIRE                                       [Logout]   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  ┌────────────┐  │
│  │ ← Back to latest                      │  │ PRICES     │  │
│  │ title                                 │  │ (same      │  │
│  │ category · publishedAt                │  │  aside)    │  │
│  │ ┌──────────────────────────────────┐  │  │            │  │
│  │ │ hero image                       │  │  │            │  │
│  │ └──────────────────────────────────┘  │  │            │  │
│  │ body: full HTML string                │  │            │  │
│  │ <p> <h2> <img> ...                    │  │            │  │
│  └───────────────────────────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

What the states test: meter as one conditional component vs logic spread through the page; state B withholds only the body, which sharpens the crawler question (body must still reach Googlebot; client-only gating fails twice, bypassable, and either cloaks or hides content from crawlers); the fake one-click login still needs modeling as a session (cookie), not a boolean in React state; the header swap forces an auth-state decision on every page.

---

## 2. The mock API (we build and deploy once, reuse for all candidates)

A small Next.js route-handler app deployed to Vercel. Public URL, open CORS, no secrets, rate limit. Treat the URL as public permanently. Canned JSON fixtures.

### Endpoints

| Endpoint | Returns | Notes |
|---|---|---|
| `GET /api/articles` | Array of ~12 article summaries | `?limit=`, `?offset=` supported |
| `GET /api/articles/:id` | Full article incl. `body` | 404 for unknown id |
| `GET /api/prices` | Array of 5 assets | Static or slowly drifting values |
| `GET /api/categories` | Array of category names | **Bonus**, build last; only used by the early-finisher filler |

### Debug params (interviewer-triggered, on every endpoint)

- `?latency=3000`: artificial delay; use mid-session to expose missing loading states
- `?fail=1`: returns 500; exposes missing error states

### Deliberate data quirks (documented in the API README, but candidates must read it)

1. `publishedAt` is an ISO UTC string (`"2026-09-17T09:41:00Z"`). Plain, no quirk; date formatting is not the signal we need.
2. Article `body` is an **HTML string** (`<p>`, `<img>`, `<h2>`...), as a WYSIWYG/Sanity-style rich-text field would produce. Title, meta and hero image are **separate structured fields**, not inside the body. The deliberate fork: render raw (XSS hole), reach for `dangerouslySetInnerHTML` without thinking, or sanitize (DOMPurify or an allowlist). The README states the body is HTML. The *safety* of rendering it is theirs to reason about.
3. Prices come back as **strings with full precision** (`"3042.555012"`), each asset carrying a `decimals` field (BTC 2, ETH 4, DOGE 6...). Correct render = the API's declared precision (`$3,042.56`), not the raw string and not an invented precision. Tests: contract reading, `Intl.NumberFormat`/`toFixed` vs naive interpolation, string-not-number awareness.
4. Some articles have `image: null` (both hero and list thumbnail).
5. **The landmine:** the list contains one article with a **future `publishedAt`** (embargoed). The brief never mentions it. A correct client filters it out; almost nobody does on the first pass. Do not hint. If they never notice, raise it in discussion: "did you check what the API actually returns?" Strong seniority signal either way.

### README at the API root

Endpoints, response shapes (including the quirks above), and one line: *"The API reflects the state of the world. Handle what it gives you."*

---

## 3. Question bank (anchored to moments, asked as the code appears)

**Mode tags:** `implement` = watch them build it; `verbal` = asking aloud is enough when time is short. The interviewer picks per row as time allows. Verbal coverage still scores on the rubric.

Order matters. Interviewers may skip from the bottom under time pressure. **Never cut the bold ones.**

### Session 1

| Mode | Anchor moment | Question | What good sounds like |
|---|---|---|---|
| implement | Article list fetch works | "This is fine at 10 articles. What changes at 1 million?" | Pagination; cursor vs offset; offset breaks under concurrent writes; page-size trade-offs |
| implement | Price aside being built | **"Do prices need to update live? What if they tick every second across 50 assets?"** | Asks about the requirement first; polling vs SSE vs websocket; server-rendered first paint + client island for updates |
| verbal | Price aside is client-rendered | "Lighthouse flags the aside as LCP. Fix?" | SSR the initial values, hydrate live updates after; defer non-critical script |
| verbal | Aside appears on both pages | "Same aside on list and article, how is it structured?" | Extracts one shared component + one shared fetch; no duplicated markup or fetch between layouts |
| verbal | Prices render | "Check a rendered price against the raw API value." | Renders the API's `decimals` precision (`Intl.NumberFormat`/`toFixed`), never the raw string; doesn't invent 2dp for everything |
| implement | Article page renders the HTML body | **"The body is HTML from the CMS. How do you render it safely?"** | Names the XSS risk unprompted; knows `dangerouslySetInnerHTML` is the risk; sanitize with an allowlist (DOMPurify) or render server-side with a trusted pipeline; bonus: "who controls the CMS?" is part of the answer |
| verbal | Article page done | **"An editor fixes a typo. How fast is it live, and why?"** | ISR revalidate windows vs on-demand `revalidatePath`/`revalidateTag` from a CMS webhook; stale-while-revalidate trade-off |
| verbal | Any spare time | "Marketing wants to A/B test the homepage hero without a deploy." | Edge feature flags; per-variant caching and cache-key implications. **First question cut when time is tight.** |
| verbal | They noticed (or didn't) the embargoed article | "Did you look at what the API actually returns?" | Filters defensively; doesn't trust upstream; reads the docs vs reads the data |

### Session 2

| Mode | Anchor moment | Question | What good sounds like |
|---|---|---|---|
| verbal | Gate working | **"Google's crawler must read full articles or SEO dies. How does the gate handle that?"** | Knows cloaking is a policy problem not just a tech one; bot detection; first-click-free patterns |
| verbal | Gate is server-side | **"Article pages were statically generated and CDN-cached. Now access varies per user. What breaks?"** | The core tension. Good answers: middleware rewrites, cookie-based cache variation, teaser-in-SSR + client unlock, or edge personalization. Any of these with reasoning = strong. |
| verbal | Cookie counting works | "User clears cookies or goes incognito, bypassed. Bug?" | Recognizes it as a *product* decision (metered walls are deliberately soft), not just a hole |
| verbal | Wrapping up | "Legal wants the meter enforced per-user across devices once registered." | Cookie → server-side identity; a fast store (Redis) in the request path; what that does to middleware latency on every request |

---

## 4. Rubric (3 levels per area, tick examples observed)

### 4.1 Base build craft

- ☐ Below: fetches only client-side, no loading/error states, fights the framework
- ☐ At: sensible server/client split, handles loading and error, readable components
- ☐ Above: explains *why* each fetch lives where it does; loading/error/empty all present unprompted

### 4.2 Questions asked (checklist, count, don't weight)

Asked unprompted: ☐ price update frequency ☐ how many articles ☐ error handling expectations ☐ missing-image handling ☐ body format ☐ mobile ☐ "do you want tests?"
(0-2 = weak, 3-5 = solid, 6+ = excellent. Also credit questions we didn't predict.)

### 4.3 Scale discussion

- ☐ Below: buzzwords without mechanics
- ☐ At: correct mechanics for pagination, caching, live data
- ☐ Above: frames trade-offs (cost, staleness, complexity), not just techniques

### 4.4 AI-assisted session

- ☐ Below: pastes output unreviewed; can't explain the middleware; accepts the first answer
- ☐ At: iterates on prompts, reads the diff, explains the final code line-by-line
- ☐ Above: catches the AI's mistake unprompted (the likely first-answer flaw: **client-side-only gating**, trivially bypassable and SEO-hostile); pushes constraints into the prompt ("must be enforced server-side; crawlers need full content")

### 4.5 Noticed the landmines

☐ Embargoed article ☐ AI's client-side gate ☐ HTML body sanitized before render ☐ prices rendered at declared `decimals` precision ☐ aside extracted as shared component, not duplicated

### Lean variant (default, target 45-60 min of building in session 1)

Each cut removes pixels or boilerplate, never decisions or discussion:

- Layout is given in the brief ("don't polish"); CSS time not scored.
- Price aside = plain text list or table; its signal lives in the fetch discussion, not the visuals.
- Article detail page only needs to exist, rough; enough to anchor the sanitize and cache questions.
- Error handling (`?fail=1`) is **verbal**. Trigger `?latency=` live (loading states stay `implement`), ask "and on a 500?" aloud.
- A/B-test question is the first cut under time pressure; `/api/categories` + the category-filter filler are bonus-only.

Never cut, even under time pressure: the vague brief (questions-asked rubric costs zero minutes), the `?latency=` live trigger, the embargoed article, the "do prices need to be live?" question, and both bold session-2 questions.

### Global calibration question (answer last, privately)

> "Would I want this person debugging production with me on a Friday night?" Yes or no, one sentence why.

---

## 5. Interviewer operating notes

- **Nudges are free and noted, never deducted.** A few nudges are fine, introverts included. The limit is total freeze: end the build early and move to discussion rather than leave someone distressed.
- **Run the full 45-60 min of building no matter what** unless that freeze happens.
- **Early finisher?** Bonus filler: *"Add a category filter. State lives in the URL."* Via `/api/categories` if built, client-side against the main endpoint if not. Either way it raises query-param state and server vs client filtering.
- **Trigger failure modes live:** partway through session 1, ask them to hit the API with `?latency=3000` if no loading state has appeared. Error handling is a **verbal** question ("and on a 500?"); don't spend build time on it. Never grade states you didn't give them the chance to see.
- **Session 2 fraud filter** is one question: "walk me through the final code." Anyone can generate; the hire signal is comprehension.
- **Never cut** the two bold session-2 questions (SEO/crawler, CDN vs per-user). They map directly onto how coindesk-next works (middleware regwall, ISR + on-demand revalidation).

---

## 6. Build checklist for the mock API (one-time)

- [ ] Vercel-deployed Next.js app, route handlers, canned fixtures
- [ ] 3 core endpoints (articles, article/:id, prices) + `?latency=` + `?fail=` + README at root; `/api/categories` is bonus, build last
- [ ] The 5 data quirks incl. HTML-string body + one future-dated article
- [ ] Open CORS, rate limit, zero secrets, no auth
- [ ] A second fixture set so question patterns don't leak between candidate cohorts
