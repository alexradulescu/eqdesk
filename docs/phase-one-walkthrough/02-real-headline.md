# 02 — One headline from the API

**Outcome:** the same screen now gets its headline from the API. Keep the scope to one request and one heading.

## Show me

```text
Browser asks :3001 for /
  → Home runs on the Next.js server
  → fetch :3000/api/articles?limit=1
  → return HTML containing the headline
```

## You type

Replace `app/page.tsx`:

```tsx
export default async function Home() {
  const response = await fetch("http://localhost:3000/api/articles?limit=1", {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load stories");
  const articles: { id: string; title: string }[] = await response.json();

  return (
    <>
      <h1>Latest stories</h1>
      {articles[0] ? <h2>{articles[0].title}</h2> : <p>No stories yet.</p>}
    </>
  );
}
```

No `useEffect` or `"use client"` is needed. This page is a Server Component. `no-store` makes the server ask for fresh data on each page request.

## Check

The first headline matches http://localhost:3000/api/articles?limit=1. View the page source and search for the headline: it arrives in the server response. The browser Network panel does not show a browser-originated articles fetch; the Next.js server made it.

**Talk it through:** what would move to the browser if we fetched this inside `useEffect` instead?

**Stop here.** We will discuss the result before growing the list. The small inline type and hardcoded API origin are deliberate; slice 03 puts the full summary contract and shared origin in one module.
