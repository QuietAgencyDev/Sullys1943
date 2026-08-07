import Link from "next/link";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PROGRAMS } from "@/lib/programs";
import styles from "./programs.module.css";

export const metadata = {
  title: "Programs | Sully's Boxing Gym",
  description:
    "Boxing fundamentals, academic support, mentorship, lifeskills, wellness, and the business of boxing — vehicles for character and community.",
};

export default function ProgramsPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Programs are vehicles</p>
        <h1 className={styles.title}>People are the purpose</h1>
        <p className={styles.copy}>
          Boxing gets people through the door. These programs prepare them for
          life outside it — strong people, one person at a time.
        </p>
        <p className={styles.manifesto}>
          We don&apos;t lower standards — we raise people.
        </p>

        <ul className={styles.grid}>
          {PROGRAMS.map((p) => (
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
          <Link href="/join">
            <Button type="button">Join Sully&apos;s</Button>
          </Link>
          <Link href="/coaches">
            <Button type="button" variant="secondary">
              Meet the coaches
            </Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
