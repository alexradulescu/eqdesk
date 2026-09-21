# 11 — Make the prices move

**Outcome:** initial prices still come from the server; a small client component refreshes them every five seconds.

## Show me

```text
Server: PriceAside → getPrices() → initialPrices
                                      ↓
Browser: LivePrices(initialPrices) → PriceList
             └── every 5s → getPrices() → setPrices()
```

## You type

Create `components/live-prices.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { getPrices, type Price } from "@/lib/api";
import { PriceList } from "./price-list";

export function LivePrices({ initialPrices }: { initialPrices: Price[] }) {
  const [prices, setPrices] = useState(initialPrices);

  useEffect(() => {
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const next = await getPrices();
        if (!cancelled) setPrices(next);
      } catch {
        // Keep the last values; the next interval retries.
        // Slice 12 adds a visible failure state and request controls.
      }
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return <><p>Simulated prices · updates every 5s</p><PriceList prices={prices} /></>;
}
```

In `components/price-aside.tsx`, replace the `PriceList` import with `LivePrices` and change the return to:

```tsx
return <LivePrices initialPrices={prices} />;
```

`"use client"` allows state and effects. It does **not** mean the initial component markup is absent from the server response. Starting state matches the serialized server props, so hydration does not invent a different quote.

## Check

Keep your app open for 15 seconds. The Network panel now shows browser requests to **port 3000** `/api/prices` about every five seconds, and numbers change. Click an article and back: the layout keeps the same polling component mounted.

**Talk it through:** why is the first request server-side, while later requests are browser-side? Why clean up the interval?

**Stop here.** This is a happy-path polling checkpoint. The cancellation flag prevents updates after unmount, but does not abort network traffic or prevent overlapping slow requests. Slice 12 replaces this effect before we call the feature complete.
