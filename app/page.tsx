import Image from "next/image";
import { ArticleByline } from "@/components/article-byline";
import { auth0 } from "@/lib/auth0/server";
import { FREE_ARTICLE_LIMIT, getReadArticles } from "@/lib/reading-meter";
import { getArticles } from "@/lib/sanity/client";

export default async function Home() {
  const [articles, session] = await Promise.all([
    getArticles(),
    auth0.getSession(),
  ]);
  const readArticles = session ? [] : await getReadArticles();
  const hasFreeReads = !session && readArticles.length < FREE_ARTICLE_LIMIT;
  return (
    <main id="main-content" className="container news-page">
      <div className="page-heading">
        <h1>Latest stories</h1>
        <span>THE EQDESK EDIT</span>
      </div>
      <ul className="article-list">
        {articles.map((article, index) => {
          const slug = article.slug.current;
          const href =
            hasFreeReads && !readArticles.includes(slug)
              ? `/read/${slug}`
              : `/articles/${slug}`;
          return (
            <li key={article._id} className="article-row">
              <a
                className="article-image-link"
                href={href}
                tabIndex={-1}
                aria-label={article.title}
              >
                <Image
                  src={article.image.url}
                  alt=""
                  width={360}
                  height={240}
                  sizes="(max-width: 580px) calc(100vw - 24px), 240px"
                  preload={index === 0}
                />
              </a>
              <div className="article-summary">
                <h2>
                  <a href={href}>{article.title}</a>
                </h2>
                <ArticleByline
                  author={article.author.name}
                  publishedAt={article.publishedAt}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
