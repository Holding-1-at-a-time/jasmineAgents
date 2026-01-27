import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
    ppr: true,
  },
};

export default nextConfig;
