import type { NextConfig } from "next";

const apiTarget = (
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@sullys/ui", "@sullys/tokens", "@sullys/types"],
  async rewrites() {
    // Same-origin /api/v1/* → Railway, so auth cookies are first-party on www
    // (required for iOS Safari / mobile login).
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
