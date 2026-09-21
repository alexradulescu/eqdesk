import Image from "next/image";
import Link from "next/link";
import { ArticleMeta } from "@/components/article-meta";
import { fetchApi } from "@/lib/cryptowire/client";
import { isPublished } from "@/lib/cryptowire/content";
import type { ArticleSummary } from "@/lib/cryptowire/types";

export default async function Home({ searchParams }: PageProps<"/alex">) {
  const query = await searchParams;
  const requestedPage = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const params = new URLSearchParams({
    limit: "7",
    offset: String((page - 1) * 6),
  });
  if (typeof query.latency === "string") params.set("latency", query.latency);
  if (query.fail === "1") params.set("fail", "1");
  const articles =
    (await fetchApi<ArticleSummary[]>(`/articles?${params}`)) ?? [];
  const published = articles
    .slice(0, 6)
    .filter((article) => isPublished(article));

  return (
    <>
      <div className="page-heading">
        <h1>Latest stories</h1>
        <span>NEWS & PERSPECTIVES</span>
      </div>
      {published.length === 0 && <p>No published stories on this page.</p>}
      <ul className="article-list">
        {published.map((article, index) => (
          <li key={article.id}>
            <Link href={`/alex/articles/${article.id}`} className="article-row">
              {article.image ? (
                <Image
                  src={article.image.url}
                  alt=""
                  width={240}
                  height={160}
                  sizes="(max-width: 600px) 100px, 180px"
                  preload={index === 0}
                />
              ) : (
                <div className="image-placeholder" aria-hidden="true">
                  CW.
                </div>
              )}
              <div>
                <h2>{article.title}</h2>
                <ArticleMeta
                  category={article.category}
                  publishedAt={article.publishedAt}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <nav className="pagination" aria-label="Article pages">
        {page > 1 && (
          <Link href={`/alex?page=${page - 1}`}>← Newer stories</Link>
        )}
        {articles.length > 6 && (
          <Link href={`/alex?page=${page + 1}`}>Older stories →</Link>
        )}
      </nav>
    </>
  );
}
