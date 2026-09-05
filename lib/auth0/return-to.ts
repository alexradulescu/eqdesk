// Allow only local reading and subscription destinations across the mock Auth0 round trip.
export function getReturnTo(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (/^\/articles\/[a-z0-9-]+$/.test(value) || value === "/subscribe")
    return value;
  if (value.startsWith("/demo/revenuecat/checkout?")) {
    const url = new URL(value, "http://eqdesk.local");
    const article = url.searchParams.get("returnTo");
    const returnTo =
      article && /^\/articles\/[a-z0-9-]+$/.test(article) ? article : "/";
    return `/demo/revenuecat/checkout?returnTo=${encodeURIComponent(returnTo)}`;
  }
  return "/";
}
