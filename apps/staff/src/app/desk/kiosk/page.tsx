"use client";

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
  const [flash, setFlash] = useState<Flash>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusScan = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusScan();
    const onVisibility = () => {
      if (document.visibilityState === "visible") focusScan();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const id = setInterval(focusScan, 1500);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
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
      <p className={styles.eyebrow}>DOOR KIOSK</p>
      <h1 className={styles.title}>Scan member card</h1>
      <p className={styles.hint}>
        Hold phone QR to the scanner. No taps needed.
      </p>

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
          <p className={styles.flashTitle}>{flash.title}</p>
          {flash.detail ? (
            <p className={styles.flashDetail}>{flash.detail}</p>
          ) : null}
        </div>
      ) : (
        <div className={styles.idle}>
          <p>Ready</p>
        </div>
      )}

      <Link className={styles.exit} href="/desk" tabIndex={-1}>
        Exit kiosk
      </Link>
    </main>
  );
}
