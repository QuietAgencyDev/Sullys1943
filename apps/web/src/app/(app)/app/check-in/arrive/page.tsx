"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ApiError, post } from "@/lib/api";
import styles from "../../ui.module.css";
import arriveStyles from "./arrive.module.css";

type State =
  | { kind: "checking" }
  | { kind: "ok"; name?: string; xp: number; session?: string }
  | { kind: "dup"; name?: string; session?: string }
  | { kind: "blocked"; message: string }
  | { kind: "err"; message: string };

type CheckInRes = {
  member?: { name: string };
  xpAwarded?: number;
  duplicate?: boolean;
  sessionTitle?: string;
};

const ARRIVE_PATH = "/app/check-in/arrive";

export default function ArriveCheckInPage() {
  const [state, setState] = useState<State>({ kind: "checking" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const res = await post<CheckInRes>("/api/v1/check-in", {});
        const name = res.member?.name;
        const session = res.sessionTitle;
        if (res.duplicate) {
          setState({ kind: "dup", name, session });
        } else {
          setState({
            kind: "ok",
            name,
            xp: res.xpAwarded ?? 10,
            session,
          });
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // apiFetch also redirects; keep an explicit next= for wall cold-start
          window.location.href = `/app/login?next=${encodeURIComponent(ARRIVE_PATH)}`;
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Check-in failed";
        const blocked =
          /waiver|membership/i.test(message) ||
          (err instanceof ApiError && err.status === 400);
        setState({
          kind: blocked ? "blocked" : "err",
          message,
        });
      }
    })();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Walk-in</p>
        <h1 className={styles.title}>Gym check-in</h1>
      </div>

      <section
        className={arriveStyles.panel}
        aria-live="polite"
        aria-busy={state.kind === "checking"}
      >
        {state.kind === "checking" ? (
          <>
            <p className={arriveStyles.status}>Checking in…</p>
            <p className={styles.muted}>One moment — no button needed.</p>
          </>
        ) : null}

        {state.kind === "ok" ? (
          <>
            <p className={arriveStyles.ok}>You’re in</p>
            {state.name ? (
              <p className={arriveStyles.name}>{state.name}</p>
            ) : null}
            <p className={styles.lead}>
              +{state.xp} XP
              {state.session ? ` · ${state.session}` : ""}
            </p>
          </>
        ) : null}

        {state.kind === "dup" ? (
          <>
            <p className={arriveStyles.dup}>Already checked in</p>
            {state.name ? (
              <p className={arriveStyles.name}>{state.name}</p>
            ) : null}
            <p className={styles.muted}>
              {state.session
                ? `Attached to ${state.session}`
                : "You’re already on the floor."}
            </p>
          </>
        ) : null}

        {state.kind === "blocked" ? (
          <>
            <p className={arriveStyles.err}>Can’t check in yet</p>
            <p className={styles.lead}>{state.message}</p>
            <p className={styles.muted}>
              Sign your waiver or renew membership in the app, or see the desk.
            </p>
            <div className={styles.actions}>
              <Link className={styles.link} href="/app/waiver">
                Open waiver
              </Link>
              <Link className={styles.link} href="/app">
                Member home
              </Link>
            </div>
          </>
        ) : null}

        {state.kind === "err" ? (
          <>
            <p className={arriveStyles.err}>See desk</p>
            <p className={styles.lead}>{state.message}</p>
            <Link className={styles.link} href="/app">
              Back to member home
            </Link>
          </>
        ) : null}
      </section>
    </div>
  );
}
