import Link from "next/link";
import Image from "next/image";
import { GYM, formatAddress } from "@/lib/gym-info";
import styles from "./site-footer.module.css";

const BOXING_ONTARIO_URL = "https://boxingon.ca";
const BOXING_CANADA_URL = "https://boxingcanada.org";
const QUIET_AGENCY_URL =
  process.env.NEXT_PUBLIC_QUIET_AGENCY_URL ?? "https://quietagency.co";

const NAV = [
  { href: "/legacy", label: "Legacy" },
  { href: "/coaches", label: "Coaches" },
  { href: "/classes", label: "Classes" },
  { href: "/programs", label: "Programs" },
  { href: "/donate", label: "Donate" },
  { href: "/store", label: "Store" },
  { href: "/contact", label: "Visit" },
  { href: "/join", label: "Join" },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.mark}>Sully&apos;s Boxing Gym · EST 1943</p>
        <p className={styles.note}>
          Boxing is the engine. People are the purpose. Character is the legacy.
        </p>

        <div className={styles.meta}>
          <p className={styles.address}>
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
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
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
          <a
            className={styles.partnerLink}
            href={BOXING_CANADA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Boxing Canada — visit boxingcanada.org"
          >
            <Image
              src="/partners/boxing-canada.png"
              alt="Boxing Canada"
              width={140}
              height={93}
              className={styles.partnerLogo}
            />
          </a>
          <a
            className={styles.boxrecLink}
            href={GYM.boxrecUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sully's Boxing Gym on BoxRec"
          >
            <Image
              src="/partners/boxrec.png"
              alt="BoxRec"
              width={140}
              height={48}
              className={styles.boxrecLogo}
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
