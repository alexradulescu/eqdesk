import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { ArticleByline } from "@/components/article-byline";
import { auth0 } from "@/lib/auth0/server";
import { FREE_ARTICLE_LIMIT, getReadArticles } from "@/lib/reading-meter";
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

  const session = await auth0.getSession();
  const readArticles = session ? [] : await getReadArticles();
  const alreadyRead = readArticles.includes(article.slug.current);
  if (!session && !alreadyRead && readArticles.length < FREE_ARTICLE_LIMIT) {
    redirect(`/read/${article.slug.current}`);
  }
  const canRead = Boolean(session) || alreadyRead;

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
        {!session &&
          (canRead ? (
            <div className="reading-notice">
              You're reading {readArticles.length}/{FREE_ARTICLE_LIMIT} free
              articles
            </div>
          ) : (
            <section
              className="registration-wall"
              aria-labelledby="registration-heading"
            >
              <p className="login-eyebrow">YOUR FREE ARTICLES, READ</p>
              <h2 id="registration-heading">Log in to keep reading.</h2>
              <p>
                You've read your {FREE_ARTICLE_LIMIT} free articles. Log in for
                full access to every story.
              </p>
              <a
                className="brand-button"
                href={`/auth/login?returnTo=${encodeURIComponent(`/articles/${article.slug.current}`)}`}
              >
                Log in to read
              </a>
            </section>
          ))}
        {canRead && <ArticleBody body={article.body} />}
      </article>
    </main>
  );
}
