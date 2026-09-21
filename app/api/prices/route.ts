import { debugResponse, json } from "@/lib/cryptowire/api";
import { getPrices } from "@/lib/cryptowire/prices";

export async function GET(request: Request) {
  const debug = await debugResponse(new URL(request.url).searchParams);
  if (debug) return debug;
  return json(getPrices());
}
