# 04 — Add thumbnails, including the missing ones

**Outcome:** each row has either a thumbnail or an explicit placeholder. Relative API image URLs work from your separate app.

## Show me

```text
article.image
  ├── object → resolve url against :3000 → thumbnail
  └── null   → CW placeholder
```

## You type

In `app/page.tsx`, add `import Image from "next/image"` and add `API_ORIGIN` to the existing import from `@/lib/api`.

Inside each `<li>`, before its existing `<div>`, insert:

```tsx
{article.image ? (
  <Image
    src={new URL(article.image.url, API_ORIGIN).href}
    alt=""
    width={160}
    height={100}
    unoptimized
  />
) : (
  <div className="image-placeholder" aria-hidden="true">CW.</div>
)}
```

The empty alt text is deliberate: the adjacent headline supplies the row's meaning. We use `unoptimized` for this localhost exercise so the browser loads fixture photos directly; configuring a production image optimizer is outside this slice.

Append CSS:

```css
.article-row { display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: 20px; }
.article-row img, .image-placeholder { width: 160px; height: 100px; object-fit: cover; }
.image-placeholder { display: grid; place-items: center; background: #f6f3e8; color: #736b4e; }
```

## Check

The Bitcoin photo loads. The wallets row shows “CW.” without a broken image. Inspect the photo URL: it must begin with `http://localhost:3000/images/`, not port 3001.

**Talk it through:** why is `src={article.image.url}` insufficient when the API returns `/images/bitcoin.jpg` and your app runs on another origin?

**Stop here.** The nullable-image contract is handled. We will keep the styling this small until the final mobile slice.
