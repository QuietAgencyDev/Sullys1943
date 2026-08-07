"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import QRCode from "qrcode";
import { getMe } from "@/lib/auth-client";
import styles from "../ui.module.css";

type Child = {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string | null;
  relationship: string;
  membership: { status: string; plan: string } | null;
  waiverStatus: string;
  attendanceCount: number;
};

type Session = {
  id: string;
  title: string;
  startsAt: string;
  spotsLeft: number;
  status: string;
};

type ChildWaiver = {
  packet: {
    id: string;
    status: string;
    body: string;
    templateName: string;
    signedAt: string | null;
  };
};

export default function FamilyPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeChild, setActiveChild] = useState<string>("");
  const [qr, setQr] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [waiver, setWaiver] = useState<ChildWaiver["packet"] | null>(null);
  const [typedName, setTypedName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshFamily() {
    const [fam, sess, me] = await Promise.all([
      get<{ children: Child[] }>("/api/v1/family/children"),
      get<{ sessions: Session[] }>("/api/v1/sessions"),
      getMe().catch(() => null),
    ]);
    setChildren(fam.children);
    if (!activeChild && fam.children[0]) setActiveChild(fam.children[0].id);
    setSessions(sess.sessions.filter((s) => s.status !== "full").slice(0, 8));
    if (me?.name) setTypedName((prev) => prev || `${me.name} (guardian)`);
  }

  useEffect(() => {
    refreshFamily().catch((err) =>
      setError(err instanceof ApiError ? err.message : "Failed to load family"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeChild) {
      setWaiver(null);
      return;
    }
    get<ChildWaiver>(`/api/v1/family/children/${activeChild}/waiver`)
      .then((res) => setWaiver(res.packet))
      .catch(() => setWaiver(null));
  }, [activeChild]);

  async function issueChildQr() {
    if (!activeChild) return;
    setError(null);
    setMessage(null);
    try {
      const res = await post<{ token: string }>(
        `/api/v1/family/children/${activeChild}/check-in-token`,
      );
      setToken(res.token);
      setQr(
        await QRCode.toDataURL(res.token, {
          width: 220,
          margin: 1,
          color: { dark: "#140f0c", light: "#f3e6c8" },
        }),
      );
      setMessage("Child QR ready — show at the desk (60s).");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not issue QR");
      setQr(null);
    }
  }

  async function bookForChild(sessionId: string) {
    if (!activeChild) return;
    setError(null);
    setMessage(null);
    try {
      await post(`/api/v1/sessions/${sessionId}/bookings`, {
        forUserId: activeChild,
      });
      setMessage("Booked for your child.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Booking failed");
    }
  }

  async function signChildWaiver(e: FormEvent) {
    e.preventDefault();
    if (!activeChild) return;
    setError(null);
    setMessage(null);
    try {
      await post(`/api/v1/family/children/${activeChild}/waiver/sign`, {
        typedName: typedName.trim(),
      });
      setMessage("Youth waiver signed as guardian. Child QR is unlocked.");
      await refreshFamily();
      const res = await get<ChildWaiver>(
        `/api/v1/family/children/${activeChild}/waiver`,
      );
      setWaiver(res.packet);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign waiver");
    }
  }

  const child = children.find((c) => c.id === activeChild);

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Parent portal</p>
        <h1 className={styles.title}>Family</h1>
        <p className={styles.lead}>
          Sign youth waivers as guardian, book classes, and issue a desk QR for
          your child.
        </p>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.muted}>{message}</p> : null}

      {children.length === 0 && !error ? (
        <div className={styles.empty}>
          <p className={styles.muted}>
            No linked children yet. Ask the front desk to connect a youth
            profile to your parent account — then you can sign waivers, book,
            and issue desk QR.
          </p>
          <div className={styles.actionsRow} style={{ justifyContent: "center" }}>
            <Link href="/app">
              <Button type="button" variant="secondary">
                Member home
              </Button>
            </Link>
            <Link href="/contact">
              <Button type="button">Contact desk</Button>
            </Link>
          </div>
        </div>
      ) : children.length === 0 ? null : (
        <>
          <section className={styles.card}>
            <label className={styles.field}>
              <span className={styles.label}>Acting for</span>
              <select
                className={styles.input}
                value={activeChild}
                onChange={(e) => {
                  setActiveChild(e.target.value);
                  setQr(null);
                  setToken(null);
                }}
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {child ? (
              <p className={styles.muted}>
                {child.membership
                  ? `${child.membership.plan} · ${child.membership.status}`
                  : "No active membership"}{" "}
                · Waiver {child.waiverStatus} · {child.attendanceCount}{" "}
                check-ins
              </p>
            ) : null}
            <div className={styles.actionsRow}>
              <Button type="button" onClick={issueChildQr}>
                Issue child check-in QR
              </Button>
            </div>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="Child check-in QR" width={200} height={200} />
            ) : null}
            {token ? (
              <p className={styles.muted} style={{ wordBreak: "break-all" }}>
                {token}
              </p>
            ) : null}
          </section>

          {waiver ? (
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>
                Youth waiver · {waiver.templateName}
              </h2>
              {waiver.status === "signed" ? (
                <>
                  <p className={styles.muted}>
                    Signed
                    {waiver.signedAt
                      ? ` ${new Date(waiver.signedAt).toLocaleString()}`
                      : ""}
                    . Guardians may re-issue QR anytime.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const { downloadAuthenticated } = await import(
                          "@/lib/api"
                        );
                        await downloadAuthenticated(
                          `/api/v1/documents/packets/${waiver.id}/pdf`,
                          `sullys-youth-waiver-${waiver.id.slice(0, 8)}.pdf`,
                        );
                      } catch (err) {
                        setError(
                          err instanceof ApiError
                            ? err.message
                            : "PDF download failed",
                        );
                      }
                    }}
                  >
                    Download youth waiver PDF
                  </Button>
                </>
              ) : (
                <form className={styles.form} onSubmit={signChildWaiver}>
                  <p className={styles.muted}>{waiver.body}</p>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Guardian typed legal name
                    </span>
                    <input
                      className={styles.input}
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      required
                    />
                  </label>
                  <Button type="submit">Sign as guardian</Button>
                </form>
              )}
            </section>
          ) : null}

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Book for child</h2>
            <ul className={styles.list}>
              {sessions.map((s) => (
                <li key={s.id} className={styles.row}>
                  <div>
                    <p className={styles.rowTitle}>{s.title}</p>
                    <p className={styles.rowMeta}>
                      {new Date(s.startsAt).toLocaleString()} · {s.spotsLeft}{" "}
                      spots
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => bookForChild(s.id)}
                  >
                    Book
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <div className={styles.actionsRow}>
        <Link href="/app/profile">
          <Button type="button" variant="ghost">
            Back to profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
