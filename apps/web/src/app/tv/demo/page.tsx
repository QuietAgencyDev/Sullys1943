import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBrand } from "@/lib/brand";
import { QUIET_AGENCY } from "@/lib/partners";
import styles from "./demo.module.css";

const brand = getBrand();

export const metadata = {
  title: `Second-screen demo kit · ${brand.copy.appName}`,
  description:
    "Open Floor TV and Reception TV on a spare monitor, Fire TV, or Chromecast.",
};

export default function TvDemoKitPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>Demo kit</p>
        <h1 className={styles.title}>Second screen in 60 seconds</h1>
        <p className={styles.lead}>
          Floor energy, {brand.copy.appName} brand — live class countdown,
          check-ins, leaderboard, and reception welcome ticker. Built for a
          spare monitor or living-room cast while you walk people through the
          platform.
        </p>

        <div className={styles.cards}>
          <Link href="/tv/floor" className={styles.card} target="_blank">
            <Image
              src={brand.assets.logoPrimary}
              alt=""
              width={64}
              height={80}
              className={styles.cardLogo}
            />
            <h2>Floor TV</h2>
            <p>
              Round timer (3:00 work / 1:00 rest), class sync, XP board, welcome
              ticker.
            </p>
            <span className={styles.cta}>Open fullscreen →</span>
          </Link>
          <Link href="/tv/popups" className={styles.card} target="_blank">
            <Image
              src={brand.assets.logoPrimary}
              alt=""
              width={64}
              height={80}
              className={styles.cardLogo}
            />
            <h2>Popup &amp; icon board</h2>
            <p>
              Every Floor TV icon and celebration popup in one place — swap
              files in /tv/icons then refresh.
            </p>
            <span className={styles.cta}>Review all popups →</span>
          </Link>
          <Link
            href="/tv/floor?demo=celebrate"
            className={styles.card}
            target="_blank"
          >
            <Image
              src={brand.assets.logoPrimary}
              alt=""
              width={64}
              height={80}
              className={styles.cardLogo}
            />
            <h2>Celebration demo</h2>
            <p>
              Cycles achievement, teams, challenge, and class-complete with Rive
              / CSS atmosphere — no live class required.
            </p>
            <span className={styles.cta}>Preview celebrations →</span>
          </Link>
          <Link href="/tv/reception" className={styles.card} target="_blank">
            <Image
              src={brand.assets.logoPrimary}
              alt=""
              width={64}
              height={80}
              className={styles.cardLogo}
            />
            <h2>Reception TV</h2>
            <p>Today&apos;s schedule, spots open, check-in welcome strip.</p>
            <span className={styles.cta}>Open lobby board →</span>
          </Link>
        </div>

        <section className={styles.steps}>
          <h2 className={styles.sectionTitle}>Setup</h2>
          <ol>
            <li>Plug in a second monitor, Fire TV, Chromecast, or tablet.</li>
            <li>
              Open <strong>Floor TV</strong> (or Reception) on that screen.
            </li>
            <li>
              Press <kbd>F</kbd> for fullscreen. Hide the cursor if casting.
            </li>
            <li>
              On your laptop, keep the marketing site,{" "}
              <Link href="/join">/join</Link>, or staff desk ready to demo.
            </li>
            <li>
              Trigger a check-in from{" "}
              <code>{brand.copy.demoMemberEmail}</code> — watch the ticker
              update within ~15s.
            </li>
          </ol>
        </section>

        <section className={styles.steps}>
          <h2 className={styles.sectionTitle}>URLs to bookmark</h2>
          <ul className={styles.urls}>
            <li>
              <code>/tv/floor</code>
            </li>
            <li>
              <code>/tv/reception</code>
            </li>
            <li>
              <code>/tv/popups</code>
            </li>
            <li>
              <code>/tv/floor?demo=celebrate</code>
            </li>
            <li>
              <code>/tv/floor?popup=achievement</code>
            </li>
          </ul>
        </section>

        <p className={styles.credit}>
          Second-screen kit by{" "}
          <a href={QUIET_AGENCY.url} target="_blank" rel="noreferrer">
            {QUIET_AGENCY.name}
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
