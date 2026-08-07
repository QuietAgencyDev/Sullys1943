import Image from "next/image";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { GYM } from "@/lib/gym-info";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Sully's Boxing Gym">
      <div className={styles.media} aria-hidden>
        <Image
          src="/gym/hero-floor.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.photo}
        />
        <div className={styles.mediaWash} />
        <div className={styles.mediaGrain} />
      </div>

      <div className={styles.content}>
        <Image
          src="/brand/sullys-logo-primary.png"
          alt="Sully's Boxing Gym — EST 1943"
          width={220}
          height={280}
          priority
          className={styles.badge}
        />

        <p className={styles.eyebrow}>{GYM.tagline}</p>

        <h1 className={styles.manifesto}>
          <span>Boxing is the engine</span>
          <span>People are the purpose</span>
          <span>Character is the legacy</span>
        </h1>

        <p className={styles.lead}>
          We build character before life demands it — discipline, respect, and
          leadership through the craft of boxing.
        </p>

        <div className={styles.actions}>
          <Link href="/join">
            <Button variant="primary">Join Now</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary">Visit the gym</Button>
          </Link>
          <Link href="/legacy">
            <Button variant="ghost">Legacy Wall</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
