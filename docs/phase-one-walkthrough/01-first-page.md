# 01 — A header and one headline

**Outcome:** one small static page. The header belongs to the layout; the headline belongs to the page.

## Show me

```tsx
<RootLayout>              // app/layout.tsx: persists between pages
  <header>CryptoWire</header>
  <main>
    <Home />              // app/page.tsx: changes with the route
  </main>
</RootLayout>
```

## You type

Replace `app/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header"><Link href="/">CryptoWire</Link></header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

Replace `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <>
      <h1>Latest stories</h1>
      <h2>Bitcoin finds its footing</h2>
    </>
  );
}
```

Replace `app/globals.css` with just enough CSS to read the result:

```css
* { box-sizing: border-box; }
body { max-width: 1100px; margin: auto; padding: 24px; font-family: system-ui, sans-serif; color: #181818; }
a { color: inherit; }
.site-header { padding-bottom: 24px; border-bottom: 3px solid #ffda22; font-size: 28px; font-weight: 750; }
main { padding-block: 24px; min-width: 0; }
:focus-visible { outline: 3px solid #8a6900; outline-offset: 4px; }
```

## Check

At http://localhost:3001 you see the header, “Latest stories,” and one headline. Change the headline, save, and watch the page update.

**Talk it through:** why does the root layout need `html` and `body`, but the page does not?

**Stop here.** Show me the page. After your approval, commit this slice. The hardcoded headline is intentional scaffolding; slice 02 replaces it with a real API response.
