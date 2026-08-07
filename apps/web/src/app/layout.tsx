import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Libre_Baskerville } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Sully's Boxing Gym | Boxing is the engine · EST 1943",
  description:
    "Canada's oldest boxing club. Boxing is the engine. People are the purpose. Character is the legacy. Building character before life demands it.",
  applicationName: "Sully's",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Sully's",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#C82026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${heritage.variable}`}>
        {children}
      </body>
    </html>
  );
}
