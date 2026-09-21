import "server-only";
import { headers } from "next/headers";

// Set this to the public mock API URL when running the API separately.
export const apiOrigin = process.env.CRYPTOWIRE_API_URL ?? "";

// The reference app calls its own bundled API, so follow the incoming request
// rather than a fixed port. Proxies and hosts set x-forwarded-proto.
async function serverOrigin() {
  if (apiOrigin) return apiOrigin;
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function fetchApi<T>(path: string): Promise<T | null> {
  const response = await fetch(`${await serverOrigin()}/api${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`CryptoWire API returned ${response.status}`);
  return response.json();
}
