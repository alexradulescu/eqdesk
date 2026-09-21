const headers = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers });
}

export async function debugResponse(params: URLSearchParams) {
  const latency = Number(params.get("latency") ?? 0);
  if (!Number.isInteger(latency) || latency < 0 || latency > 10000) {
    return json({ error: "latency must be an integer from 0 to 10000" }, 400);
  }
  if (latency) await new Promise((resolve) => setTimeout(resolve, latency));
  if (params.get("fail") === "1")
    return json({ error: "Simulated API failure" }, 500);
  return null;
}
