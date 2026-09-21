# 08 — Render the HTML body safely

**Outcome:** paragraphs and headings render below the hero, after server-side sanitization.

## Show me

```text
API body: one HTML string
  → allowlisted tags, attributes, and URL schemes
  → sanitized HTML
  → ArticleBody (server component)
```

## You type

In your practice app terminal:

```sh
bun add sanitize-html
bun add -d @types/sanitize-html
```

Create `components/article-body.tsx`:

```tsx
import sanitizeHtml from "sanitize-html";

export function ArticleBody({ body }: { body: string }) {
  const clean = sanitizeHtml(body, {
    allowedTags: ["p", "h2", "h3", "strong", "em", "a", "ul", "ol", "li", "blockquote", "br", "img"],
    allowedAttributes: { a: ["href", "title"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
  });
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

No `"use client"`: keep the sanitizer on the server. React's raw HTML escape hatch is only used with the cleaned result.

In `app/articles/[id]/page.tsx`, import `ArticleBody` and insert this immediately after the image/placeholder conditional, still inside `<article>`:

```tsx
<ArticleBody body={article.body} />
```

Append CSS:

```css
.article-body { line-height: 1.8; }
.article-body p { margin-block: 24px; }
.article-body img { max-width: 100%; height: auto; }
```

## Check

The Bitcoin article now has several paragraphs. A shorter article such as `digital-asset-custody` has the “The practical details” heading.

To inspect the boundary without executing an attack, temporarily pass this inert string instead of `article.body`:

```tsx
body={'<p>Keep me</p><img src="/missing.jpg" onerror="void 0"><script>void 0</script>'}
```

Inspect the rendered body in Elements: the paragraph remains, while `onerror` and the script element are absent. Restore `body={article.body}` before checkpointing. The temporary broken image is only part of this inspection.

**Talk it through:** what does React normally escape, and what responsibility does `dangerouslySetInnerHTML` give back to us?

**Stop here.** No new CMS or rich-text abstraction. The fixture body is already HTML, so one explicit sanitizer is enough.
