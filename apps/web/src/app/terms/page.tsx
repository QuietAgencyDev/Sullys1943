import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { formatAddress } from "@/lib/gym-info";
import styles from "../legal.module.css";

const brand = getBrand();

export const metadata: Metadata = {
  title: `Terms · ${brand.gym.name}`,
  description: `Terms for the ${brand.gym.name} website, member app, and check-in.`,
};

export default function TermsPage() {
  const { gym } = brand;
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>House rules</p>
        <h1 className={styles.title}>Terms</h1>
        <p className={styles.lead}>
          These terms cover the {gym.name} website, the member app, and desk
          check-in. Last updated 4 November 2026.
        </p>
        <div className={styles.body}>
          <h2>The gym</h2>
          <p>
            {gym.legalName} runs {gym.name} at {formatAddress()}. Questions go
            to <a href={`mailto:${gym.email}`}>{gym.email}</a> or{" "}
            <a href={`tel:${gym.phoneTel}`}>{gym.phoneDisplay}</a>.
          </p>
          <h2>Accounts</h2>
          <p>
            You sign up with a real name and an email you can open. Keep the
            password to yourself. The gym can turn an account off if it is
            misused, if fees are unpaid, or if a person is no longer a member.
          </p>
          <h2>Check-in and the card</h2>
          <p>
            The QR on your boxing card is how the desk signs you in. Do not
            share it. A parent or guardian signs the waiver for a younger
            member. Training still follows the gym&apos;s floor rules and the
            liability waiver you sign before you train.
          </p>
          <h2>Membership and payments</h2>
          <p>
            Plans, trials, and donations are billed by the processor shown at
            checkout. A receipt is the record of payment. The gym does not
            store full card numbers on this site.
          </p>
          <h2>The floor screens</h2>
          <p>
            Names can appear on the gym TVs when you check in or when a coach
            runs a class. That is part of training here. Ask the desk if a name
            should stay off the screen.
          </p>
          <h2>Use of the site</h2>
          <p>
            Use the site and the app for membership, booking, waivers, and
            check-in. Do not probe, scrape, or break the service. The gym can
            change class times, coaches, and these terms. The date at the top
            is the copy in force.
          </p>
        </div>
        <p className={styles.actions}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Visit</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
