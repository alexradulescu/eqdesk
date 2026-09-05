export function Devtools() {
  return (
    <div className="container devtools">
      <span>Devtools</span>
      <form action="/devtools/clear-reading-cookie" method="post">
        <button type="submit">Clear reading cookie</button>
      </form>
    </div>
  );
}
