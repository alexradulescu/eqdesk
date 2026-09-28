import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  // The API returns absolute image URLs on whatever host serves it (localhost,
  // preview, production), so the reference serves them as-is.
  images: { unoptimized: true },
};

export default nextConfig;
