import Link from "next/link";
import Image from "next/image";
import { GYM, formatAddress } from "@/lib/gym-info";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.mark}>Sully&apos;s Boxing Gym · EST 1943</p>
        <p className={styles.note}>
          Boxing is the engine. People are the purpose. Character is the legacy.
        </p>

        <div className={styles.meta}>
          <p className={styles.note}>
            <a href={GYM.mapUrl} target="_blank" rel="noreferrer">
              {formatAddress(" · ")}
            </a>
          </p>
          <p className={styles.note}>{GYM.hoursSummary}</p>
          <p className={styles.note}>
            <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a>
            {" · "}
            <a href={`mailto:${GYM.email}`}>{GYM.email}</a>
          </p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          <Link href="/contact">Visit</Link>
          <Link href="/programs">Programs</Link>
          <Link href="/coaches">Coaches</Link>
          <Link href="/legacy">Legacy</Link>
          <Link href="/store">Store</Link>
          <Link href="/donate">Donate</Link>
          <Link href="/tv/demo">TV Demo</Link>
          <Link href="/manuals">Manuals</Link>
          <Link href="/join">Join</Link>
          <a href={GYM.website} target="_blank" rel="noreferrer">
            sullysboxinggym.com
          </a>
        </nav>

        <div className={styles.partners}>
          <a
            className={styles.partnerLink}
            href="https://boxingontario.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Boxing Ontario — visit boxingontario.com"
          >
            <Image
              src="/partners/boxing-ontario.png"
              alt="Boxing Ontario"
              width={220}
              height={146}
              className={styles.partnerLogo}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
