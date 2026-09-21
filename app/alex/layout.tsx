import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PriceAside } from "@/components/price-aside";

export const metadata: Metadata = {
  title: "CryptoWire — Latest stories",
  description: "Fictional crypto news and simulated market prices.",
  robots: { index: false, follow: false },
};

export default function AlexLayout({ children }: LayoutProps<"/alex">) {
  return (
    <>
      <header className="site-header">
        <div className="container top-bar">
          <Link href="/alex" className="logotype" aria-label="CryptoWire home">
            Crypto<span>Wire</span>
            <span className="brand-dot">.</span>
          </Link>
          <span className="edition">THE DEMO EDITION</span>
        </div>
      </header>
      <div className="container news-layout">
        <main id="main-content">{children}</main>
        <aside className="prices" aria-labelledby="prices-heading">
          <h2 id="prices-heading">Prices</h2>
          <Suspense fallback={<output>Loading prices…</output>}>
            <PriceAside />
          </Suspense>
        </aside>
      </div>
      <footer className="container site-footer">
        <span>CryptoWire</span>
        <span>All stories and prices are fictional.</span>
      </footer>
    </>
  );
}
