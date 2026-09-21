import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ArticleMeta } from "@/components/article-meta";
import { fetchApi } from "@/lib/cryptowire/client";
import { isPublished } from "@/lib/cryptowire/content";
import type { Article } from "@/lib/cryptowire/types";

export default async function ArticlePage({
  params,
  searchParams,
}: PageProps<"/alex/articles/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const debug = new URLSearchParams();
  if (typeof query.latency === "string") debug.set("latency", query.latency);
  if (query.fail === "1") debug.set("fail", "1");
  const article = await fetchApi<Article>(
    `/articles/${encodeURIComponent(slug)}?${debug}`,
  );
  if (!article || !isPublished(article)) notFound();

  return (
    <>
      <Link href="/alex" className="back-link">
        ← Back to latest
      </Link>
      <article>
        <header className="article-heading">
          <h1>{article.title}</h1>
          <ArticleMeta
            category={article.category}
            publishedAt={article.publishedAt}
          />
        </header>
        {article.image ? (
          <Image
            className="article-hero"
            src={article.image.url}
            alt={article.image.alt}
            width={1200}
            height={675}
            sizes="(max-width: 760px) 100vw, 700px"
            preload
          />
        ) : (
          <div className="article-hero image-placeholder">
            No image available
          </div>
        )}
        <ArticleBody body={article.body} />
      </article>
    </>
  );
}
