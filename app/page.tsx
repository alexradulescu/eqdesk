import Link from "next/link";
import "./docs.css";

const article = {
  id: "bitcoin-finds-its-footing",
  title: "Bitcoin finds its footing as investors take the long view",
  category: "Markets",
  publishedAt: "2026-09-05T08:00:00Z",
  image: { url: "/images/bitcoin.jpg", alt: "Bitcoin coins" },
};

export default function ApiDocs() {
  return (
    <>
      <header className="site-header docs-header">
        <div className="container top-bar">
          <Link href="/" className="logotype">
            Crypto<span>Wire</span>
            <span className="brand-dot">.</span>
          </Link>
          <span className="edition">API REFERENCE</span>
        </div>
      </header>
      <main id="main-content" className="container docs-content">
        <div className="docs-heading">
          <div>
            <h1>Build with the API</h1>
            <p>Pick an endpoint. Open the JSON. Start building.</p>
          </div>
          <span className="docs-version">REST · JSON</span>
        </div>
        <div className="docs-basics">
          <span>
            <strong>Base URL</strong> This site’s origin + <code>/api</code>
          </span>
          <span>No auth</span>
          <span>CORS *</span>
          <span>No cache</span>
        </div>

        <section className="docs-endpoints" aria-labelledby="endpoints-heading">
          <h2 id="endpoints-heading">
            Endpoints <span>3</span>
          </h2>
          <details className="docs-endpoint" name="endpoint">
            <summary>
              <span className="docs-method">GET</span>
              <code>/api/articles</code>
              <span className="docs-purpose">List articles</span>
              <span className="docs-chevron" aria-hidden="true" />
            </summary>
            <div className="docs-endpoint-body">
              <div>
                <h3>Query parameters</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Default</th>
                      <th>Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>limit</code>
                      </td>
                      <td>12</td>
                      <td>Integer 1–100</td>
                    </tr>
                    <tr>
                      <td>
                        <code>offset</code>
                      </td>
                      <td>0</td>
                      <td>Integer ≥ 0</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  Returns <strong>ArticleSummary[]</strong>. No body.
                </p>
                <p className="docs-hint">
                  12 fixtures. Past the last item? Returns <code>[]</code>.
                </p>
                <a className="docs-try" href="/api/articles?limit=2&offset=0">
                  Open JSON <span aria-hidden="true">↗</span>
                </a>
                <code className="docs-request">?limit=2&amp;offset=0</code>
              </div>
              <div className="docs-response">
                <h3>
                  <span>200</span> Example item in the array
                </h3>
                <pre>
                  <code>{JSON.stringify([article], null, 2)}</code>
                </pre>
              </div>
            </div>
          </details>
          <details className="docs-endpoint" name="endpoint">
            <summary>
              <span className="docs-method">GET</span>
              <code>/api/articles/:id</code>
              <span className="docs-purpose">Full article</span>
              <span className="docs-chevron" aria-hidden="true" />
            </summary>
            <div className="docs-endpoint-body">
              <div>
                <h3>Path parameter</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>id</code> <small>required</small>
                      </td>
                      <td>Exact ID from the article list</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  Returns <strong>Article</strong>: summary fields +{" "}
                  <code>body</code>.
                </p>
                <p className="docs-hint">
                  Unknown ID → <code>404</code>. Body is HTML; sanitize before
                  rendering.
                </p>
                <a
                  className="docs-try"
                  href="/api/articles/bitcoin-finds-its-footing"
                >
                  Open JSON <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="docs-response">
                <h3>
                  <span>200</span> Example article
                </h3>
                <pre>
                  <code>
                    {JSON.stringify(
                      {
                        ...article,
                        body: "<p>Article text…</p><h2>A longer view</h2>",
                      },
                      null,
                      2,
                    )}
                  </code>
                </pre>
              </div>
            </div>
          </details>
          <details className="docs-endpoint" name="endpoint">
            <summary>
              <span className="docs-method">GET</span>
              <code>/api/prices</code>
              <span className="docs-purpose">6 assets · updates every 5s</span>
              <span className="docs-chevron" aria-hidden="true" />
            </summary>
            <div className="docs-endpoint-body">
              <div>
                <h3>No parameters required</h3>
                <p>
                  Returns <strong>Price[]</strong>: BTC, ETH, SOL, XRP, DOGE,
                  USDC.
                </p>
                <p>
                  Poll every <strong>5 seconds</strong> for new simulated
                  quotes.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Read as</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>price</code>
                      </td>
                      <td>Decimal string</td>
                    </tr>
                    <tr>
                      <td>
                        <code>decimals</code>
                      </td>
                      <td>USD precision: ETH → $2,635.56</td>
                    </tr>
                    <tr>
                      <td>
                        <code>change24h</code>
                      </td>
                      <td>
                        <code>"0.87"</code> → +0.87%
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="docs-hint">
                  BTC / ETH / SOL: 2 decimals · XRP / USDC: 4 · DOGE: 5. USDC
                  stays near $1.
                </p>
                <a className="docs-try" href="/api/prices">
                  Open JSON <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="docs-response">
                <h3>
                  <span>200</span> Example item in the array
                </h3>
                <pre>
                  <code>
                    {JSON.stringify(
                      [
                        {
                          symbol: "ETH",
                          name: "Ethereum",
                          price: "2635.56000000",
                          decimals: 2,
                          change24h: "0.87",
                        },
                      ],
                      null,
                      2,
                    )}
                  </code>
                </pre>
              </div>
            </div>
          </details>
        </section>

        <div className="docs-reference-grid">
          <section className="docs-contract" aria-labelledby="fields-heading">
            <h2 id="fields-heading">Four fields to notice</h2>
            <dl>
              <div>
                <dt>publishedAt</dt>
                <dd>
                  ISO UTC. Includes a future-dated article, also available by
                  ID.
                </dd>
              </div>
              <div>
                <dt>image</dt>
                <dd>
                  <code>null</code> or <code>{"{ url, alt }"}</code>. Relative
                  URLs use the API origin.
                </dd>
              </div>
              <div>
                <dt>body</dt>
                <dd>HTML string. Title & hero are separate. Sanitize it.</dd>
              </div>
              <div>
                <dt>price</dt>
                <dd>
                  String. Format with the asset’s <code>decimals</code>.
                </dd>
              </div>
            </dl>
          </section>
          <section className="docs-debug" aria-labelledby="debug-heading">
            <h2 id="debug-heading">Test loading & errors</h2>
            <p>
              Works on every endpoint. Combine with <code>&amp;</code>.
            </p>
            <a className="docs-debug-link" href="/api/articles?latency=3000">
              <code>?latency=3000</code>
              <span>3s delay ↗</span>
            </a>
            <p className="docs-hint">
              Integer milliseconds · 0–10000 · default 0
            </p>
            <a className="docs-debug-link" href="/api/prices?fail=1">
              <code>?fail=1</code>
              <span>HTTP 500 ↗</span>
            </a>
            <p className="docs-hint">Failure follows the requested delay.</p>
            <details className="docs-errors">
              <summary>Error codes & response</summary>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>400</td>
                    <td>Invalid numeric parameter</td>
                  </tr>
                  <tr>
                    <td>404</td>
                    <td>Unknown article ID</td>
                  </tr>
                  <tr>
                    <td>500</td>
                    <td>Simulated failure</td>
                  </tr>
                </tbody>
              </table>
              <pre>
                <code>{'{ "error": "Simulated API failure" }'}</code>
              </pre>
            </details>
          </section>
        </div>
        <p className="docs-footnote">
          Response headers: <code>Access-Control-Allow-Origin: *</code> ·{" "}
          <code>Cache-Control: no-store</code>
        </p>
      </main>
      <footer className="container site-footer">
        <span>CryptoWire API</span>
        <span>Fictional stories. Simulated prices.</span>
      </footer>
    </>
  );
}
