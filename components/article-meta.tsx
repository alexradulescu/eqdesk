export function ArticleMeta({
  category,
  publishedAt,
}: {
  category: string;
  publishedAt: string;
}) {
  return (
    <p className="article-meta">
      <span>{category}</span> ·{" "}
      <time dateTime={publishedAt}>
        {new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(publishedAt))}
      </time>
    </p>
  );
}
