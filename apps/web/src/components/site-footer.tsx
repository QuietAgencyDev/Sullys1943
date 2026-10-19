import Link from "next/link";
import Image from "next/image";
import { getBrand } from "@/lib/brand";
import { formatAddress } from "@/lib/gym-info";
import styles from "./site-footer.module.css";

const BOXING_ONTARIO_URL = "https://boxingon.ca";
const BOXING_CANADA_URL = "https://boxingcanada.org";
const EARLS_FIGHT_SHOP_URL = "https://www.earlsfightshop.com";
const QUIET_AGENCY_URL =
  process.env.NEXT_PUBLIC_QUIET_AGENCY_URL ?? "https://quietagency.co";

export function SiteFooter() {
  const brand = getBrand();
  const { gym } = brand;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.mark}>
          {gym.name}
          {gym.partnerLine ? ` · ${gym.partnerLine}` : ""}
        </p>
        <p className={styles.note}>{brand.copy.footerBlurb}</p>

        <div className={styles.meta}>
          <p className={styles.address}>
            <a href={gym.mapUrl} target="_blank" rel="noreferrer">
              {formatAddress(" · ")}
            </a>
          </p>
          {gym.addressHint ? (
            <p className={styles.note}>{gym.addressHint}</p>
          ) : null}
          <p className={styles.note}>{gym.hoursSummary}</p>
          <p className={styles.note}>
            <a href={`tel:${gym.phoneTel}`}>{gym.phoneDisplay}</a>
            {" · "}
            <a href={`mailto:${gym.email}`}>{gym.email}</a>
          </p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          {brand.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <a href={gym.website} target="_blank" rel="noreferrer">
            {gym.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </nav>

        {brand.showSullyPartners ? (
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
            {gym.boxrecUrl ? (
              <a
                className={`${styles.glowLink} ${styles.boxrecGlow}`}
                href={gym.boxrecUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${gym.name} on BoxRec`}
              >
                <Image
                  src="/partners/boxrec.png"
                  alt="BoxRec"
                  width={140}
                  height={48}
                  className={styles.glowLogo}
                />
              </a>
            ) : null}
            <a
              className={`${styles.glowLink} ${styles.earlsGlow}`}
              href={EARLS_FIGHT_SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Earl's Fight Shop — visit earlsfightshop.com"
            >
              <Image
                src="/partners/earls-fight-shop.png"
                alt="Earl's Fight Shop"
                width={140}
                height={140}
                className={styles.glowLogo}
              />
            </a>
          </div>
        ) : (
          <div className={styles.partners}>
            {gym.smartboxUrl ? (
              <a
                className={styles.partnerLink}
                href={gym.smartboxUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Scarborough Smartbox
              </a>
            ) : null}
            {gym.membersUrl ? (
              <a
                className={styles.partnerLink}
                href={gym.membersUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Scarborough members
              </a>
            ) : null}
          </div>
        )}

        <div className={styles.creditRow}>
          <p className={styles.credit}>
            {brand.id === "red-owl" ? (
              <>
                Red Owl / Scarborough Smartbox site — platform by{" "}
                <a
                  href={QUIET_AGENCY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quiet Agency
                </a>
              </>
            ) : (
              <>
                System &amp; web developed by{" "}
                <a
                  href={QUIET_AGENCY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quiet Agency
                </a>
              </>
            )}
          </p>
          <nav className={styles.opsIcons} aria-label="Internal tools">
            <Link href="/tv/demo" className={styles.opsIcon} title="TV">
              <span aria-hidden>📺</span>
              <span className={styles.srOnly}>TV</span>
            </Link>
            {brand.id !== "red-owl" ? (
              <Link href="/manuals" className={styles.opsIcon} title="Manuals">
                <span aria-hidden>📖</span>
                <span className={styles.srOnly}>Manuals</span>
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </footer>
  );
}
