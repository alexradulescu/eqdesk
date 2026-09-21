# 14 — Give article failures a useful screen

**Outcome:** the list and detail page show a retry action when the API returns 500. The price aside stays independent.

## Show me

```text
page awaits API
  ├── 200 → article UI
  ├── 404 detail → notFound()
  └── other failure → throw → app/error.tsx
                                 └── reset() → retry the page
```

## You type

In **both** page signatures from slice 13, expand the search-params type:

```ts
searchParams: Promise<{ latency?: string; fail?: string }>;
```

In `app/page.tsx`, after forwarding latency:

```tsx
if (query.fail === "1") params.set("fail", "1");
```

In `app/articles/[id]/page.tsx`, after forwarding latency:

```tsx
if (query.fail === "1") debug.set("fail", "1");
```

Create `app/error.tsx`:

```tsx
"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <h1>Stories are unavailable</h1>
      <p>We couldn’t load the news. Please try again.</p>
      <button type="button" onClick={reset}>Try again</button>
      <p><Link href="/">← Back to latest</Link></p>
    </>
  );
}
```

The API functions already throw on non-success responses. The boundary is a Client Component because its retry button is interactive. A segment's `error.tsx` handles errors below that segment's layout, not errors thrown by that layout itself; this is why slice 12 catches initial price failures within the aside.

## Check

Open `http://localhost:3001/?fail=1`, then an article URL with `?fail=1`. You see the error UI. **Try again** retries the same deliberately failing request and therefore still fails. **Back to latest** removes the debug query and restores the homepage.

Next.js may show its development error indicator for this deliberate failure. Return to a normal URL before checking for unexpected runtime errors.

**Talk it through:** why check `response.ok`? Does `fetch` reject automatically for HTTP 500?

**Stop here.** Errors are now reachable, visible, and recoverable. Do not add a global error store or new request abstraction.
