# 13 — See loading instead of staring at a blank page

**Outcome:** a three-second API delay displays loading text while the shared header and price aside remain usable.

## Show me

```text
/alex reference (separate)       Your practice app /
                                ├── shared header + prices
                                └── loading.tsx → page.tsx when data is ready
```

## You type

Create `app/loading.tsx`:

```tsx
export default function Loading() {
  return <p role="status">Loading stories…</p>;
}
```

In `app/page.tsx`, replace the function signature and its data-loading lines, keeping the entire existing `return` block:

```tsx
export default async function Home({ searchParams }: {
  searchParams: Promise<{ latency?: string }>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams({ limit: "12" });
  if (query.latency) params.set("latency", query.latency);
  const articles = (await getArticles(params.toString())).filter(isPublished);

  // Keep the existing return block and closing brace here.
```

This is an edit sketch, not a complete replacement file. `searchParams` is asynchronous in this version, just like route `params`.

To try the same behavior on detail pages, change `getArticle` in `lib/api.ts` to accept a second optional argument and append it to the URL:

```diff
-export async function getArticle(id: string): Promise<Article | null> {
-  const response = await fetch(`${API_ORIGIN}/api/articles/${encodeURIComponent(id)}`, {
+export async function getArticle(id: string, query = ""): Promise<Article | null> {
+  const path = `/api/articles/${encodeURIComponent(id)}${query ? `?${query}` : ""}`;
+  const response = await fetch(`${API_ORIGIN}${path}`, {
```

In `app/articles/[id]/page.tsx`, replace the function opening through the article fetch. Keep the existing `notFound()` check and rendering below it:

```tsx
export default async function ArticlePage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ latency?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const debug = new URLSearchParams();
  if (query.latency) debug.set("latency", query.latency);
  const article = await getArticle(id, debug.toString());

  // Keep the existing publication check, return block, and closing brace.
```

## Check

Open `http://localhost:3001/?latency=3000` and watch during the wait. Then try `/articles/bitcoin-finds-its-footing?latency=3000`. “Loading stories…” appears before the content; the price aside has its own independent boundary.

The query parameter is explicitly forwarded to the API. Merely adding it to the browser URL would not delay anything without that code.

**Talk it through:** which boundary supplies the price-loading text, and which supplies the article-loading text?

**Stop here.** We added only enough query handling to exercise a real slow response. No loading animation or artificial delay in the UI.
