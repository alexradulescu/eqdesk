# 12 — Keep useful prices when requests fail

**Outcome:** a failed poll keeps last known prices and displays a notice. Recovery clears it. Slow polls do not overlap, and requests stop on unmount.

## Show me

```text
timer tick
  ├── request pending → skip this tick
  └── fetch (10s timeout)
       ├── success → replace prices, clear notice
       └── failure → keep prices, show notice
unmount → clear interval + abort request
```

## You type

In `lib/api.ts`, replace `getPrices` only:

```ts
export async function getPrices(signal?: AbortSignal): Promise<Price[]> {
  const response = await fetch(`${API_ORIGIN}/api/prices`, {
    cache: "no-store",
    headers: { Authorization: "Bearer BullishToMars@2027!" },
    signal,
  });
  if (!response.ok) throw new Error("Could not load prices");
  return response.json();
}
```

In `components/price-aside.tsx`, change the fetch line to:

```tsx
const prices = await getPrices(AbortSignal.timeout(10000)).catch(() => []);
```

This handles an initial failure inside the aside; the rest of the layout can still render.

Replace `components/live-prices.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { getPrices, type Price } from "@/lib/api";
import { PriceList } from "./price-list";

export function LivePrices({ initialPrices }: { initialPrices: Price[] }) {
  const [prices, setPrices] = useState(initialPrices);
  const [failed, setFailed] = useState(initialPrices.length === 0);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending) return;
      pending = true;
      try {
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]);
        const next = await getPrices(signal);
        if (!controller.signal.aborted) {
          setPrices(next);
          setFailed(false);
        }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        pending = false;
      }
    }
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, []);

  return (
    <>
      <p>Simulated prices · updates every 5s</p>
      {failed && <p role="status">
        Prices unavailable. {prices.length > 0 && "Showing last known values. "}
        Retrying automatically.
      </p>}
      <PriceList prices={prices} />
    </>
  );
}
```

Keep React Compiler off in this practice app as agreed in slice 00. We are keeping the ordinary `try/catch/finally` readable here.

## Check

In browser devtools, block requests matching `http://localhost:3000/api/prices` after the initial prices appear. Wait for the next poll. All six prices stay visible and the notice appears. Unblock requests: the next successful poll updates prices and removes the notice.

Browser blocking affects browser polls, not the server's initial fetch. To check the initial fallback separately, temporarily request `/api/prices?fail=1` in `getPrices`, reload, and confirm that stories render with the unavailable notice. Restore the endpoint and reload before checkpointing.

**Talk it through:** if a request takes eight seconds, what should the five-second tick do while it is still pending?

**Stop here.** The happy-path shortcut is removed. Do not add WebSockets, retry backoff, or a state library for this six-asset mock.
