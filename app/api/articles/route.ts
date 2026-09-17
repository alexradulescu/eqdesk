import { debugResponse, json } from "@/lib/cryptowire/api";
import { articles } from "@/lib/cryptowire/articles";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const debug = await debugResponse(params);
  if (debug) return debug;
  const limit = Number(params.get("limit") ?? 12);
  const offset = Number(params.get("offset") ?? 0);
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    return json(
      { error: "limit must be 1–100 and offset a non-negative integer" },
      400,
    );
  }
  return json(
    articles
      .slice(offset, offset + limit)
      .map(({ body: _body, ...article }) => article),
  );
}
