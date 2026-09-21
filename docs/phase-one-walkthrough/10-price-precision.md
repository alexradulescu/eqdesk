# 10 — Respect the price contract

**Outcome:** BTC, ETH, and SOL have two decimal places; XRP and USDC four; DOGE five. The signed 24-hour change appears beneath each quote.

## Show me

```text
"2635.56000000" + decimals: 2
  → Number(...)
  → Intl.NumberFormat
  → $2,635.56
```

## You type

In `components/price-list.tsx`, replace the raw `<div>${asset.price}</div>` with:

```tsx
<div>
  {new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: asset.decimals,
    maximumFractionDigits: asset.decimals,
  }).format(Number(asset.price))}
</div>
<small>
  {Number(asset.change24h) >= 0 ? "+" : ""}{asset.change24h}% · 24h
</small>
```

Keep the rest of the list unchanged. A sign communicates direction without relying on color.

## Check

BTC, ETH, SOL: 2 places. XRP, USDC: 4. DOGE: 5. USDC should remain close to $1. These are USD quote decimals, not on-chain token decimals. Inspect the current API response and compare its `decimals` with your output. The actual values may drift between requests; compare formatting, not two quotes captured at different times.

**Talk it through:** why isn't `toFixed(2)` correct for every asset? Why specify both the minimum and maximum fraction digits?

**Stop here.** Formatting is now complete. Do not add a formatter registry or caching layer for six rows; we have no evidence that it is necessary.
