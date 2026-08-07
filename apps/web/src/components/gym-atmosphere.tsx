import Image from "next/image";
import Link from "next/link";
import { GYM } from "@/lib/gym-info";
import styles from "./gym-atmosphere.module.css";

const SHOTS = [
  {
    src: "/gym/heavy-bag.jpg",
    alt: "Training on the heavy bag at Sully's Boxing Gym",
  },
  {
    src: "/gym/legacy-wall.jpg",
    alt: "Historical boxing photos on the wall at Sully's",
  },
  {
    src: "/gym/ring-rest.jpg",
    alt: "Athletes resting ringside at Sully's Boxing Gym",
  },
] as const;

export function GymAtmosphere() {
  return (
    <section className={styles.section} aria-label="Inside the gym">
      <div className={styles.rail}>
        {SHOTS.map((shot) => (
          <figure key={shot.src} className={styles.frame}>
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(max-width: 768px) 85vw, 40vw"
              className={styles.img}
            />
          </figure>
        ))}
      </div>
      <div className={styles.caption}>
        <p className={styles.line}>{GYM.hoursSummary}</p>
        <p className={styles.line}>
          <Link href="/contact">{GYM.addressLine1}</Link>
          {" · "}
          <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a>
        </p>
      </div>
    </section>
  );
}
