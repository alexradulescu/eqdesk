import type { Price } from "./types";

// Illustrative USD snapshot: https://www.coingecko.com/en/all-cryptocurrencies
// Display decimals are quote precision, not on-chain token decimals.
const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 81106.25,
    decimals: 2,
    change: -1.24,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2635.56,
    decimals: 2,
    change: 0.87,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 110.39,
    decimals: 2,
    change: 2.13,
  },
  { symbol: "XRP", name: "XRP", price: 1.41, decimals: 4, change: -0.42 },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.08749,
    decimals: 5,
    change: 1.56,
  },
  { symbol: "USDC", name: "USDC", price: 0.9997, decimals: 4, change: 0 },
];

// Every server returns the same quote during each five-second time bucket.
// A small bounded wave keeps the demo moving without timers or stored state.
export function getPrices(now = Date.now()): Price[] {
  const tick = Math.floor(now / 5000);
  return assets.map((asset, index) => {
    // Keep the stablecoin ten times less volatile than the other fixtures.
    const amplitude = asset.symbol === "USDC" ? 0.0001 : 0.001;
    const drift = Math.sin(tick * 0.7 + index) * amplitude;
    const change = Math.round((asset.change + drift * 100) * 100) / 100;
    return {
      symbol: asset.symbol,
      name: asset.name,
      price: (asset.price * (1 + drift)).toFixed(8),
      decimals: asset.decimals,
      change24h: change.toFixed(2),
    };
  });
}
