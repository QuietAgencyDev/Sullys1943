"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../ui.module.css";
import cardStyles from "./card.module.css";

type MembershipCard = {
  name?: string;
  plan?: string;
  status?: string;
  waiverStatus?: string;
};

type CheckInToken = {
  token: string;
  expiresInSeconds: number;
  expiresAt: string;
};

export default function CardPage() {
  const [card, setCard] = useState<MembershipCard | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const refreshToken = useCallback(async () => {
    try {
      const tokenRes = await get<CheckInToken>("/api/v1/check-in/token");
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
          : "Could not issue check-in QR",
      );
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cardRes = await get<MembershipCard>(
          "/api/v1/membership-card",
        ).catch(() => null);
        if (!active) return;
        setCard(cardRes);
        await refreshToken();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
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
    setCheckInMsg(null);
    try {
      const res = await post<{ xpAwarded?: number }>("/api/v1/check-in", {
        token: token ?? undefined,
      });
      setCheckInMsg(`Checked in · +${res.xpAwarded ?? 10} XP`);
      await refreshToken();
    } catch (err) {
      setCheckInMsg(
        err instanceof ApiError ? err.message : "Check-in failed",
      );
    } finally {
      setPending(false);
    }
  }

  const name = card?.name ?? "Member";
  const plan = card?.plan ?? "Membership";
  const status = card?.status ?? "unknown";
  const waiverOk = card?.waiverStatus === "signed";

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Check-in</p>
        <h1 className={styles.title}>Digital Card</h1>
        <p className={styles.lead}>
          Show this QR at the door scanner for walk-in check-in. It rotates every
          60 seconds.
        </p>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading membership card…</p>
      ) : (
        <section className={cardStyles.face} aria-label="Membership card">
          <h2 className={cardStyles.name}>{name}</h2>
          <p className={cardStyles.plan}>
            {plan} · {status}
          </p>
          <div className={cardStyles.chips}>
            <span className={styles.badge}>{status}</span>
            <span className={waiverOk ? styles.badgeOk : styles.badgeMuted}>
              {waiverOk ? "Waiver signed" : "Waiver needed"}
            </span>
          </div>

          <div className={cardStyles.qr}>
            {qrDataUrl && token ? (
              <>
                <Image
                  src={qrDataUrl}
                  alt="Check-in QR code"
                  width={220}
                  height={220}
                  unoptimized
                  className={cardStyles.qrImage}
                />
                <p className={cardStyles.qrLabel}>
                  Rotates in {secondsLeft}s · door scan ready
                </p>
                <p className={cardStyles.token}>{token}</p>
              </>
            ) : (
              <>
                <p className={cardStyles.qrLabel}>QR unavailable</p>
                <p className={styles.muted}>
                  {tokenError ?? "Sign your waiver to unlock check-in."}
                </p>
                {!waiverOk ? (
                  <Link href="/app/waiver" className={styles.link}>
                    Sign waiver to unlock QR
                  </Link>
                ) : null}
              </>
            )}
          </div>

          <div className={cardStyles.actions}>
            <Button
              variant="primary"
              disabled={!waiverOk}
              onClick={() => void refreshToken()}
            >
              Refresh QR
            </Button>
          </div>
          <p className={styles.muted}>
            Prefer the wall QR or door scanner. Fallback if needed:
          </p>
          <div className={cardStyles.actions}>
            <Button
              variant="secondary"
              disabled={pending || !waiverOk}
              onClick={doCheckIn}
            >
              {pending ? "Checking in…" : "Or check in here"}
            </Button>
          </div>
          {checkInMsg ? (
            <p className={styles.rowMeta}>{checkInMsg}</p>
          ) : null}
        </section>
      )}
    </div>
  );
}
