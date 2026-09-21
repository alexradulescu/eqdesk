import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { GET as article } from "../app/api/articles/[id]/route";
import { GET as summaries } from "../app/api/articles/route";
import { GET as prices } from "../app/api/prices/route";
import { POST as login } from "../app/api/session/route";
import {
  createSession,
  PASSWORD,
  SESSION_COOKIE,
  SESSION_SECONDS,
  validSession,
} from "../lib/access";
import { articles } from "../lib/cryptowire/articles";
import { isPublished, sanitizeBody } from "../lib/cryptowire/content";
import { getPrices } from "../lib/cryptowire/prices";
import { proxy } from "../proxy";

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
  expect(first.map(({ symbol, decimals }) => [symbol, decimals])).toEqual([
    ["BTC", 2],
    ["ETH", 2],
    ["SOL", 2],
    ["XRP", 4],
    ["DOGE", 5],
    ["USDC", 4],
  ]);
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

test("USDC stays near its peg, visibly drifts, and avoids negative-zero changes", async () => {
  const response = await prices(request("/api/prices"));
  const assets = await response.json();
  expect(assets).toHaveLength(6);
  expect(
    assets.find((asset: { symbol: string }) => asset.symbol === "USDC"),
  ).toMatchObject({ name: "USDC", decimals: 4 });
  const displayed = new Set<string>();
  for (let tick = 0; tick < 100; tick++) {
    const stablecoin = getPrices(tick * 5000).find(
      (asset) => asset.symbol === "USDC",
    );
    if (!stablecoin) throw new Error("USDC is missing from the quote fixtures");
    const value = Number(stablecoin.price);
    expect(Math.abs(value - 0.9997)).toBeLessThanOrEqual(0.0001);
    expect(Math.abs(Number(stablecoin.change24h))).toBeLessThanOrEqual(0.01);
    expect(stablecoin.change24h).not.toBe("-0.00");
    displayed.add(value.toFixed(stablecoin.decimals));
  }
  expect(displayed.size).toBeGreaterThan(1);
});

describe("password gate", () => {
  test("sessions expire after 24 hours and reject tampering", () => {
    const token = createSession(1000);
    expect(validSession(token, 1000 + SESSION_SECONDS * 1000 - 1)).toBe(true);
    expect(validSession(token, 1000 + SESSION_SECONDS * 1000)).toBe(false);
    expect(validSession(`9999999999999.${token.split(".")[1]}`, 1000)).toBe(
      false,
    );
    expect(validSession("9999999999999." + "é".repeat(64))).toBe(false);
    expect(validSession(undefined)).toBe(false);
  });

  test("pages require a session; APIs accept cookies or a bearer token", () => {
    for (const path of ["/", "/alex", "/alex/articles/example"]) {
      const response = proxy(new NextRequest(`http://localhost${path}`));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login?next=");
    }
    for (const path of [
      "/api/articles",
      "/api/articles/example",
      "/api/prices",
    ]) {
      expect(proxy(new NextRequest(`http://localhost${path}`)).status).toBe(
        401,
      );
      expect(
        proxy(
          new NextRequest(`http://localhost${path}`, {
            headers: { Authorization: "Bearer wrong" },
          }),
        ).status,
      ).toBe(401);
      expect(
        proxy(
          new NextRequest(`http://localhost${path}`, {
            headers: { Authorization: `Bearer ${PASSWORD}` },
          }),
        ).status,
      ).toBe(200);
      expect(
        proxy(
          new NextRequest(`http://localhost${path}`, {
            headers: { Cookie: `${SESSION_COOKIE}=${createSession()}` },
          }),
        ).status,
      ).toBe(200);
    }
    const preflight = proxy(
      new NextRequest("http://localhost/api/prices", { method: "OPTIONS" }),
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Headers")).toContain(
      "Authorization",
    );
  });

  test("login rejects wrong passwords and issues an HttpOnly 24-hour cookie", async () => {
    for (const password of ["wrong", PASSWORD]) {
      const data = new FormData();
      data.set("password", password);
      const response = await login(
        new Request("https://localhost/api/session", {
          method: "POST",
          body: data,
        }),
      );
      expect(response.status).toBe(password === PASSWORD ? 200 : 401);
      if (password === PASSWORD) {
        const cookie = response.headers.get("set-cookie") || "";
        expect(cookie).toContain("Max-Age=86400");
        expect(cookie).toContain("HttpOnly");
        expect(cookie).toContain("Secure");
      } else {
        expect(response.headers.has("set-cookie")).toBe(false);
      }
    }
  });
});
