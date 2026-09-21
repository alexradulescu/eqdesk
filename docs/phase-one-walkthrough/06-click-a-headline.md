# 06 — Give each headline a destination

**Outcome:** clicking a headline changes the URL and shows that article's ID. The body is not fetched yet.

## Show me

```text
click a headline
  → /articles/bitcoin-finds-its-footing
  → app/articles/[id]/page.tsx
  → await params → id
```

## You type

In `app/page.tsx`, add `import Link from "next/link"`. Replace only the headline:

```tsx
<h2><Link href={`/articles/${article.id}`}>{article.title}</Link></h2>
```

Create the folder `app/articles/[id]` and its `page.tsx`:

```tsx
import Link from "next/link";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Link href="/">← Back to latest</Link>
      <h1>{id}</h1>
    </>
  );
}
```

In this Next.js version, `params` is asynchronous. Await it before reading `id`. The bracketed folder names a route parameter; it is not a literal URL segment.

## Check

Click Bitcoin, then use **Back to latest**. Repeat with another headline. The header remains in the shared layout. Reload a detail URL directly: it still resolves.

**Talk it through:** what changes if you use a plain anchor instead of Next.js `Link` for local navigation?

**Stop here.** This ID screen is an intentional route stub, replaced by actual article fields in slice 07.
