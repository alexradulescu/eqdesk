import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="container news-page">
      <h1>Story not found</h1>
      <p>This article is not in our demo edition.</p>
      <Link className="back-link" href="/">
        ← All stories
      </Link>
    </main>
  );
}
