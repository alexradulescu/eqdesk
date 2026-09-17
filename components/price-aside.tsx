import { fetchApi } from "@/lib/cryptowire/client";
import type { Price } from "@/lib/cryptowire/types";
import { Prices } from "./prices";

export async function PriceAside() {
  const prices = await fetchApi<Price[]>("/prices").catch(() => null);
  return <Prices initialPrices={prices ?? []} />;
}
