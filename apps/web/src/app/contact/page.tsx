import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GYM, formatAddress } from "@/lib/gym-info";
import styles from "./contact.module.css";

export const metadata = {
  title: "Visit · Sully's Boxing Gym",
  description:
    "Hours, address, and contact for Sully's Boxing Gym — Canada's oldest boxing club at 1554 Dundas St W, Toronto.",
};

export default function ContactPage() {
  const embedSrc = `https://maps.google.com/maps?q=${GYM.mapEmbedQuery}&z=15&output=embed`;

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Visit</p>
          <h1 className={styles.title}>Come down the stairs</h1>
          <p className={styles.lead}>
            Lower level at Dundas &amp; Sheridan. Ring, bags, and seventy-five
            years of Toronto boxing history.
          </p>
        </div>

        <section className={styles.grid} aria-label="Location details">
          <div className={styles.block}>
            <h2 className={styles.label}>Address</h2>
            <p className={styles.value}>{GYM.addressLine1}</p>
            <p className={styles.value}>{GYM.addressLine2}</p>
            <a
              className={styles.link}
              href={GYM.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>

          <div className={styles.block}>
            <h2 className={styles.label}>Hours</h2>
            <ul className={styles.hours}>
              {GYM.hours.map((row) => (
                <li key={row.days}>
                  <span>{row.days}</span>
                  <span>
                    {row.close ? `${row.open} – ${row.close}` : row.open}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.block}>
            <h2 className={styles.label}>Contact</h2>
            <p className={styles.value}>
              <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a>
            </p>
            <p className={styles.value}>
              <a href={`mailto:${GYM.email}`}>{GYM.email}</a>
            </p>
            <p className={styles.muted}>
              Owner line:{" "}
              <a href={`tel:${GYM.phoneAltTel}`}>{GYM.phoneAltDisplay}</a>
              {" · "}
              <a href={`mailto:${GYM.emailOwner}`}>{GYM.emailOwner}</a>
            </p>
          </div>
        </section>

        <div className={styles.mapWrap}>
          <iframe
            title={`Map — ${formatAddress()}`}
            src={embedSrc}
            className={styles.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className={styles.cta}>
          <Link href="/join" className={styles.ctaPrimary}>
            Join Now
          </Link>
          <Link href="/programs" className={styles.ctaSecondary}>
            View programs
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
