import "server-only";
import { cacheLife } from "next/cache";
import { mockArticles } from "./mock-data";

// Mock the async CMS boundary. Swap these reads for Sanity queries when connected.
export async function getArticles() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 120 });
  return mockArticles.map(({ body: _body, ...article }) => article);
}

export async function getArticle(slug: string) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 120 });
  return mockArticles.find((article) => article.slug.current === slug) ?? null;
}

export async function getSubscriptionBenefits() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 120 });
  return Array.from({ length: 5 }, (_, index) => ({
    title: `Benefit ${index + 1}`,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  }));
}
