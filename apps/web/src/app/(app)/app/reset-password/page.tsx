"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, post } from "@/lib/api";
import styles from "../ui.module.css";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenFromUrl = params.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await post("/api/v1/auth/reset-password", {
        token: token.trim(),
        password,
      });
      router.push("/app");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reset password. Request a new link.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {!tokenFromUrl ? (
        <label className={styles.field}>
          <span className={styles.label}>Reset token</span>
          <input
            className={styles.input}
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
      ) : null}
      <label className={styles.field}>
        <span className={styles.label}>New password</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <Button type="submit" disabled={pending || !token.trim()}>
          {pending ? "Saving…" : "Set new password"}
        </Button>
        <p className={styles.muted}>
          <Link className={styles.link} href="/app/forgot-password">
            Request a new link
          </Link>
        </p>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Account recovery</p>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.lead}>
          Choose a new password (8+ characters). You&apos;ll land on member home
          after.
        </p>
      </div>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
