"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-message">
      <h1>Stories are unavailable</h1>
      <p>We couldn’t load the news. Please try again.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
      <Link className="back-link" href="/alex">
        ← Back to latest
      </Link>
    </div>
  );
}
