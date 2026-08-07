import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sullys/ui", "@sullys/tokens", "@sullys/types"],
};

export default nextConfig;
