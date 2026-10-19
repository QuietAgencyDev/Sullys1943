import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { GYM, formatAddress } from "@/lib/gym-info";
import styles from "./contact.module.css";

const brand = getBrand();

export const metadata = {
  title:
    brand.id === "red-owl"
      ? "Visit Red Owl Scarborough · REDOWL2021"
      : "Visit · Sully's Boxing Gym",
  description:
    brand.id === "red-owl"
      ? "Hours, address, map, and contact details for Red Owl Boxing Scarborough at 2206 Eglinton Ave E, Unit 120."
      : "Hours, address, and contact for Sully's Boxing Gym — Canada's oldest boxing club at 1554 Dundas St W, Toronto.",
};

export default function ContactPage() {
  const embedSrc = `https://maps.google.com/maps?q=${GYM.mapEmbedQuery}&z=15&output=embed`;

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Visit</p>
          <h1 className={styles.title}>
            {brand.id === "red-owl"
              ? "Visit Red Owl Scarborough"
              : "Come down the stairs"}
          </h1>
          <p className={styles.lead}>
            {brand.id === "red-owl" ? (
              <>
                2206 Eglinton Ave E, Unit 120, Scarborough. Same building as
                Mandarin — use the west side entrance.
              </>
            ) : (
              <>
                Lower level at Dundas &amp; Sheridan. Ring, bags, and
                eighty-plus years of Toronto boxing history.
              </>
            )}
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
            {GYM.phoneAltDisplay || GYM.emailOwner !== GYM.email ? (
              <p className={styles.muted}>
                Owner line:{" "}
                {GYM.phoneAltDisplay ? (
                  <>
                    <a href={`tel:${GYM.phoneAltTel}`}>
                      {GYM.phoneAltDisplay}
                    </a>
                    {" · "}
                  </>
                ) : null}
                <a href={`mailto:${GYM.emailOwner}`}>{GYM.emailOwner}</a>
              </p>
            ) : null}
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
          <Link
            href={brand.id === "red-owl" ? "/trial" : "/join"}
            className={styles.ctaPrimary}
          >
            {brand.id === "red-owl" ? "Start 3-day trial" : "Join Now"}
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
