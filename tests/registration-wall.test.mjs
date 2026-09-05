import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const slugs = [
  "bitcoin-finds-its-footing",
  "stablecoins-meet-everyday-payments",
  "institutions-build-onchain",
  "wallets-designed-for-people",
];

function reader() {
  const cookies = new Map();
  return {
    cookies,
    async request(path, options = {}) {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        redirect: "manual",
        headers: {
          Cookie: [...cookies]
            .map(([name, value]) => `${name}=${value}`)
            .join("; "),
          ...options.headers,
        },
      });
      for (const cookie of response.headers.getSetCookie()) {
        const [pair] = cookie.split(";");
        const separator = pair.indexOf("=");
        const name = pair.slice(0, separator);
        if (/Max-Age=0/i.test(cookie) || pair.slice(separator + 1) === "")
          cookies.delete(name);
        else cookies.set(name, pair.slice(separator + 1));
      }
      return response;
    },
  };
}

const hasBody = (html) => html.includes('class="article-body"');

test("three distinct reads, repeat access, server-side blocking, login and reset", async () => {
  const visitor = reader();
  const firstVisit = await visitor.request(`/articles/${slugs[0]}`);
  const firstHtml = await firstVisit.text();
  assert.ok(
    firstVisit.headers.get("location")?.includes(`/read/${slugs[0]}`) ||
      firstHtml.includes(`/read/${slugs[0]}`),
  );
  assert.equal(hasBody(firstHtml), false);

  for (let index = 0; index < 3; index++) {
    const admission = await visitor.request(`/read/${slugs[index]}`);
    assert.equal(admission.status, 303);
    assert.equal(
      admission.headers.get("location"),
      `/articles/${slugs[index]}`,
    );
    assert.match(admission.headers.get("set-cookie"), /HttpOnly/i);
    assert.match(admission.headers.get("set-cookie"), /SameSite=lax/i);
    assert.doesNotMatch(
      admission.headers.get("set-cookie"),
      /Max-Age|Expires/i,
    );
    const html = await (
      await visitor.request(`/articles/${slugs[index]}`)
    ).text();
    assert.ok(
      html.includes(`${index + 1}<!-- -->/<!-- -->3`) ||
        new RegExp(`${index + 1}/3`).test(html),
      "meter displays the current allowance",
    );
    assert.equal(hasBody(html), true);
    assert.equal((html.match(/class="advertisement"/g) ?? []).length, 2);
    const cookieBeforeRefresh = visitor.cookies.get("eqdesk_read_articles");
    await visitor.request(`/articles/${slugs[index]}`);
    await visitor.request(`/read/${slugs[index]}`);
    assert.equal(
      visitor.cookies.get("eqdesk_read_articles"),
      cookieBeforeRefresh,
    );
  }

  const meterAtLimit = visitor.cookies.get("eqdesk_read_articles");
  await visitor.request(`/read/${slugs[3]}`);
  assert.equal(visitor.cookies.get("eqdesk_read_articles"), meterAtLimit);
  for (const headers of [{}, { RSC: "1" }]) {
    const html = await (
      await visitor.request(
        `/articles/${slugs[3]}${headers.RSC ? "?_rsc" : ""}`,
        { headers },
      )
    ).text();
    assert.ok(
      html.includes("Log in to keep reading."),
      JSON.stringify({
        headers,
        cookies: [...visitor.cookies],
        response: html.slice(-1200),
      }),
    );
    assert.equal(hasBody(html), false);
    assert.equal(
      html.includes("The first screen of a digital wallet"),
      false,
      "blocked text must not appear in HTML or RSC",
    );
    assert.equal(html.includes('class="advertisement"'), false);
  }
  for (const slug of slugs.slice(0, 3)) {
    assert.equal(
      hasBody(await (await visitor.request(`/articles/${slug}`)).text()),
      true,
    );
  }

  for (const name of ["alison", "john", "maria", "xavier"]) {
    await visitor.request(`/auth/callback?user=auth0%7C${name}`);
    const html = await (await visitor.request(`/articles/${slugs[3]}`)).text();
    assert.equal(hasBody(html), true);
    assert.equal(html.includes('class="reading-notice"'), false);
    assert.equal(visitor.cookies.get("eqdesk_read_articles"), meterAtLimit);
    assert.equal((await visitor.request("/auth/profile")).status, 200);
  }
  const sessionBeforeReset = visitor.cookies.get("eqdesk_mock_session");
  const reset = await visitor.request("/devtools/clear-reading-cookie", {
    method: "POST",
  });
  assert.equal(reset.status, 303);
  assert.equal(reset.headers.get("location"), "/");
  assert.equal(visitor.cookies.has("eqdesk_read_articles"), false);
  assert.equal(visitor.cookies.get("eqdesk_mock_session"), sessionBeforeReset);
  await visitor.request("/auth/logout");
  await visitor.request(`/read/${slugs[3]}`);
  assert.deepEqual(
    JSON.parse(decodeURIComponent(visitor.cookies.get("eqdesk_read_articles"))),
    [slugs[3]],
  );
});

test("unknown articles and malformed cookies do not break the reader", async () => {
  const visitor = reader();
  assert.equal((await visitor.request("/read/missing-story")).status, 404);
  assert.equal(visitor.cookies.has("eqdesk_read_articles"), false);
  visitor.cookies.set("eqdesk_read_articles", "broken-json");
  await visitor.request(`/read/${slugs[0]}`);
  assert.deepEqual(
    JSON.parse(decodeURIComponent(visitor.cookies.get("eqdesk_read_articles"))),
    [slugs[0]],
  );
  assert.equal(
    (await visitor.request("/devtools/clear-reading-cookie")).status,
    405,
  );
  for (const path of ["/", "/auth/login", `/articles/${slugs[0]}`]) {
    assert.ok(
      (await (await visitor.request(path)).text()).includes(
        "Clear reading cookie",
      ),
    );
  }
});
