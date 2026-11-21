"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import { register } from "@/lib/auth-client";
import styles from "./join.module.css";

type Step = "account" | "waiver" | "plan" | "done";
type PlanId = "monthly" | "youth" | "trial";

const STEPS: { id: Step; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "waiver", label: "Waiver" },
  { id: "plan", label: "Plan" },
  { id: "done", label: "Pay" },
];

type Packet = {
  id: string;
  status: string;
  version?: {
    body?: string;
    template?: { name?: string };
  };
};

type CheckoutResponse = {
  mode?: "mock" | "stripe" | "helcim" | "free";
  checkoutToken?: string | null;
  note?: string | null;
  checkoutUrl?: string | null;
  membershipId: string;
};

async function openHelcimPay(checkoutToken: string) {
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector("script[data-helcim-pay]");
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://secure.helcim.app/helcim-pay/services/start.js";
    script.dataset.helcimPay = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Helcim checkout did not load"));
    document.body.appendChild(script);
  });
  const start = (
    window as unknown as { appendHelcimPayIframe?: (token: string) => void }
  ).appendHelcimPayIframe;
  if (!start) throw new Error("Helcim checkout is not available");
  start(checkoutToken);
}

export function JoinForm() {
  const [step, setStep] = useState<Step>("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [packet, setPacket] = useState<Packet | null>(null);
  const [typedName, setTypedName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [billingMode, setBillingMode] = useState<"mock" | "stripe">("mock");
  const [billingHint, setBillingHint] = useState<string | null>(null);

  useEffect(() => {
    get<{ mode: "mock" | "stripe"; hint?: string }>("/api/v1/billing/mode")
      .then((res) => {
        setBillingMode(res.mode);
        setBillingHint(res.hint ?? null);
      })
      .catch(() => undefined);
  }, []);

  async function createAccount(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Enter your name, email, and a password (8+ characters).");
      return;
    }
    setPending(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      const req = await get<{ packets: Packet[] }>(
        "/api/v1/documents/requirements",
      );
      const open =
        req.packets.find((p) => p.status === "required") ?? req.packets[0] ?? null;
      if (!open) {
        setError("No waiver packet available. Contact the front desk.");
        return;
      }
      setPacket(open);
      setTypedName(name.trim());
      setStep("waiver");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not create account. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function signWaiver(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!accepted) {
      setError("Accept the waiver to continue.");
      return;
    }
    if (!packet?.id) {
      setError("Waiver packet missing.");
      return;
    }
    if (!typedName.trim()) {
      setError("Type your full legal name to sign.");
      return;
    }
    setPending(true);
    try {
      await post(`/api/v1/documents/packets/${packet.id}/sign`, {
        typedName: typedName.trim(),
      });
      setStep("plan");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not sign waiver.",
      );
    } finally {
      setPending(false);
    }
  }

  async function submitJoin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    setNote(null);
    try {
      if (plan !== "youth") {
        setNote(
          plan === "monthly"
            ? "Adult Unlimited is $150 a month before HST. Glofox still sends that bill. Tell the desk. This app does not charge."
            : "The first class for a new customer is free. Ask the desk. This app does not charge.",
        );
        setStep("done");
        return;
      }
      const checkout = await post<CheckoutResponse>(
        "/api/v1/membership/checkout",
        { productCode: plan, plan },
      );
      if (checkout.mode === "free") {
        setNote(checkout.note ?? "Youth training is free. You're in.");
        setStep("done");
        return;
      }
      if (checkout.checkoutToken) {
        await openHelcimPay(checkout.checkoutToken);
        setNote("Card checkout is open. Finish it to activate the membership.");
        setStep("done");
        return;
      }
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }
      setNote("Checkout created — complete payment to activate.");
      setStep("done");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not complete join. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  const waiverBody =
    packet?.version?.body ??
    "I acknowledge the risks of boxing training at Sully's Boxing Gym EST 1943.";

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Join Sully&apos;s</p>
      <h1 className={styles.title}>Start training</h1>
      <p className={styles.copy}>
        Account → signed liability waiver → plan → pay. No QR check-in without a
        signed waiver. Checkout mode: <strong>{billingMode}</strong>
        {billingMode === "mock" && billingHint ? ` — ${billingHint}` : ""}.
      </p>

      <div className={styles.steps} aria-label="Join steps">
        {STEPS.map((item) => (
          <span
            key={item.id}
            className={`${styles.stepChip} ${step === item.id ? styles.stepChipActive : ""}`}
          >
            {item.label}
          </span>
        ))}
      </div>

      {step === "account" ? (
        <section className={styles.panel}>
          <form className={styles.form} onSubmit={createAccount}>
            <label className={styles.field}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.actions}>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Continue"}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {step === "waiver" ? (
        <section className={styles.panel}>
          <form className={styles.form} onSubmit={signWaiver}>
            <p className={styles.label}>
              {packet?.version?.template?.name ?? "Liability waiver"}
            </p>
            <div className={styles.waiver}>
              <p>{waiverBody}</p>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Type full legal name</span>
              <input
                className={styles.input}
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                required
              />
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I have read and electronically sign this waiver. The{" "}
                <Link href="/terms">terms</Link> and{" "}
                <Link href="/privacy">privacy notice</Link> apply to this
                account.
              </span>
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.actions}>
              <Button type="submit" disabled={pending}>
                {pending ? "Signing…" : "Sign & continue"}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {step === "plan" ? (
        <section className={styles.panel}>
          <form className={styles.form} onSubmit={submitJoin}>
            <div className={styles.plans}>
              <button
                type="button"
                className={`${styles.plan} ${plan === "monthly" ? styles.planSelected : ""}`}
                onClick={() => setPlan("monthly")}
              >
                <p className={styles.planName}>Adult Unlimited</p>
                <p className={styles.planMeta}>
                  $150 / month · unlimited group classes and gym access
                </p>
              </button>
              <button
                type="button"
                className={`${styles.plan} ${plan === "youth" ? styles.planSelected : ""}`}
                onClick={() => setPlan("youth")}
              >
                <p className={styles.planName}>Free youth classes</p>
                <p className={styles.planMeta}>
                  Ages 8–12 and 13–17 · scheduled classes · a parent books
                </p>
              </button>
              <button
                type="button"
                className={`${styles.plan} ${plan === "trial" ? styles.planSelected : ""}`}
                onClick={() => setPlan("trial")}
              >
                <p className={styles.planName}>Free intro class</p>
                <p className={styles.planMeta}>
                  One class for a new customer · ask the desk
                </p>
              </button>
            </div>
            <p className={styles.copy}>
              November 2026 desk rates, in CAD, before HST. Glofox still sends
              the bill. This app does not charge.
            </p>
            <ul className={styles.copy}>
              <li>Adult Unlimited $150 / month</li>
              <li>8-Class Membership $120 / month · unused classes do not roll over</li>
              <li>Weights and Bags Only $75 / month</li>
              <li>Flex Pass $175 for one month · no automatic renewal</li>
              <li>Youth 8–12 $75 / month · Youth 13–17 $85 / month</li>
              <li>Student 18–22 $99 / month · valid student ID</li>
              <li>Senior 65+ $1,200 / year · Annual paid-in-full $1,200 / year</li>
              <li>Drop-in $32 · 5 classes $145 · 10 classes $260</li>
              <li>Kids 7 and under · private $65 / hour · two together $55 / hour · Reni, Levi, Anthony, Tommy</li>
              <li>Gift certificates $50, $100, and $150 · at the desk</li>
            </ul>
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("waiver")}
                disabled={pending}
              >
                Back
              </Button>
              <Button type="submit" disabled={pending}>
                {pending
                  ? "Saving…"
                  : plan === "youth"
                    ? "Confirm free youth classes"
                    : "Got it — Glofox still bills"}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {step === "done" ? (
        <section className={`${styles.panel} ${styles.success}`}>
          <p className={styles.copy}>
            {note ?? "You're in. Welcome to Sully's."}
          </p>
          <div className={styles.actions}>
            <Link href="/app/calendar">
              <Button type="button">Open member portal</Button>
            </Link>
            <Link href="/">
              <Button type="button" variant="secondary">
                Back home
              </Button>
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
