import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@sullys/ui", "@sullys/tokens"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
