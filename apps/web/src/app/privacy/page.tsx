import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { formatAddress } from "@/lib/gym-info";
import styles from "../legal.module.css";

const brand = getBrand();

export const metadata: Metadata = {
  title: `Privacy · ${brand.gym.name}`,
  description: `What ${brand.gym.name} keeps about members, and why.`,
};

export default function PrivacyPage() {
  const { gym } = brand;
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Your details</p>
        <h1 className={styles.title}>Privacy</h1>
        <p className={styles.lead}>
          {gym.legalName} keeps the details it needs to run membership,
          waivers, and check-in at {gym.name}. Last updated 4 November 2026.
        </p>
        <div className={styles.body}>
          <h2>What we keep</h2>
          <p>
            Name, email, phone if you give one, membership plan, waiver
            signature, attendance, and the photo a coach or the desk adds.
            Check-in stores the time you arrived. Payment status comes back
            from the card processor. Full card numbers stay with that
            processor, not in the gym database.
          </p>
          <h2>Why</h2>
          <p>
            To know who is on the floor, who has signed a waiver, which class
            was booked, and whether a membership is current. Coaches see the
            roster for the class they are running. The desk sees check-in. The
            owner sees the gym books.
          </p>
          <h2>Who else sees it</h2>
          <p>
            A first name can show on the gym TVs at check-in. We do not sell
            member lists. Hosting and email providers process data only so the
            site and the messages work. A processor handles the card payment.
          </p>
          <h2>How long</h2>
          <p>
            Membership and waiver records stay while you train here and for the
            period the gym needs them for safety and its books. Ask the desk
            to correct a name or close an account you no longer use.
          </p>
          <h2>Ask</h2>
          <p>
            Write <a href={`mailto:${gym.email}`}>{gym.email}</a> or come to{" "}
            {formatAddress()}. The{" "}
            <Link href="/terms">terms</Link> sit beside this notice.
          </p>
        </div>
        <p className={styles.actions}>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Visit</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
