"use client";

import { useEffect, useState } from "react";
import type { Price } from "@/lib/cryptowire/types";

export function Prices({ initialPrices }: { initialPrices: Price[] }) {
  const [prices, setPrices] = useState(initialPrices);
  const [failed, setFailed] = useState(initialPrices.length === 0);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch("/api/prices", {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(10000),
          ]),
        });
        if (!response.ok) throw new Error("Prices unavailable");
        const nextPrices: Price[] = await response.json();
        if (!controller.signal.aborted) {
          setPrices(nextPrices);
          setFailed(false);
        }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        pending = false;
      }
    }
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, []);

  return (
    <>
      <p className="price-note">Simulated prices · updates every 5s</p>
      {failed && (
        <output className="price-error">
          Prices unavailable.{" "}
          {prices.length > 0 && "Showing last known values. "}Retrying
          automatically.
        </output>
      )}
      <ul className="price-list">
        {prices.map((asset) => (
          <li key={asset.symbol}>
            <div className="asset-name">
              <strong>{asset.symbol}</strong>
              <span>{asset.name}</span>
            </div>
            <div className="asset-price">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: asset.decimals,
                maximumFractionDigits: asset.decimals,
              }).format(Number(asset.price))}
            </div>
            <span
              className={
                Number(asset.change24h) >= 0
                  ? "change positive"
                  : "change negative"
              }
            >
              {Number(asset.change24h) >= 0 ? "▲ +" : "▼ "}
              {asset.change24h}% <span className="change-label">24h</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
