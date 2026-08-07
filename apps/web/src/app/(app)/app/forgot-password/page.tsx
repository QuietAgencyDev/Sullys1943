"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, post } from "@/lib/api";
import styles from "../ui.module.css";

type ForgotResponse = {
  ok: boolean;
  message?: string;
  resetLink?: string;
  demoHint?: boolean;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForgotResponse | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setPending(true);
    try {
      const res = await post<ForgotResponse>("/api/v1/auth/forgot-password", {
        email: email.trim(),
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start reset. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Account recovery</p>
        <h1 className={styles.title}>Forgot password</h1>
        <p className={styles.lead}>
          Enter the email on your Sully&apos;s account. We&apos;ll prepare a
          reset link (demo shows it on screen).
        </p>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        {result ? (
          <div className={styles.card}>
            <p className={styles.muted}>{result.message}</p>
            {result.resetLink ? (
              <p className={styles.muted}>
                Demo reset link:{" "}
                <Link className={styles.link} href={result.resetLink}>
                  Open reset page
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={styles.actions}>
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
          <p className={styles.muted}>
            <Link className={styles.link} href="/app/login">
              Back to sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
