# 09 — Server-render prices beside both pages

**Outcome:** six raw prices appear in a right-hand aside on the list and article pages. They are fetched once per layout render, with no browser polling yet.

## Show me

```tsx
<RootLayout>
  <header />
  <div className="news-layout">
    <main>{children}</main>
    <aside>
      <Suspense fallback="Loading prices…">
        <PriceAside />           // awaits API
          <PriceList />          // just renders the values
      </Suspense>
    </aside>
  </div>
</RootLayout>
```

## You type

Append to `lib/api.ts`:

```ts
export type Price = {
  symbol: string;
  name: string;
  price: string;
  decimals: number;
  change24h: string;
};

export async function getPrices(): Promise<Price[]> {
  const response = await fetch(`${API_ORIGIN}/api/prices`, {
    cache: "no-store",
    headers: { Authorization: "Bearer BullishToMars@2027!" },
  });
  if (!response.ok) throw new Error("Could not load prices");
  return response.json();
}
```

Create `components/price-list.tsx`:

```tsx
import type { Price } from "@/lib/api";

export function PriceList({ prices }: { prices: Price[] }) {
  return (
    <ul className="price-list">
      {prices.map((asset) => (
        <li key={asset.symbol}>
          <strong>{asset.symbol}</strong> <span>{asset.name}</span>
          <div>${asset.price}</div>
        </li>
      ))}
    </ul>
  );
}
```

Create `components/price-aside.tsx`:

```tsx
import { getPrices } from "@/lib/api";
import { PriceList } from "./price-list";

export async function PriceAside() {
  const prices = await getPrices();
  return <PriceList prices={prices} />;
}
```

In `app/layout.tsx`, import `Suspense` from `react` and `PriceAside` from `@/components/price-aside`. Replace its `<main>{children}</main>` with:

```tsx
<div className="news-layout">
  <main>{children}</main>
  <aside>
    <h2>Prices</h2>
    <Suspense fallback={<p role="status">Loading prices…</p>}>
      <PriceAside />
    </Suspense>
  </aside>
</div>
```

Append CSS:

```css
.news-layout { display: grid; grid-template-columns: minmax(0, 1fr) 240px; gap: 32px; }
.price-list { list-style: none; padding: 0; font-variant-numeric: tabular-nums; }
.price-list li { padding-block: 16px; border-bottom: 1px solid #ddd; }
```

## Check

All six assets appear on `/` and on an article. View page source: the prices are present in the server response. Click between articles: one layout owns the aside, rather than each page rendering its own copy.

**Talk it through:** why put the fetch in `PriceAside` rather than awaiting it at the top of `RootLayout` before returning any UI?

**Stop here.** Raw decimal strings are intentional scaffolding for slice 10. Price failure handling comes in slice 12.
