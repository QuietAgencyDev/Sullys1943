import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getBrand } from "@/lib/brand";
import { AppShell } from "./app-shell";

const brand = getBrand();

export const metadata: Metadata = {
  title: `${brand.copy.appName} · ${brand.copy.appSubtitle}`,
  description:
    brand.id === "red-owl"
      ? "RED OWL 2021 member app — book classes, digital card, passport. Platform by Quiet Agency."
      : "Calendar, membership card, booking, and training hub.",
};

export default function MemberAppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
