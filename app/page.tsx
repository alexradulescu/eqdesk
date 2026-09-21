import "./docs.css";

const summary = {
  id: "bitcoin-finds-its-footing",
  title: "Bitcoin finds its footing as investors take the long view",
  category: "Markets",
  publishedAt: "2026-09-05T08:00:00Z",
  image: {
    url: "/images/bitcoin.jpg",
    alt: "Bitcoin coins against a dark background",
  },
};
const price = {
  symbol: "ETH",
  name: "Ethereum",
  price: "3042.55501200",
  decimals: 4,
  change24h: "0.87",
};

export default function ApiDocs() {
  return (
    <>
      <header className="site-header">
        <div className="container top-bar">
          <a href="/" className="logotype">
            Crypto<span>Wire</span>
            <span className="brand-dot">.</span>
          </a>
          <span className="edition">API DOCUMENTATION</span>
        </div>
      </header>
      <div className="container docs-layout">
        <nav className="docs-nav" aria-label="Documentation">
          <p>ON THIS PAGE</p>
          <a href="#overview">Overview</a>
          <a href="#articles">Article list</a>
          <a href="#article">Full article</a>
          <a href="#prices">Prices</a>
          <a href="#debug">Testing & errors</a>
          <a href="#contract">Data notes</a>
        </nav>
        <main id="main-content" className="docs-content">
          <section id="overview" className="docs-intro">
            <p className="docs-eyebrow">THE INTERVIEW API</p>
            <h1>
              A small API.
              <br />A news site to build.
            </h1>
            <p>
              Fictional crypto news and simulated market prices. Plain JSON over
              HTTP, with no keys and no signup.
            </p>
            <p>
              Use this site’s origin as your API base URL. All endpoints are
              read-only and allow cross-origin requests.
            </p>
            <div className="docs-endpoints">
              <a href="/api/articles">
                <span>GET</span>
                <code>/api/articles</code>
              </a>
              <a href="/api/articles/bitcoin-finds-its-footing">
                <span>GET</span>
                <code>/api/articles/:id</code>
              </a>
              <a href="/api/prices">
                <span>GET</span>
                <code>/api/prices</code>
              </a>
            </div>
          </section>
          <section id="articles">
            <p className="docs-eyebrow">01 / ARTICLES</p>
            <h2>Get the latest stories</h2>
            <p>
              <code>GET /api/articles</code> returns an array of article
              summaries. Summaries do not include the article body.
            </p>
            <div className="docs-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Default</th>
                    <th>Accepted values</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>limit</code>
                    </td>
                    <td>12</td>
                    <td>Integer from 1 to 100</td>
                  </tr>
                  <tr>
                    <td>
                      <code>offset</code>
                    </td>
                    <td>0</td>
                    <td>Non-negative integer</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <a href="/api/articles?limit=2&offset=0">
                Open an example: first two articles →
              </a>
            </p>
            <pre>
              <code>{JSON.stringify([summary], null, 2)}</code>
            </pre>
            <p className="docs-caption">
              Example response showing one item. There are 12 fixtures; some
              have no image and one has a future publication date.
            </p>
          </section>
          <section id="article">
            <p className="docs-eyebrow">02 / ARTICLE DETAIL</p>
            <h2>Read one article</h2>
            <p>
              <code>GET /api/articles/:id</code> returns one article with the
              same summary fields plus <code>body</code>. Use the exact{" "}
              <code>id</code> from the list. Unknown IDs return HTTP 404.
            </p>
            <pre>
              <code>
                {JSON.stringify(
                  {
                    ...summary,
                    body: "<p>The conversation around bitcoin is changing.</p><h2>A longer view</h2><p>More fictional reporting follows.</p>",
                  },
                  null,
                  2,
                )}
              </code>
            </pre>
            <p>
              The body is one HTML string. Title, category, publication date,
              and hero image are separate fields. Sanitize the body before
              rendering HTML.
            </p>
            <p>
              <a href="/api/articles/bitcoin-finds-its-footing">
                Open the full article response →
              </a>
            </p>
          </section>
          <section id="prices">
            <p className="docs-eyebrow">03 / MARKET PRICES</p>
            <h2>Five assets, changing every five seconds</h2>
            <p>
              <code>GET /api/prices</code> returns BTC, ETH, SOL, XRP, and DOGE.
              Quotes shift slightly in five-second time buckets. Poll the
              endpoint to receive new values.
            </p>
            <pre>
              <code>{JSON.stringify([price], null, 2)}</code>
            </pre>
            <ul>
              <li>
                <code>price</code> is a full-precision decimal string. Format it
                using the asset’s <code>decimals</code>: this ETH example
                displays as <strong>$3,042.5550</strong>.
              </li>
              <li>
                <code>change24h</code> is a signed percentage string:{" "}
                <code>"0.87"</code> means +0.87%, not 87%.
              </li>
              <li>
                Values are simulated, not live market data. No streaming
                connection is provided.
              </li>
            </ul>
            <p>
              <a href="/api/prices">Open current simulated prices →</a>
            </p>
          </section>
          <section id="debug">
            <p className="docs-eyebrow">04 / TESTING</p>
            <h2>Make the API slow. Make it fail.</h2>
            <p>
              These query parameters work on every endpoint. Combine them with
              pagination using <code>&amp;</code>.
            </p>
            <div className="docs-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Behavior</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>latency=3000</code>
                    </td>
                    <td>
                      Wait 3 seconds. Accepts integer milliseconds from 0 to
                      10000.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>fail=1</code>
                    </td>
                    <td>Return HTTP 500 after any requested delay.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <a href="/api/articles?latency=3000">Try a slow article list →</a>
            </p>
            <p>
              <a href="/api/prices?fail=1">Try a failed price request →</a>
            </p>
            <pre>
              <code>
                {JSON.stringify({ error: "Simulated API failure" }, null, 2)}
              </code>
            </pre>
            <p>
              HTTP 400 means invalid numeric parameters; HTTP 404 means an
              unknown article; HTTP 500 is the simulated failure. Error
              responses contain an <code>error</code> string. An offset beyond
              the list returns <code>[]</code> with HTTP 200.
            </p>
          </section>
          <section id="contract">
            <p className="docs-eyebrow">05 / THE CONTRACT</p>
            <h2>Handle what the API gives you</h2>
            <ul>
              <li>
                <code>publishedAt</code> is an ISO UTC string. The API includes
                one future-dated article, even on direct detail requests. Decide
                whether it belongs in your published news site.
              </li>
              <li>
                <code>image</code> is either <code>null</code> or an object with{" "}
                <code>url</code> and <code>alt</code>. Resolve relative image
                URLs against the API origin, especially when your app runs
                elsewhere.
              </li>
              <li>
                Article HTML is content to sanitize, not trusted application
                markup.
              </li>
              <li>
                Responses set <code>Access-Control-Allow-Origin: *</code> and{" "}
                <code>Cache-Control: no-store</code>.
              </li>
              <li>
                The categories endpoint is a bonus in the exercise and is not
                provided here.
              </li>
            </ul>
            <p className="docs-note">
              The API reflects the state of the world. Handle what it gives you.
            </p>
          </section>
        </main>
      </div>
      <footer className="container site-footer">
        <span>CryptoWire API</span>
        <span>All stories and prices are fictional.</span>
      </footer>
    </>
  );
}
