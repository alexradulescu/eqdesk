import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="container page-message">
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/">← API documentation</Link>
    </main>
  );
}
