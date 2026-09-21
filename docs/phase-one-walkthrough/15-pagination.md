# 15 — Six stories at a time

**Outcome:** the homepage shows six stories on page one and five on page two. The URL owns the current page, and the API receives a limit and offset.

## Show me

```text
?page=2
  → offset = (2 - 1) × 6 = 6
  → API limit=7, offset=6
  → first 6 slots, filter published, render
  → seventh result? show Older stories
```

## You type

In `app/page.tsx`, expand the search-params type to include `page`:

```ts
searchParams: Promise<{ page?: string; latency?: string; fail?: string }>;
```

Replace the data-loading lines after `const query = await searchParams` with:

```tsx
const requested = Number(query.page ?? 1);
const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
const params = new URLSearchParams({
  limit: "7",
  offset: String((page - 1) * 6),
});
if (query.latency) params.set("latency", query.latency);
if (query.fail === "1") params.set("fail", "1");
const results = await getArticles(params.toString());
const articles = results.slice(0, 6).filter(isPublished);
```

Keep the complete row markup. After `</ul>`, still inside the fragment, add:

```tsx
<nav aria-label="Article pages" className="pagination">
  {page > 1 && <Link href={`/?page=${page - 1}`}>← Newer stories</Link>}
  {results.length > 6 && <Link href={`/?page=${page + 1}`}>Older stories →</Link>}
</nav>
```

The `Link` import already exists from slice 06. Append CSS:

```css
.pagination { display: flex; justify-content: space-between; gap: 20px; margin-top: 24px; }
```

## Check

- `/`: six rows, an Older link.
- `/?page=2`: five published rows, a Newer link, no Older link.
- Reload page two: you stay on page two.
- `/?page=99`: an empty list message and a way back.
- `/?page=oops`: treated as page one.

**Talk it through:** why fetch seven rows but only display six? What happens to offset pagination if articles are inserted between requests?

The offset counts **API records**, including unpublished ones. Filtering happens within that fixed window, so a page can have fewer than six visible stories. We deliberately do not fetch extra windows to fill gaps. A production feed could expose published-only pagination or cursors, but that is outside this API contract and exercise.

**Stop here.** This removes the fetch-all shortcut from slice 03. No client-side “load everything” pagination.
