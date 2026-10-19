import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { redOwlAssets } from "@sullys/brand-red-owl";
import styles from "../programs/programs.module.css";

export const metadata: Metadata = {
  title: "About | Red Owl Boxing & Scarborough Smartbox",
  description:
    "Red Owl Boxing and Scarborough Smartbox — youth development, Scarborough gym, and the story of Red Owl Boxing.",
};

export default function AboutPage() {
  const brand = getBrand();
  const gym = brand.gym;

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>About us</p>
        <h1 className={styles.title}>Red Owl × Smartbox</h1>
        <p className={styles.manifesto}>
          Built on passion — structure for boxing&apos;s next generation, and a
          safe after-school path for Scarborough youth.
        </p>

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {[
            redOwlAssets.heroImage,
            redOwlAssets.scarboroughGym,
            redOwlAssets.fightNight,
            redOwlAssets.smartboxJunior,
          ].map((src) => (
            <div
              key={src}
              style={{
                position: "relative",
                aspectRatio: "4 / 3",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 720px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>

        <div className={styles.prose}>
          <h2 className={styles.subhead}>Scarborough Smartbox</h2>
          <p>
            Scarborough Smartbox is a youth development program created to give
            young people in Scarborough a safe and structured environment after
            school. Powered by Red Owl Boxing, it blends high-intensity training
            with mentorship, tutoring, counselling, and nutritional support —
            helping youth build stronger routines and confidence.
          </p>
          <p>
            The mission is to strengthen Scarborough youth through discipline,
            resilience, and long-term wellbeing: better school attendance,
            emotional stability, academic engagement, and life skills.
          </p>

          <h2 className={styles.subhead}>Red Owl Boxing</h2>
          <p>
            Red Owl Boxing is a media and promotions company founded in 2021 by
            Canada-based entrepreneur Gabriel Fanous — positioned to usher in
            the next generation of boxing&apos;s stars with consistent
            programming: top prospects, action-packed fights, and veterans
            fighting to earn a place in major events.
          </p>
          <p>
            With state-of-the-art facilities (including Houston and Brampton) and
            the BoxFest prospect series streamed live on DAZN, Red Owl elevates
            the sport by spotlighting tomorrow&apos;s stars today. In Scarborough,
            Red Owl partners with Scarberian Boxing Club at {gym.addressLine1}.
          </p>

          <h2 className={styles.subhead}>Who Smartbox serves</h2>
          <p>
            Many participants are referred by schools, youth agencies, and
            community partners. Others apply with their families. All experience
            levels are welcome — youth working on attendance, looking for a
            healthy outlet, or needing a consistent space where they feel
            grounded and supported.
          </p>

          <h2 className={styles.subhead}>Our approach</h2>
          <p>
            Staff and mentors use trauma-informed, youth-centered practices so
            young people feel seen, supported, and challenged in healthy ways —
            building self-awareness, discipline, communication, and belonging.
          </p>
        </div>

        <div className={styles.cta}>
          <Link href="/smartbox">
            <Button type="button">Smartbox program</Button>
          </Link>
          <Link href="/programs">
            <Button type="button" variant="secondary">
              All programs
            </Button>
          </Link>
          <a
            href="https://www.redowlboxing.com/pages/about-red-owl-boxing"
            target="_blank"
            rel="noreferrer"
          >
            <Button type="button" variant="ghost">
              Red Owl story
            </Button>
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
