import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getBrand } from "@/lib/brand";
import "./globals.css";

const display = localFont({
  src: "../fonts/bebas-neue-latin.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-display-loaded",
});

const body = localFont({
  src: "../fonts/dm-sans-latin.woff2",
  weight: "100 1000",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-body-loaded",
});

const heritage = localFont({
  src: [
    {
      path: "../fonts/libre-baskerville-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/libre-baskerville-latin.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-heritage-loaded",
});

const brand = getBrand();
const siteUrl =
  brand.id === "red-owl"
    ? "https://redowl2021.com"
    : "https://www.sullys1943.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: brand.meta.title,
  description: brand.meta.description,
  applicationName: brand.meta.applicationName,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: brand.meta.applicationName,
    title:
      brand.id === "red-owl" ? "REDOWL2021" : brand.meta.title,
    description: brand.meta.description,
    images: [{ url: brand.assets.logoPrimary }],
  },
  twitter: {
    card: "summary",
    title:
      brand.id === "red-owl" ? "REDOWL2021" : brand.meta.title,
    description: brand.meta.description,
    images: [brand.assets.logoPrimary],
  },
  manifest:
    brand.id === "red-owl"
      ? "/manifest-red-owl.webmanifest"
      : "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: brand.meta.applicationName,
    statusBarStyle: "black-translucent",
  },
  icons:
    brand.id === "red-owl"
      ? {
          icon: [
            {
              url: "/brand/red-owl/app-icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              url: "/brand/red-owl/app-icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
          apple: [
            {
              url: "/brand/red-owl/app-icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        }
      : {
          icon: [
            { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
          apple: [
            { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          ],
        },
};

export const viewport: Viewport = {
  themeColor: brand.meta.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-brand={brand.id}>
      <body className={`${display.variable} ${body.variable} ${heritage.variable}`}>
        {children}
      </body>
    </html>
  );
}
