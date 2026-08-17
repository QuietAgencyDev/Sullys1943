import Link from "next/link";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { getPrograms } from "@/lib/programs";
import styles from "./programs.module.css";

const brand = getBrand();
const isRedOwl = brand.id === "red-owl";

export const metadata = {
  title: isRedOwl
    ? "Programs | Red Owl Boxing & Smartbox"
    : "Programs | Sully's Boxing Gym",
  description: isRedOwl
    ? "Scarborough Smartbox pillars and Red Owl gym programs — boxing, mentorship, academics, counselling, nutrition, and open gym."
    : "Boxing fundamentals, academic support, mentorship, lifeskills, wellness, and the business of boxing — vehicles for character and community.",
};

export default function ProgramsPage() {
  const programs = getPrograms();

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>
          {isRedOwl ? "Programs" : "Programs are vehicles"}
        </p>
        <h1 className={styles.title}>
          {isRedOwl ? "Strength. Structure. Support." : "People are the purpose"}
        </h1>
        <p className={styles.copy}>
          {isRedOwl
            ? "Scarborough Smartbox youth pathways and Red Owl gym training — after-school cohorts, boxing classes, and open gym at Eglinton Ave E."
            : "Boxing gets people through the door. These programs prepare them for life outside it — strong people, one person at a time."}
        </p>
        {isRedOwl ? (
          <p className={styles.manifesto}>
            Powered by Red Owl Boxing · Partnered with Scarberian Boxing Club
          </p>
        ) : (
          <p className={styles.manifesto}>
            We don&apos;t lower standards — we raise people.
          </p>
        )}

        <ul className={styles.grid}>
          {programs.map((p) => (
            <li key={p.slug} className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Link href={`/programs/${p.slug}`}>{p.name}</Link>
              </h2>
              <p className={styles.cardCopy}>{p.short}</p>
              <Link href={`/programs/${p.slug}`} className={styles.cardLink}>
                Learn more →
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          <Link href={isRedOwl ? "/smartbox" : "/join"}>
            <Button type="button">
              {isRedOwl ? "Smartbox intake" : "Join Sully's"}
            </Button>
          </Link>
          <Link href="/coaches">
            <Button type="button" variant="secondary">
              {isRedOwl ? "Meet the team" : "Meet the coaches"}
            </Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
