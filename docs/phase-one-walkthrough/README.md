# Rebuild CryptoWire, one small slice at a time

You drive: you type the code and run the commands. I navigate: explain the next slice, show its shape, review what you wrote, and help diagnose what you see. This is a guided rebuild of Session 1, not a timed interview.

The preparation is complete. Your practice app has **not** been created or implemented for you.

## Two apps, two jobs

```text
localhost:3000                       localhost:3001
This repository                     Your new practice app
├── /                 API docs      ├── /                News list
├── /api/*            Mock data     └── /articles/[id]    Full article
└── /alex             Reference             │
                                            └── fetch → localhost:3000/api/*
```

The suggested practice folder is `/Users/alex/Funspace/cryptowire-practice`, outside this repo. In the lesson files, paths such as `app/page.tsx` are relative to that new folder. Leave the API and `/alex` alone during the rebuild. The reference is available if you want to compare; it is not linked from the public API docs.

The exercises target the installed Next.js 16.3.4 App Router conventions, including asynchronous `params` and `searchParams`. We start the practice app with Cache Components and React Compiler off so the first slices focus on ordinary server rendering. The existing reference has Cache Components enabled; matching its caching setup is not part of this rebuild.

## Our rhythm

```text
Pick one slice
  → I explain the observable result and show one small diagram
  → you type the code (solutions below are allowed)
  → you run the browser check
  → we review what actually happened
  → you approve the checkpoint and commit locally
  → only then do we open the next slice
```

Ask for “slice 00” to begin. At each checkpoint, tell me what appeared or paste the error. I will stay on that slice rather than writing the next feature for you. If a slice feels too large, we split it. After two repair attempts fail, we stop to understand the evidence together.

Each file contains the outcome, a show-me view, exact edits or a complete small replacement, a check, one discussion question, and a stopping point. Future solutions are written down for reference; you do not need to read ahead.

## The map

| Slice | You will see | Main idea |
| --- | --- | --- |
| [00 — Start](00-start.md) | Your own app on port 3001 | App Router project and two servers |
| [01 — First page](01-first-page.md) | Header and one headline | Root layout versus page |
| [02 — Real headline](02-real-headline.md) | One headline from the API | Async Server Component |
| [03 — Article list](03-article-list.md) | Titles, categories, dates | A small API module and typed data |
| [04 — Thumbnails](04-thumbnails.md) | Photos and a missing-image placeholder | Nullable data and image origins |
| [05 — Published only](05-published-only.md) | Eleven published stories | Publication boundary |
| [06 — Click a headline](06-click-a-headline.md) | A URL-specific article screen | Link and async route params |
| [07 — Article fields](07-article-fields.md) | Title, metadata, hero; unknown ID gives 404 | Detail fetch and notFound |
| [08 — Safe body](08-safe-body.md) | Formatted article HTML | Sanitization boundary |
| [09 — Shared prices](09-shared-prices.md) | Six prices beside either page | Nested UI in the shared layout |
| [10 — Price precision](10-price-precision.md) | Correct decimals and signed changes | Read the API contract |
| [11 — Polling](11-polling.md) | Prices change without reload | Server first paint, client effect |
| [12 — Price failures](12-price-failures.md) | Last known prices survive a failure | Retry, timeout, cleanup |
| [13 — Loading](13-loading.md) | Loading text during a slow response | Streaming with loading.tsx |
| [14 — Article failures](14-article-failures.md) | A useful error screen and retry | Error boundary |
| [15 — Pagination](15-pagination.md) | Six rows, then five | URL state and API pagination |
| [16 — Finish](16-finish.md) | Usable mobile layout and a verified build | Review the whole flow |

## Scope and temporary shortcuts

We build Session 1 only: no accounts, reading meter, category filter, CMS integration, deployment, or WebSockets. Early slices deliberately show raw prices or a route stub; the named later slice replaces each shortcut. The guide uses the existing mock API rather than asking you to build another backend.

Use a branch such as `codex/cryptowire-practice` in your new app. Commit only after you have checked and accepted a slice. I will not edit or commit your practice files unless you explicitly ask me to take the keyboard.

## Current checkpoint

- [ ] Slice 00: create and start the practice app.
- All subsequent slices are pending.

The map is a direction, not a demand to finish. We can stop after any verified slice and pick up from there later.

API access: log into the docs with `BullishToMars@2027!` (24 hours). The practice app sends `Authorization: Bearer BullishToMars@2027!`; the lesson snippets include it.
