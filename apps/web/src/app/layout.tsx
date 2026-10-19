import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Libre_Baskerville } from "next/font/google";
import { getBrand } from "@/lib/brand";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-loaded",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body-loaded",
});

const heritage = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
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
