import "server-only";

// Set this to the public mock API URL when running the API separately.
const apiUrl = process.env.CRYPTOWIRE_API_URL ?? "http://localhost:3000";

export async function fetchApi<T>(path: string): Promise<T | null> {
  const response = await fetch(`${apiUrl}/api${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`CryptoWire API returned ${response.status}`);
  return response.json();
}
