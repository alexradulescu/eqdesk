import sanitizeHtml from "sanitize-html";

export function isPublished(
  article: { publishedAt: string },
  now = Date.now(),
) {
  return Date.parse(article.publishedAt) <= now;
}

export function sanitizeBody(body: string) {
  return sanitizeHtml(body, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "strong",
      "em",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "br",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
  });
}
