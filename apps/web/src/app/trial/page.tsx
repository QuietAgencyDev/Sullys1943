import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { formatAddress } from "@/lib/gym-info";
import styles from "../join/join.module.css";

export const metadata: Metadata = {
  title: "3-Day Free Trial | Red Owl Boxing Scarborough",
  description:
    "Activate a 3-day free trial — boxing classes, weights, and cardio at Red Owl Scarborough.",
};

export default function TrialPage() {
  const brand = getBrand();
  const gym = brand.gym;
  const isRedOwl = brand.id === "red-owl";

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>
          {isRedOwl ? "Free trial" : "Coming in Phase 2–3"}
        </p>
        <h1 className={styles.title}>
          {isRedOwl ? "3-day free trial" : "Book a Trial"}
        </h1>
        {isRedOwl ? (
          <>
            <p className={styles.copy}>
              Get three full days to train at {gym.name} — boxing classes, open
              gym, weights, and cardio. {gym.partnerLine}.
            </p>
            <p className={styles.copy}>
              {formatAddress(" · ")}
              {gym.addressHint ? ` · ${gym.addressHint}` : ""}
            </p>
            <p className={styles.copy}>{gym.hoursSummary}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link href="/join">
                <Button variant="primary">Activate trial</Button>
              </Link>
              <a href={`tel:${gym.phoneTel}`}>
                <Button variant="secondary">Call {gym.phoneDisplay}</Button>
              </a>
              <Link href="/app/register">
                <Button variant="ghost">Create member account</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.copy}>
              Trial booking will connect to live class capacity, digital waivers,
              and your membership card — same database as the gym floor.
            </p>
            <Link href="/">
              <Button variant="secondary">Back home</Button>
            </Link>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
