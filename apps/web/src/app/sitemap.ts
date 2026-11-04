import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    getBrand().id === "red-owl"
      ? "https://redowl2021.com"
      : "https://www.sullys1943.com";
  const paths = [
    "",
    "/about",
    "/legacy",
    "/coaches",
    "/classes",
    "/programs",
    "/store",
    "/donate",
    "/contact",
    "/join",
    "/trial",
    "/terms",
    "/privacy",
  ];
  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
