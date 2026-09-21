# 16 — Make it fit and check the whole path

**Outcome:** the same implementation works on a narrow screen, and the production build succeeds. No new feature is introduced.

## Show me

```text
Desktop                         Mobile
┌─────────────────────────┐     ┌──────────────┐
│ CryptoWire              │     │ CryptoWire   │
├────────────────┬────────┤     ├──────────────┤
│ list / article │ prices │     │ list/article │
└────────────────┴────────┘     ├──────────────┤
                               │ prices       │
                               └──────────────┘
```

## You type

Append to `app/globals.css`:

```css
@media (max-width: 760px) {
  body { padding: 16px; }
  .news-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .article-row { grid-template-columns: 100px minmax(0, 1fr); gap: 14px; }
  .article-row img, .image-placeholder { width: 100px; height: 80px; }
  .article-row h2 { font-size: 17px; }
}
```

From your practice app, keep the API server running and run:

```sh
bunx tsc --noEmit
bun run lint
bun run build
```

If the generated package has no `lint` script, use `bunx eslint .` instead. Do not change source to satisfy a guessed warning; show me the actual result first.

## Check together

1. List → article → back; prices remain visible and continue polling.
2. Page two has five rows and no future-dated headline.
3. A direct future-dated or unknown article URL shows not found.
4. The missing-image article renders its placeholder and body.
5. The article body has paragraphs and headings, with no unsafe markup from the slice 08 probe.
6. Three-second latency shows loading; simulated 500 shows the error screen.
7. Blocking price polls retains old values; unblocking restores updates.
8. At 390px width, there is no horizontal page overflow; prices sit below the news.
9. Tab through links and buttons: focus is visible and labels make sense.
10. The build and TypeScript checks pass. Remove any temporary failure URL or sanitizer probe before the final commit.

If a check fails, we repair that behavior before touching another feature. We don't need to automate every visual assertion to finish this learning exercise; a few meaningful contract tests can be a later, separate activity.

## Explain your own implementation

```text
RootLayout
  ├── header
  ├── Home OR ArticlePage        (server)
  │     └── ArticleBody          (server sanitization)
  └── PriceAside                 (server initial fetch)
        └── LivePrices           (browser state + polling)
              └── PriceList     (formatting)
```

**Talk it through:** can you explain why each fetch happens where it does? What changes when an editor updates an article? With `no-store`, the next page request fetches the new response; we have not added ISR or a CMS webhook.

**Stop here.** After your approval, commit the finished Phase 1 locally. Registration, the three-article meter, and caching experiments stay separate. You have built the phase yourself.
