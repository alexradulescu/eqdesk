import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-message">
      <h1>Story not found</h1>
      <p>This story is not available in our published edition.</p>
      <Link className="back-link" href="/alex">
        ← Back to latest
      </Link>
    </div>
  );
}
