import type { Price } from "./types";

const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 63164.123456,
    decimals: 2,
    change: -1.24,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3042.555012,
    decimals: 4,
    change: 0.87,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 145.381234,
    decimals: 2,
    change: 2.13,
  },
  { symbol: "XRP", name: "XRP", price: 0.582341, decimals: 4, change: -0.42 },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.10458231,
    decimals: 6,
    change: 1.56,
  },
];

// Every server returns the same quote during each five-second time bucket.
// A small bounded wave keeps the demo moving without timers or stored state.
export function getPrices(now = Date.now()): Price[] {
  const tick = Math.floor(now / 5000);
  return assets.map((asset, index) => {
    const drift = Math.sin(tick * 0.7 + index) * 0.001;
    return {
      symbol: asset.symbol,
      name: asset.name,
      price: (asset.price * (1 + drift)).toFixed(8),
      decimals: asset.decimals,
      change24h: (asset.change + drift * 100).toFixed(2),
    };
  });
}
