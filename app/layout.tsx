import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
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
            {/* Wave 2 replaces this placeholder with the mock Auth0 login. */}
            <button
              type="button"
              className="login-button"
              disabled
              title="Login will be available in the next implementation wave"
            >
              Log in
            </button>
          </div>
        </header>
        {children}
        <footer className="container site-footer">
          <span>EQDesk</span>
          <span>Demo edition · All stories are fictional</span>
        </footer>
      </body>
    </html>
  );
}
