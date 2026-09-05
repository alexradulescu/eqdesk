import Image from "next/image";
import Link from "next/link";
import { ArticleByline } from "@/components/article-byline";
import { getArticles } from "@/lib/sanity/client";

export default async function Home() {
  const articles = await getArticles();
  return (
    <main id="main-content" className="container news-page">
      <div className="page-heading">
        <h1>Latest stories</h1>
        <span>THE EQDESK EDIT</span>
      </div>
      <ul className="article-list">
        {articles.map((article, index) => (
          <li key={article._id} className="article-row">
            <Link
              className="article-image-link"
              href={`/articles/${article.slug.current}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={article.image.url}
                alt=""
                width={360}
                height={240}
                sizes="(max-width: 580px) calc(100vw - 24px), 240px"
                preload={index === 0}
              />
            </Link>
            <div className="article-summary">
              <h2>
                <Link href={`/articles/${article.slug.current}`}>
                  {article.title}
                </Link>
              </h2>
              <ArticleByline
                author={article.author.name}
                publishedAt={article.publishedAt}
              />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
