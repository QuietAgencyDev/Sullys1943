import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { redOwlAssets } from "@sullys/brand-red-owl";
import { RED_OWL_PROGRAMS } from "@/lib/programs-red-owl";
import styles from "../join/join.module.css";

export const metadata: Metadata = {
  title: "Scarborough Smartbox | Program details",
  description:
    "Free 12-week Scarborough youth program — boxing, mentorship, tutoring, counselling, meals, and a 1-year Red Owl membership.",
};

const PILLAR_SLUGS = [
  "smartbox-boxing",
  "smartbox-mentorship",
  "smartbox-academic-support",
  "smartbox-emotional-support",
  "smartbox-nutrition",
  "smartbox-career-pathways",
] as const;

export default function SmartboxPage() {
  const brand = getBrand();
  const gym = brand.gym;
  const overview = RED_OWL_PROGRAMS.find(
    (p) => p.slug === "scarborough-smartbox",
  );
  const pillars = PILLAR_SLUGS.map((slug) =>
    RED_OWL_PROGRAMS.find((p) => p.slug === slug),
  ).filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Youth program</p>
        <h1 className={styles.title}>Scarborough Smartbox</h1>
        <p className={styles.copy}>{overview?.lead}</p>

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 720,
            aspectRatio: "16 / 10",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <Image
            src={redOwlAssets.smartboxTraining}
            alt="Scarborough Smartbox training"
            fill
            sizes="(max-width: 720px) 100vw, 720px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {overview?.body.map((para) => (
          <p key={para} className={styles.copy}>
            {para}
          </p>
        ))}

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          {[
            redOwlAssets.smartboxJunior,
            redOwlAssets.scarboroughGym,
            redOwlAssets.heroImage,
          ].map((src) => (
            <div
              key={src}
              style={{
                position: "relative",
                aspectRatio: "1",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="200px"
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>

        <h2 className={styles.title} style={{ fontSize: "1.6rem" }}>
          Program pillars
        </h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
          {pillars.map((p) => (
            <li key={p!.slug}>
              <Link href={`/programs/${p!.slug}`}>
                <strong>{p!.name}</strong>
              </Link>
              <p className={styles.copy} style={{ marginTop: "0.25rem" }}>
                {p!.short}
              </p>
            </li>
          ))}
        </ul>

        <p className={styles.copy}>
          <strong>Attendance:</strong> Regular attendance, participation, and
          respectful engagement are essential. Youth commit fully to the 12-week
          experience; families are encouraged to support this structure at home.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link href="/join">
            <Button variant="primary">Ask about intake</Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary">About</Button>
          </Link>
          <Link href="/programs/scarborough-smartbox">
            <Button variant="ghost">Full program page</Button>
          </Link>
          {gym.smartboxUrl ? (
            <a href={gym.smartboxUrl} target="_blank" rel="noreferrer">
              <Button variant="ghost">scarboroughsmartbox.ca</Button>
            </a>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
