import Link from "next/link";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GYM, formatAddress } from "@/lib/gym-info";
import { DonateForm } from "./donate-form";
import styles from "./donate.module.css";

export const metadata = {
  title: "Donate · Sully's Boxing Gym",
  description:
    "Support Sully's Recreation & Athletic Centre — a non-profit keeping Toronto youth training, focused, and off the street.",
};

export default function DonatePage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Give</p>
          <h1 className={styles.title}>Keep the doors open</h1>
          <p className={styles.lead}>
            {GYM.legalName} is a non-profit. Your gift funds youth who train
            free — discipline, self-worth, and a safe place to grow.
          </p>
        </div>

        <section className={styles.section} aria-labelledby="mission">
          <h2 id="mission" className={styles.subhead}>
            The mission
          </h2>
          <p className={styles.copy}>
            Sully&apos;s has been a gathering place for at-risk youth in Toronto
            for generations. Whether they wanted to learn to box or needed a
            safe place to land, the club opened its doors at no cost to them. We
            still do — channeling energy into constructive work instead of the
            street.
          </p>
        </section>

        <section className={styles.ways} aria-labelledby="ways">
          <h2 id="ways" className={styles.subhead}>
            Ways to give
          </h2>

          <DonateForm />

          <div className={styles.way}>
            <h3 className={styles.wayLabel}>Call or email</h3>
            <p className={styles.copy}>
              Prefer to talk it through? We&apos;ll help you give by phone.
            </p>
            <div className={styles.actions}>
              <a href={`tel:${GYM.phoneTel}`}>
                <Button type="button">Call {GYM.phoneDisplay}</Button>
              </a>
              <a href={`mailto:${GYM.email}?subject=Donation%20to%20Sully's`}>
                <Button type="button" variant="secondary">
                  Email {GYM.email}
                </Button>
              </a>
            </div>
          </div>

          <div className={styles.way}>
            <h3 className={styles.wayLabel}>Cheque by mail</h3>
            <p className={styles.copy}>
              Payable to <strong>{GYM.legalName}</strong>
            </p>
            <p className={styles.address}>
              {GYM.legalName}
              <br />
              {formatAddress("\n")}
            </p>
          </div>

          <div className={styles.way}>
            <h3 className={styles.wayLabel}>In person</h3>
            <p className={styles.copy}>
              Come down the stairs at {GYM.addressLine1}. Desk staff can take
              your gift and issue a receipt path with the board.
            </p>
            <Link href="/contact" className={styles.link}>
              Hours &amp; map
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.copy}>
            Prefer merch that funds the mission?{" "}
            <Link href="/store" className={styles.link}>
              Visit the store
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
