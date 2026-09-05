import "server-only";
import { cookies } from "next/headers";

export const READING_COOKIE = "eqdesk_read_articles";
export const FREE_ARTICLE_LIMIT = 3;

export async function getReadArticles(): Promise<string[]> {
  const value = (await cookies()).get(READING_COOKIE)?.value;
  if (!value) return [];
  try {
    const slugs: unknown = JSON.parse(value);
    if (
      !Array.isArray(slugs) ||
      !slugs.every(
        (slug) => typeof slug === "string" && /^[a-z0-9-]+$/.test(slug),
      )
    )
      return [];
    return [...new Set(slugs)].slice(0, FREE_ARTICLE_LIMIT);
  } catch {
    return [];
  }
}
