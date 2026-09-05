// Only return to reading routes, never an external URL or another auth endpoint.
export function getReturnTo(value: unknown): string {
  return typeof value === "string" && /^\/articles\/[a-z0-9-]+$/.test(value)
    ? value
    : "/";
}
