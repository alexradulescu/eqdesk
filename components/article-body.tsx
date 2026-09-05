import { Fragment } from "react";
import type { Article } from "@/lib/sanity/mock-data";

export function ArticleBody({ body }: { body: Article["body"] }) {
  return (
    <div className="article-body">
      {body.map((paragraph, index) => (
        <Fragment key={paragraph._key}>
          <p>{paragraph.children.map((span) => span.text).join("")}</p>
          {(index + 1) % 2 === 0 && (
            <aside className="advertisement" aria-label="Advertisement">
              Advertisement
            </aside>
          )}
        </Fragment>
      ))}
    </div>
  );
}
