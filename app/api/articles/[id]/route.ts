import { debugResponse, json } from "@/lib/cryptowire/api";
import { articles } from "@/lib/cryptowire/articles";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/articles/[id]">,
) {
  const debug = await debugResponse(new URL(request.url).searchParams);
  if (debug) return debug;
  const { id } = await params;
  const article = articles.find((article) => article.id === id);
  return article ? json(article) : json({ error: "Article not found" }, 404);
}
