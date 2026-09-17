import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { PriceAside } from "@/components/price-aside";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CryptoWire — Latest stories",
    template: "%s | CryptoWire",
  },
  description: "Fictional crypto news and simulated market prices.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <div className="container top-bar">
            <Link href="/" className="logotype" aria-label="CryptoWire home">
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
      </body>
    </html>
  );
}
