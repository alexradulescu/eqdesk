# CryptoWire: practical exercise

Build a small crypto news site in Next.js (App Router, TypeScript). Think out loud and ask anything. Nobody is expected to finish every part.

1. **Manual coding: Articles.** No AI.
2. **AI coding: Prices.** Use your own AI assistant.
3. **Architecture: Regwall.** Discussion only, no code.

## API

https://eqdesk.vercel.app/

---

## 1. Manual coding: Articles

Code by hand, no AI.

- A header with the site name.
- A homepage listing the latest articles. Each row shows a thumbnail, the title, and category · date. No excerpt.
- Clicking an article opens its article page: a back link, the title, category · date, the hero image, and the body.
- Leave room on the right for a price column (part 2).

```text
Homepage                                     Article page
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│ CRYPTOWIRE                           │     │ CRYPTOWIRE                           │
├──────────────────────────┬───────────┤     ├──────────────────────────┬───────────┤
│ LATEST                   │ (prices,  │     │ ← Back to latest         │ (prices,  │
│ ┌─────┐ title            │  part 2)  │     │ title                    │  part 2)  │
│ │ img │ category · date  │           │     │ category · date          │           │
│ └─────┘                  │           │     │ ┌──────────────────────┐ │           │
│ ┌─────┐ title            │           │     │ │ hero image           │ │           │
│ │ img │ category · date  │           │     │ └──────────────────────┘ │           │
│ └─────┘                  │           │     │ body                     │           │
│ ...                      │           │     │                          │           │
└──────────────────────────┴───────────┘     └──────────────────────────┴───────────┘
```

- Match this shape, don't polish it. Minimal styling is fine, and so is a plain `<img>` and any readable date format.

## 2. AI coding: Prices

Use your own AI assistant, and share your screen so we can see your prompts and its output. Start from wherever part 1 ended.

- A price column on the right of **both** pages, listing every asset from `/api/prices`.
- Each row shows the symbol, the USD price and the 24h change, with ▲ or ▼.

```text
┌──────────────────────────────────────┐
│ CRYPTOWIRE                           │
├──────────────────────────┬───────────┤
│ (articles or article)    │ PRICES    │
│                          │ BTC       │
│                          │ $81,106.25│
│                          │ ▼ -1.24%  │
│                          │ ETH       │
│                          │ $2,635.56 │
│                          │ ▲ +0.87%  │
│                          │ ...       │
└──────────────────────────┴───────────┘
```

When it works, walk us through the code it wrote.

## 3. Architecture: Regwall

No code. We'll talk through how you would build it.

CryptoWire wants a metered registration wall on article pages. The homepage doesn't change.

- Unregistered visitors can read **3 full articles**.
- While they have free articles left, a meter below the hero image reads "N/3 free articles, register or login for unlimited views".
- From the 4th article on, they see the headline, the hero image and a "Register or login to read unlimited articles" banner, with no body.
- Register and login are the same fake one-click action: no form, just mark the visitor as logged in.
- Logged-in visitors see full articles with no meter. The header swaps [Register] [Login] for [Logout].

```text
A. Anonymous, free articles left    B. Anonymous, none left            C. Logged in
┌───────────────────────────────┐   ┌───────────────────────────────┐  ┌───────────────────────────────┐
│ CRYPTOWIRE  [Register][Login] │   │ CRYPTOWIRE  [Register][Login] │  │ CRYPTOWIRE           [Logout] │
├───────────────────────────────┤   ├───────────────────────────────┤  ├───────────────────────────────┤
│ title                         │   │ title                         │  │ title                         │
│ category · date               │   │ category · date               │  │ category · date               │
│ [ hero image ]                │   │ [ hero image ]                │  │ [ hero image ]                │
│ ┌───────────────────────────┐ │   │ ┌───────────────────────────┐ │  │ body                          │
│ │ 2/3 free articles,        │ │   │ │ Register or login to read │ │  │                               │
│ │ register or login for     │ │   │ │ unlimited articles        │ │  │                               │
│ │ unlimited views           │ │   │ └───────────────────────────┘ │  │                               │
│ └───────────────────────────┘ │   │ (no body)                     │  │                               │
│ body                          │   │                               │  │                               │
└───────────────────────────────┘   └───────────────────────────────┘  └───────────────────────────────┘
```

(Price column omitted from these wireframes. It stays as in part 2.)
