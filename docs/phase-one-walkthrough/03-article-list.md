# 03 — A list with category and date

**Outcome:** real article rows with title, category, and date. No excerpts or images yet.

## Show me

```text
lib/api.ts → getArticles() → Home → <ul>
                                  ├── title + category + date
                                  └── title + category + date
```

## You type

Create `lib/api.ts`:

```ts
export const API_ORIGIN = "http://localhost:3000";

export type ArticleSummary = {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  image: { url: string; alt: string } | null;
};

export async function getArticles(query = "limit=12"): Promise<ArticleSummary[]> {
  const response = await fetch(`${API_ORIGIN}/api/articles?${query}`, {
    cache: "no-store",
    headers: { Authorization: "Bearer BullishToMars@2027!" },
  });
  if (!response.ok) throw new Error("Could not load stories");
  return response.json();
}
```

This URL is public fixture data, so the module can later be shared with the polling component. It contains no secrets. Keep the origin without a trailing slash.

Replace `app/page.tsx`:

```tsx
import { getArticles } from "@/lib/api";

export default async function Home() {
  const articles = await getArticles();
  return (
    <>
      <h1>Latest stories</h1>
      {articles.length === 0 && <p>No stories yet.</p>}
      <ul className="article-list">
        {articles.map((article) => (
          <li key={article.id} className="article-row">
            <div>
              <h2>{article.title}</h2>
              <p>{article.category} · <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  timeZone: "UTC", month: "short", day: "numeric", year: "numeric",
                })}
              </time></p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
```

Append to `app/globals.css`:

```css
.article-list { list-style: none; padding: 0; }
.article-row { padding-block: 20px; border-bottom: 1px solid #ddd; }
.article-row h2 { margin-top: 0; font-size: 21px; }
.article-row p { font-size: 13px; color: #555; }
```

## Check

You see 12 rows, with stable IDs as React keys. Compare one date and category against the API. Notice anything unusual about the last row? We will handle that in slice 05.

**Talk it through:** does the TypeScript annotation validate the JSON at runtime? (It describes our known mock contract; it does not parse or validate arbitrary APIs.)

**Stop here.** No images, sorting controls, or filters yet. Commit only after the list looks right to you.
