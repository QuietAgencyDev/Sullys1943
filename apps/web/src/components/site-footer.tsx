import Link from "next/link";
import Image from "next/image";
import { GYM, formatAddress } from "@/lib/gym-info";
import styles from "./site-footer.module.css";

const BOXING_ONTARIO_URL = "https://boxingon.ca";
const QUIET_AGENCY_URL =
  process.env.NEXT_PUBLIC_QUIET_AGENCY_URL ?? "https://quietagency.co";

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
          <Link href="/join">Join</Link>
          <a href={GYM.website} target="_blank" rel="noreferrer">
            sullysboxinggym.com
          </a>
        </nav>

        <div className={styles.partners}>
          <a
            className={styles.partnerLink}
            href={BOXING_ONTARIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Boxing Ontario — visit boxingon.ca"
          >
            <Image
              src="/partners/boxing-ontario.png"
              alt="Boxing Ontario"
              width={140}
              height={93}
              className={styles.partnerLogo}
            />
          </a>
        </div>

        <div className={styles.creditRow}>
          <p className={styles.credit}>
            System &amp; web developed by{" "}
            <a
              href={QUIET_AGENCY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Quiet Agency
            </a>
          </p>
          <nav className={styles.opsIcons} aria-label="Internal tools">
            <Link href="/tv/demo" className={styles.opsIcon} title="TV">
              <span aria-hidden>📺</span>
              <span className={styles.srOnly}>TV</span>
            </Link>
            <Link href="/manuals" className={styles.opsIcon} title="Manuals">
              <span aria-hidden>📖</span>
              <span className={styles.srOnly}>Manuals</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
