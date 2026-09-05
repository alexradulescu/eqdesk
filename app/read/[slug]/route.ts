import { cookies } from "next/headers";
import { auth0 } from "@/lib/auth0/server";
import {
  FREE_ARTICLE_LIMIT,
  getReadArticles,
  READING_COOKIE,
} from "@/lib/reading-meter";
import { getArticle } from "@/lib/sanity/client";

// Cookies must be written before rendering starts, so new reads pass through this route.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/read/[slug]">,
) {
  const { slug } = await params;
  if (!(await getArticle(slug)))
    return new Response("Article not found", { status: 404 });
  const session = await auth0.getSession();
  if (!session) {
    const readArticles = await getReadArticles();
    if (
      !readArticles.includes(slug) &&
      readArticles.length < FREE_ARTICLE_LIMIT
    ) {
      (await cookies()).set(
        READING_COOKIE,
        JSON.stringify([...readArticles, slug]),
        {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      );
    }
  }
  return new Response(null, {
    status: 303,
    headers: { Location: `/articles/${slug}`, "Cache-Control": "no-store" },
  });
}
