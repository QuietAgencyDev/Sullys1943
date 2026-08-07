import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QUIET_AGENCY } from "@/lib/partners";
import styles from "../contact/contact.module.css";

export const metadata = {
  title: "Manuals · Sully's Boxing Gym",
  description: "Owner/staff and member/family PDF instruction manuals.",
};

export default function ManualsPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Guides</p>
          <h1 className={styles.title}>Instruction manuals</h1>
          <p className={styles.lead}>
            Download PDF guides for members/families and for owners &amp; staff
            running the desk, TV boards, and admin tools.
          </p>
        </div>

        <section className={styles.grid} aria-label="PDF downloads">
          <div className={styles.block}>
            <h2 className={styles.label}>Members &amp; families</h2>
            <p className={styles.value}>Join, waiver, QR check-in, booking, billing, family</p>
            <a
              className={styles.link}
              href="/docs/Sullys-Member-Family-User-Guide.pdf"
              download
            >
              Download PDF
            </a>
          </div>
          <div className={styles.block}>
            <h2 className={styles.label}>Owners &amp; staff</h2>
            <p className={styles.value}>
              Desk scanner, roster, kitchen, owner brief, admin, TV screens
            </p>
            <a
              className={styles.link}
              href="/docs/Sullys-Owner-Staff-Operations-Manual.pdf"
              download
            >
              Download PDF
            </a>
          </div>
          <div className={styles.block}>
            <h2 className={styles.label}>Built by</h2>
            <p className={styles.value}>
              <a href={QUIET_AGENCY.url} target="_blank" rel="noreferrer">
                {QUIET_AGENCY.name}
              </a>
            </p>
            <p className={styles.muted}>{QUIET_AGENCY.blurb}</p>
          </div>
        </section>

        <div className={styles.cta}>
          <Link href="/tv/demo" className={styles.ctaSecondary}>
            Second-screen demo kit
          </Link>
          <Link href="/contact" className={styles.ctaPrimary}>
            Visit / contact
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
