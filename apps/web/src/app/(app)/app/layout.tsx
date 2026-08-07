import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

export const metadata: Metadata = {
  title: "Sully's Member Portal",
  description: "Calendar, membership card, booking, and training hub.",
};

export default function MemberAppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
