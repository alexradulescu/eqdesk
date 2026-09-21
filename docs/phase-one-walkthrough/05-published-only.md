# 05 — Keep future stories out of the list

**Outcome:** the API still contains twelve fixtures; your homepage shows eleven published stories.

## Show me

```text
API summaries (12)
  → publishedAt <= now
  → visible rows (11)
```

## You type

Create `lib/publication.ts`:

```ts
export function isPublished(article: { publishedAt: string }) {
  return Date.parse(article.publishedAt) <= Date.now();
}
```

In `app/page.tsx`, import `isPublished` and replace the data-loading line:

```tsx
const articles = (await getArticles()).filter(isPublished);
```

Keep all of the row rendering from slice 04.

## Check

Count 11 rows. “Tomorrow’s market brief” is absent from the page but still present in http://localhost:3000/api/articles.

**Talk it through:** why filter in the consuming app even when the upstream API returns the article? What will we need to check on a direct detail URL?

**Stop here.** This helper has one job and will be reused for the detail page in slice 07. No time scheduler or special embargo service is needed.
