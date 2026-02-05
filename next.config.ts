import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // ppr: true, // Merged into cacheComponents
    reactCompiler: true,
  },
};

export default nextConfig;
