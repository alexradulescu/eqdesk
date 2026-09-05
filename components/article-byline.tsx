const publishDateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function ArticleByline({
  author,
  publishedAt,
}: {
  author: string;
  publishedAt: string;
}) {
  return (
    <p className="byline">
      <span>
        By <strong>{author}</strong>
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={publishedAt}>
        {publishDateFormat.format(new Date(publishedAt))}
      </time>
    </p>
  );
}
