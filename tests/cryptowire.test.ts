import { describe, expect, test } from "bun:test";
import { GET as article } from "../app/api/articles/[id]/route";
import { GET as summaries } from "../app/api/articles/route";
import { GET as prices } from "../app/api/prices/route";
import { articles } from "../lib/cryptowire/articles";
import { isPublished, sanitizeBody } from "../lib/cryptowire/content";
import { getPrices } from "../lib/cryptowire/prices";

const request = (path: string) => new Request(`http://localhost${path}`);

describe("article contract", () => {
  test("pagination returns summaries without sending full bodies", async () => {
    const response = await summaries(request("/api/articles?limit=2&offset=2"));
    const rows = await response.json();
    expect(rows.map((row: { id: string }) => row.id)).toEqual(
      articles.slice(2, 4).map((row) => row.id),
    );
    expect(rows.every((row: object) => !("body" in row))).toBe(true);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  test("detail returns HTML and unknown articles return 404", async () => {
    const response = await article(request("/api/articles/first"), {
      params: Promise.resolve({ id: articles[0].id }),
    });
    expect((await response.json()).body).toContain("<p>");
    const missing = await article(request("/api/articles/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });
    expect(missing.status).toBe(404);
  });

  test("invalid pagination is rejected", async () => {
    for (const query of [
      "limit=0",
      "limit=101",
      "offset=-1",
      "offset=0.5",
      "limit=abc",
    ]) {
      expect((await summaries(request(`/api/articles?${query}`))).status).toBe(
        400,
      );
    }
  });

  test("future articles stay in the API but fail the publication check", async () => {
    const rows = await (await summaries(request("/api/articles"))).json();
    expect(rows).toHaveLength(12);
    expect(rows.some((row: { image: unknown }) => row.image === null)).toBe(
      true,
    );
    expect(
      rows.filter((row: { publishedAt: string }) =>
        isPublished(row, Date.parse("2026-09-17T12:00:00Z")),
      ),
    ).toHaveLength(11);
    expect(isPublished({ publishedAt: "invalid" })).toBe(false);
  });
});

test("sanitization keeps editorial HTML and removes executable markup", () => {
  const clean = sanitizeBody(
    '<h2>Heading</h2><p>Text <strong>bold</strong></p><script>alert(1)</script><img src="/images/bitcoin.jpg" alt="Bitcoin" onerror="alert(1)"><a href="javascript:alert(1)">link</a><iframe src="https://example.com"></iframe><svg onload="alert(1)"></svg>',
  );
  expect(clean).toContain("<h2>Heading</h2>");
  expect(clean).toContain("<strong>bold</strong>");
  expect(clean).toContain('src="/images/bitcoin.jpg"');
  expect(clean).not.toMatch(/script|onerror|onload|iframe|svg|alert/);
});

test("quotes are stable within a bucket, shift at five seconds, and stay bounded", () => {
  const first = getPrices(10000);
  expect(getPrices(14999)).toEqual(first);
  const next = getPrices(15000);
  expect(next).not.toEqual(first);
  expect(first.map((price) => price.decimals)).toEqual([2, 4, 2, 4, 6]);
  for (const [index, quote] of next.entries()) {
    expect(typeof quote.price).toBe("string");
    expect(
      Math.abs(Number(quote.price) / Number(first[index].price) - 1),
    ).toBeLessThan(0.0021);
  }
});

test("all endpoints support simulated failures; prices disable caching", async () => {
  expect((await summaries(request("/api/articles?fail=1"))).status).toBe(500);
  expect(
    (
      await article(request("/api/articles/first?fail=1"), {
        params: Promise.resolve({ id: articles[0].id }),
      })
    ).status,
  ).toBe(500);
  expect((await prices(request("/api/prices?fail=1"))).status).toBe(500);
  expect((await prices(request("/api/prices?latency=-1"))).status).toBe(400);
  expect(
    (await prices(request("/api/prices"))).headers.get("Cache-Control"),
  ).toBe("no-store");
});
