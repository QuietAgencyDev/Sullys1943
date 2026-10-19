"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
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
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);
    setState({ kind: "checking" });

    (async () => {
      try {
        const res = await post<CheckInRes>(
          "/api/v1/check-in",
          {},
          { signal: controller.signal },
        );
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
          err instanceof ApiError
            ? err.message
            : err instanceof DOMException && err.name === "AbortError"
              ? "The check-in service took too long to respond."
              : "Check-in failed";
        const blocked =
          /waiver|membership/i.test(message) ||
          (err instanceof ApiError && err.status === 400);
        setState({
          kind: blocked ? "blocked" : "err",
          message,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [attempt]);

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Sully&apos;s front door</p>
        <h1 className={styles.title}>Step Into Your Corner</h1>
        <p className={styles.lead}>
          We&apos;re checking your membership, waiver, and today&apos;s class.
        </p>
      </div>

      <section
        className={arriveStyles.panel}
        aria-live="polite"
        aria-busy={state.kind === "checking"}
      >
        {state.kind === "checking" ? (
          <>
            <span className={arriveStyles.spinner} aria-hidden />
            <p className={arriveStyles.status}>Finding your round…</p>
            <p className={styles.muted}>
              Keep this screen open. No button needed.
            </p>
          </>
        ) : null}

        {state.kind === "ok" ? (
          <>
            <span className={arriveStyles.resultIcon} aria-hidden>
              ✓
            </span>
            <p className={arriveStyles.ok}>You’re in</p>
            {state.name ? (
              <p className={arriveStyles.name}>{state.name}</p>
            ) : null}
            <p className={styles.lead}>
              +{state.xp} XP
              {state.session ? ` · ${state.session}` : ""}
            </p>
            <Link href="/app/card" className={arriveStyles.primaryLink}>
              Open your corner card
            </Link>
          </>
        ) : null}

        {state.kind === "dup" ? (
          <>
            <span
              className={`${arriveStyles.resultIcon} ${arriveStyles.resultIconDup}`}
              aria-hidden
            >
              ✓
            </span>
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
            <span
              className={`${arriveStyles.resultIcon} ${arriveStyles.resultIconError}`}
              aria-hidden
            >
              !
            </span>
            <p className={arriveStyles.err}>Can’t check in yet</p>
            <p className={styles.lead}>{state.message}</p>
            <p className={styles.muted}>
              Sign your waiver or renew membership in the app, or see the desk.
            </p>
            <div className={arriveStyles.actions}>
              <Link className={arriveStyles.primaryLink} href="/app/waiver">
                Fix waiver
              </Link>
              <Link className={arriveStyles.secondaryLink} href="/app">
                Return home
              </Link>
            </div>
          </>
        ) : null}

        {state.kind === "err" ? (
          <>
            <span
              className={`${arriveStyles.resultIcon} ${arriveStyles.resultIconError}`}
              aria-hidden
            >
              !
            </span>
            <p className={arriveStyles.err}>See desk</p>
            <p className={styles.lead}>{state.message}</p>
            <div className={arriveStyles.actions}>
              <Button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Try again
              </Button>
              <Link className={arriveStyles.secondaryLink} href="/app">
                Member home
              </Link>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
