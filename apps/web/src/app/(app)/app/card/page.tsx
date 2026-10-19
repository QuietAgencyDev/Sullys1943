"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import QRCode from "qrcode";
import { Alert, Badge, Button, Card, Skeleton } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../ui.module.css";
import cardStyles from "./card.module.css";

type MembershipCard = {
  name?: string;
  plan?: string;
  status?: string;
  location?: string;
  waiverStatus?: string;
};

type PassportLite = {
  progression: { rank: string; level: number; xp: number };
};

type CheckInToken = {
  token: string;
  expiresInSeconds: number;
  expiresAt: string;
};

export default function CardPage() {
  const [card, setCard] = useState<MembershipCard | null>(null);
  const [passport, setPassport] = useState<PassportLite | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<{
    tone: "success" | "danger";
    text: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const refreshingRef = useRef(false);

  const refreshToken = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8_000);
    try {
      const tokenRes = await get<CheckInToken>("/api/v1/check-in/token", {
        signal: controller.signal,
      });
      setToken(tokenRes.token);
      setExpiresAt(new Date(tokenRes.expiresAt).getTime());
      setTokenError(null);
      const url = await QRCode.toDataURL(tokenRes.token, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 280,
        color: { dark: "#140f0c", light: "#f3e6c8" },
      });
      setQrDataUrl(url);
    } catch (err) {
      setToken(null);
      setQrDataUrl(null);
      setExpiresAt(null);
      setTokenError(
        err instanceof ApiError
          ? err.message
          : err instanceof DOMException && err.name === "AbortError"
            ? "The secure QR service took too long to respond."
            : "Could not issue check-in QR",
      );
    } finally {
      window.clearTimeout(timeoutId);
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);
    (async () => {
      try {
        const [cardRes, passportRes] = await Promise.all([
          get<MembershipCard>("/api/v1/membership-card", {
            signal: controller.signal,
          }).catch(() => null),
          get<PassportLite>("/api/v1/passport/me", {
            signal: controller.signal,
          }).catch(() => null),
        ]);
        if (!active) return;
        setCard(cardRes);
        setPassport(passportRes);
        if (
          cardRes?.status === "active" &&
          cardRes.waiverStatus === "signed"
        ) {
          await refreshToken();
        } else {
          setTokenError(
            cardRes?.waiverStatus !== "signed"
              ? "Sign your waiver to unlock the rotating QR."
              : "Activate your membership to unlock check-in.",
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [refreshToken]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) void refreshToken();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [expiresAt, refreshToken]);

  async function doCheckIn() {
    setPending(true);
    setCheckInResult(null);
    try {
      const res = await post<{ xpAwarded?: number }>("/api/v1/check-in", {
        token: token ?? undefined,
      });
      setCheckInResult({
        tone: "success",
        text: `Checked in · +${res.xpAwarded ?? 10} XP`,
      });
      await refreshToken();
    } catch (err) {
      setCheckInResult({
        tone: "danger",
        text: err instanceof ApiError ? err.message : "Check-in failed",
      });
    } finally {
      setPending(false);
    }
  }

  const name = card?.name ?? "Member";
  const plan = card?.plan ?? "Membership";
  const status = card?.status ?? "unknown";
  const waiverOk = card?.waiverStatus === "signed";
  const membershipOk = status === "active";
  const scanReady = membershipOk && waiverOk && Boolean(qrDataUrl && token);
  const qrProgress = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Gym entry</p>
        <h1 className={styles.title}>Your Corner Card</h1>
        <p className={styles.lead}>
          Open. Hold steady. Hear the confirmation. The code refreshes
          automatically.
        </p>
      </div>

      {loading ? (
        <Card aria-label="Loading membership card">
          <Skeleton width="38%" height="0.8rem" />
          <Skeleton width="72%" height="2.5rem" />
          <Skeleton width="min(100%, 280px)" height="280px" />
        </Card>
      ) : (
        <>
          <section className={cardStyles.face} aria-label="Membership card">
            <div className={cardStyles.cardHeader}>
              <div className={cardStyles.identity}>
                <Image
                  src="/brand/sullys-logo-primary.png"
                  alt=""
                  width={72}
                  height={72}
                  className={cardStyles.logo}
                />
                <div>
                  <p className={styles.eyebrow}>Sully&apos;s Boxing Gym</p>
                  <h2 className={cardStyles.name}>{name}</h2>
                </div>
              </div>
              <Badge tone={scanReady ? "success" : "warning"}>
                {scanReady ? "Scan ready" : "Action needed"}
              </Badge>
            </div>

            <div className={cardStyles.memberMeta}>
              <div>
                <span>Membership</span>
                <strong>{plan}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{card?.location ?? "Sully’s Boxing Gym"}</strong>
              </div>
              {passport ? (
                <div>
                  <span>Passport</span>
                  <strong>
                    {passport.progression.rank} · Level{" "}
                    {passport.progression.level}
                  </strong>
                </div>
              ) : null}
            </div>

            <div className={cardStyles.chips}>
              <Badge tone={membershipOk ? "success" : "danger"}>
                {membershipOk ? "Membership active" : "Membership inactive"}
              </Badge>
              <Badge tone={waiverOk ? "success" : "warning"}>
                {waiverOk ? "Waiver signed" : "Waiver needed"}
              </Badge>
            </div>

            <div className={cardStyles.qr}>
              {qrDataUrl && token ? (
                <>
                  <div
                    className={cardStyles.qrFrame}
                    style={
                      {
                        "--qr-progress": `${qrProgress}%`,
                      } as CSSProperties
                    }
                  >
                    <Image
                      src={qrDataUrl}
                      alt="Rotating check-in QR code"
                      width={240}
                      height={240}
                      unoptimized
                      className={cardStyles.qrImage}
                    />
                  </div>
                  <div className={cardStyles.scanStatus}>
                    <span className={cardStyles.liveDot} aria-hidden />
                    <div>
                      <strong>Ready for the desk scanner</strong>
                      <small>Secure code refreshes in {secondsLeft}s</small>
                    </div>
                  </div>
                  <div className={cardStyles.countdownTrack} aria-hidden>
                    <span style={{ width: `${qrProgress}%` }} />
                  </div>
                </>
              ) : (
                <div className={cardStyles.qrBlocked}>
                  <span aria-hidden>×</span>
                  <strong>QR locked</strong>
                  <p>{tokenError ?? "Check-in is not available right now."}</p>
                  {!waiverOk ? (
                    <Link href="/app/waiver">Sign waiver</Link>
                  ) : !membershipOk ? (
                    <Link href="/join">View membership plans</Link>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={refreshing}
                      onClick={() => void refreshToken()}
                    >
                      {refreshing ? "Refreshing…" : "Try again"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className={cardStyles.cardActions}>
              <Button
                type="button"
                variant="secondary"
                disabled={!membershipOk || !waiverOk || refreshing}
                onClick={() => void refreshToken()}
              >
                {refreshing ? "Refreshing…" : "Refresh secure QR"}
              </Button>
              {passport ? (
                <Link href="/app/passport">View boxing passport</Link>
              ) : null}
            </div>
          </section>

          <Card className={cardStyles.fallback}>
            <div>
              <p className={styles.eyebrow}>Scanner fallback</p>
              <h2 className={styles.sectionTitle}>Check in from this phone</h2>
              <p className={styles.muted}>
                Use only if the front-desk scanner is unavailable.
              </p>
            </div>
            <Button
              variant="secondary"
              disabled={pending || !membershipOk || !waiverOk}
              onClick={doCheckIn}
            >
              {pending ? "Checking in…" : "Check in now"}
            </Button>
          </Card>

          {checkInResult ? (
            <Alert
              title={
                checkInResult.tone === "success"
                  ? "You’re checked in"
                  : "Check-in needs attention"
              }
              tone={checkInResult.tone}
            >
              {checkInResult.text}
            </Alert>
          ) : null}
        </>
      )}
    </div>
  );
}
