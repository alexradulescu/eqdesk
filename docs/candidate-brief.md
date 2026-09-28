# CryptoWire: practical exercise

Build a small crypto news site in Next.js. What matters most is your process: the decisions you make, why you make them, and the questions you ask along the way. Think out loud, and ask anything.

## What to build

A homepage and an article page:

- A header with the site name.
- Below it, two columns: the **latest articles** on the left, a **price list** of a few major crypto assets on the right.
- Clicking an article opens its **full article page**. It keeps the same header and price list; rough is fine, it just needs to exist.

```text
Homepage                                     Article page
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│ CRYPTOWIRE                           │     │ CRYPTOWIRE                           │
├──────────────────────────┬───────────┤     ├──────────────────────────┬───────────┤
│ LATEST                   │ PRICES    │     │ ← Back to latest         │ PRICES    │
│ ┌─────┐ title            │ BTC       │     │ title                    │ (same)    │
│ │ img │ category · date  │ $63,164.12│     │ category · date          │           │
│ └─────┘                  │ ▼ -1.24%  │     │ ┌──────────────────────┐ │           │
│ ┌─────┐ title            │ ETH       │     │ │ hero image           │ │           │
│ │ img │ category · date  │ $3,042.56 │     │ └──────────────────────┘ │           │
│ └─────┘                  │ ▲ +0.87%  │     │ body                     │           │
│ ...                      │ ...       │     │                          │           │
└──────────────────────────┴───────────┘     └──────────────────────────┴───────────┘
```

- A list row is thumbnail + title + category · date. No excerpt.
- On the article page, title, category, date and hero image come as separate fields; the body below them is one HTML string.
- Match this shape; don't polish it. Plain text and minimal styling are fine.

## Setup

- Next.js with the App Router, and TypeScript.
- Styling is up to you: plain CSS, CSS modules, Tailwind, anything.
- A plain `<img>` is fine for images.
- Any readable date format is fine.

## API

**Docs:** `<API URL, shared at the start of the session>`

Everything you need is on that page, including TypeScript types you can copy. No keys, no sign-up.
