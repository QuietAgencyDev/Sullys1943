import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    getBrand().id === "red-owl"
      ? "https://redowl2021.com"
      : "https://www.sullys1943.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/tv/", "/manuals", "/docs/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
