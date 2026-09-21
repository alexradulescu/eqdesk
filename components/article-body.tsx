import { sanitizeBody } from "@/lib/cryptowire/content";

export function ArticleBody({ body }: { body: string }) {
  return (
    <div
      className="article-body"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with an explicit allowlist on the server.
      dangerouslySetInnerHTML={{ __html: sanitizeBody(body) }}
    />
  );
}
