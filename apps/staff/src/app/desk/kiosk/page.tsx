"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ApiError, post } from "@/lib/api";
import styles from "./kiosk.module.css";

type Flash =
  | {
      kind: "ok" | "dup" | "err";
      title: string;
      detail?: string;
    }
  | null;

type ScanResult = {
  member?: { name: string };
  xpAwarded?: number;
  duplicate?: boolean;
  sessionTitle?: string;
};

export default function DeskKioskPage() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [flash, setFlash] = useState<Flash>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusScan = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    focusScan();
    const onVisibility = () => {
      if (document.visibilityState === "visible") focusScan();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    const id = setInterval(focusScan, 1500);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      clearInterval(id);
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, [focusScan]);

  const showFlash = useCallback((next: Flash) => {
    setFlash(next);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setFlash(null), 3500);
  }, []);

  const submitScan = useCallback(
    async (raw: string) => {
      const value = raw.trim();
      if (!value || busy) return;
      setBusy(true);
      setToken("");
      try {
        const res = await post<ScanResult>("/api/v1/check-in/scan", {
          token: value,
        });
        const name = res.member?.name ?? "Member";
        const session = res.sessionTitle ?? "Open gym";
        if (res.duplicate) {
          showFlash({
            kind: "dup",
            title: "Already checked in",
            detail: `${name} · ${session}`,
          });
        } else {
          showFlash({
            kind: "ok",
            title: name,
            detail: `You’re in · +${res.xpAwarded ?? 10} XP · ${session}`,
          });
        }
      } catch (err) {
        showFlash({
          kind: "err",
          title: "Check-in failed",
          detail:
            err instanceof ApiError ? err.message : "See desk / try again",
        });
      } finally {
        setBusy(false);
        focusScan();
      }
    },
    [busy, focusScan, showFlash],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submitScan(token);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void submitScan(token);
    }
  }

  return (
    <main className={styles.kiosk}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            src="/brand/sullys-logo-primary.png"
            alt=""
            width={84}
            height={84}
            className={styles.logo}
            priority
          />
          <div>
            <p className={styles.eyebrow}>SULLY&apos;S BOXING GYM</p>
            <p className={styles.brandSub}>Front door · EST 1943</p>
          </div>
        </div>
        <span
          className={`${styles.connection} ${
            online ? styles.connectionOnline : styles.connectionOffline
          }`}
        >
          {online ? "System online" : "Connection lost"}
        </span>
      </header>

      <section className={styles.welcome}>
        <p className={styles.eyebrow}>MEMBER CHECK-IN</p>
        <h1 className={styles.title}>Step Into Your Corner</h1>
        <p className={styles.hint}>
          Open your Corner Card and hold the QR under the scanner.
        </p>
      </section>

      <form className={styles.form} onSubmit={onSubmit} autoComplete="off">
        <label className={styles.srOnly} htmlFor="kiosk-scan">
          Scan token
        </label>
        <input
          id="kiosk-scan"
          ref={inputRef}
          className={styles.scanInput}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onBlur={() => {
            requestAnimationFrame(focusScan);
          }}
          onKeyDown={onKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          inputMode="none"
          disabled={busy}
          placeholder={busy ? "Checking in…" : "Waiting for scan…"}
        />
      </form>

      {flash ? (
        <div
          className={
            flash.kind === "ok"
              ? styles.flashOk
              : flash.kind === "dup"
                ? styles.flashDup
                : styles.flashErr
          }
          role="status"
          aria-live="assertive"
        >
          <span className={styles.flashIcon} aria-hidden>
            {flash.kind === "ok" ? "✓" : flash.kind === "dup" ? "↺" : "!"}
          </span>
          <p className={styles.flashTitle}>{flash.title}</p>
          {flash.detail ? (
            <p className={styles.flashDetail}>{flash.detail}</p>
          ) : null}
        </div>
      ) : (
        <div className={styles.idle}>
          <span className={styles.scanGlyph} aria-hidden />
          <p>Scanner ready</p>
          <small>No taps needed · next scan appears here</small>
        </div>
      )}

      <footer className={styles.footer}>
        <span>Card → scanner → confirmation</span>
        <span>See the front desk if your card says action needed.</span>
      </footer>

      <Link className={styles.exit} href="/desk">
        Exit kiosk
      </Link>
    </main>
  );
}
