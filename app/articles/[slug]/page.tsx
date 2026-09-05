import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ArticleByline } from "@/components/article-byline";
import { getArticle, getArticles } from "@/lib/sanity/client";

export async function generateStaticParams() {
  return (await getArticles()).map((article) => ({
    slug: article.slug.current,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  return { title: article?.title ?? "Article not found" };
}

export default async function ArticlePage({
  params,
}: PageProps<"/articles/[slug]">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  return (
    <main id="main-content" className="container article-page">
      <Link href="/" className="back-link">
        ← All stories
      </Link>
      <article>
        <header className="article-heading">
          <h1>{article.title}</h1>
          <ArticleByline
            author={article.author.name}
            publishedAt={article.publishedAt}
          />
        </header>
        <Image
          className="article-hero"
          src={article.image.url}
          alt={article.image.alt}
          width={1200}
          height={675}
          sizes="(max-width: 900px) calc(100vw - 24px), 876px"
          preload
        />
        <ArticleBody body={article.body} />
      </article>
    </main>
  );
}
