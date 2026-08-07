import Link from "next/link";
import styles from "./vision-sections.module.css";
import { PROGRAMS } from "@/lib/programs";

export function WhySection() {
  return (
    <section id="why" className={styles.why}>
      <div className={styles.whyInner}>
        <p className={styles.eyebrow}>Why</p>
        <h2 className={styles.title}>
          We don&apos;t lower standards — we raise people.
        </h2>
        <p className={styles.lead}>
          Couched between grassroots development and professional excellence, we
          believe strong people build strong communities — and the strongest
          communities are built one person at a time.
        </p>
        <blockquote className={styles.quote}>
          At Sully&apos;s we don&apos;t protect people from challenges. We prepare
          them to meet them. In a world that is rapidly changing, we build
          character before life demands it.
        </blockquote>
      </div>
    </section>
  );
}

const CASCADE = [
  "Someone believes in you.",
  "You begin to believe in yourself.",
  "You become responsible.",
  "You begin serving others.",
  "You become a leader.",
  "You become a steward.",
  "You help someone else begin.",
  "The cascade continues.",
] as const;

export function CascadeSection() {
  return (
    <section id="cascade" className={styles.cascade}>
      <div className={styles.cascadeInner}>
        <div className={styles.cascadeIntro}>
          <p className={styles.eyebrow}>How</p>
          <h2 className={styles.title}>The Sully Cascade</h2>
          <p className={styles.copy}>
            Boxing is the vehicle — the entry point into lives. Programs are
            vehicles. People are the purpose. Every number has a name. Every name
            has a story. Everyone deserves to be seen before they are expected to
            succeed.
          </p>
        </div>
        <ol className={styles.cascadeList}>
          {CASCADE.map((step, i) => (
            <li key={step} className={styles.cascadeStep}>
              <span className={styles.cascadeNum}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ProgramsSection() {
  return (
    <section id="programs" className={styles.programs}>
      <div className={styles.programsInner}>
        <p className={styles.eyebrow}>Programs</p>
        <h2 className={styles.title}>Vehicles for the work</h2>
        <p className={styles.copy}>
          In a community where safe, structured after-school spaces are limited,
          Sully&apos;s offers a consistent, stabilizing environment that keeps
          young people engaged, supported, and on a positive path.
        </p>
        <ul className={styles.programList}>
          {PROGRAMS.map((p) => (
            <li key={p.slug} className={styles.programRow}>
              <h3 className={styles.programName}>
                <Link href={`/programs/${p.slug}`}>{p.name}</Link>
              </h3>
              <p className={styles.programDetail}>{p.short}</p>
            </li>
          ))}
        </ul>
        <p className={styles.standards}>
          Standards without grace becomes judgement. Grace without standards
          becomes complacency. When they exist together, people grow.
        </p>
        <p className={styles.copy}>
          <Link href="/programs">Explore all programs →</Link>
        </p>
      </div>
    </section>
  );
}
