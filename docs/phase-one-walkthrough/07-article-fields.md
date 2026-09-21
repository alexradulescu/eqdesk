# 07 — Fetch one article and show its fields

**Outcome:** a detail URL shows title, category, date, and hero. Unknown or future-dated articles show a not-found page. The body stays out until slice 08.

## Show me

```text
URL id → getArticle(id)
  ├── missing or unpublished → notFound()
  └── article → title + metadata + hero
```

## You type

Append to `lib/api.ts`:

```ts
export type Article = ArticleSummary & { body: string };

export async function getArticle(id: string): Promise<Article | null> {
  const response = await fetch(`${API_ORIGIN}/api/articles/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load this article");
  return response.json();
}
```

Replace `app/articles/[id]/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_ORIGIN, getArticle } from "@/lib/api";
import { isPublished } from "@/lib/publication";

export default async function ArticlePage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article || !isPublished(article)) notFound();

  return (
    <>
      <Link href="/">← Back to latest</Link>
      <article>
        <h1>{article.title}</h1>
        <p>{article.category} · <time dateTime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}
        </time></p>
        {article.image ? (
          <Image
            className="article-hero"
            src={new URL(article.image.url, API_ORIGIN).href}
            alt={article.image.alt}
            width={1200}
            height={675}
            unoptimized
          />
        ) : <div className="hero-placeholder">No image available</div>}
      </article>
    </>
  );
}
```

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return <><h1>Story not found</h1><Link href="/">← Back to latest</Link></>;
}
```

Append CSS:

```css
.article-hero { display: block; width: 100%; height: auto; }
.hero-placeholder { display: grid; place-items: center; aspect-ratio: 16 / 9; background: #f6f3e8; }
```

## Check

On port 3001:

- `/articles/bitcoin-finds-its-footing`: title, meta, and photo.
- `/articles/wallets-designed-for-people`: title, meta, and placeholder.
- `/articles/not-a-story`: not found.
- `/articles/tomorrows-market-brief`: not found, even though its API response exists.

**Talk it through:** why is hiding an article from the list insufficient to protect its direct route?

**Stop here.** The HTML body is intentionally not rendered yet; we will add it with its safety boundary in the next slice.
