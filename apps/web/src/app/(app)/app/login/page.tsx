"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError } from "@/lib/api";
import { login } from "@/lib/auth-client";
import styles from "../ui.module.css";

function safeAppNext(raw: string | null): string {
  if (!raw) return "/app";
  if (!raw.startsWith("/app")) return "/app";
  if (raw.startsWith("//")) return "/app";
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeAppNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      router.push(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not sign in. Check email and password, or reset your password.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Member access</p>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.lead}>
          Enter your Sully&apos;s account to open member home, book classes, and
          show your digital card.
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
        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className={styles.muted}>
            <Link className={styles.link} href="/app/forgot-password">
              Forgot password?
            </Link>
          </p>
          <p className={styles.muted}>
            New here?{" "}
            <Link className={styles.link} href="/app/register">
              Create an account
            </Link>
          </p>
          <p className={styles.muted}>
            Demo sandbox:{" "}
            <code>member@sullys.local</code> / <code>password123</code>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <p className={styles.muted}>Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
