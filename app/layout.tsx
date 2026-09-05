import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Account } from "@/components/account";
import { Devtools } from "@/components/devtools";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "EQDesk — Latest stories", template: "%s | EQDesk" },
  description:
    "A minimal news demo exploring digital assets, finance, and technology.",
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
            <Link href="/" className="logotype" aria-label="EQDesk home">
              <span>EQ</span>Desk
              <span className="brand-dot" aria-hidden="true">
                .
              </span>
            </Link>
            <Suspense fallback={<span className="login-button">Account…</span>}>
              <Account />
            </Suspense>
          </div>
        </header>
        {children}
        <footer className="container site-footer">
          <span>EQDesk</span>
          <span>Demo edition · All stories are fictional</span>
        </footer>
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      </body>
    </html>
  );
}
