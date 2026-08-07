"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@sullys/ui";
import { ApiError, downloadAuthenticated, get, post } from "@/lib/api";
import { getMe } from "@/lib/auth-client";
import styles from "../ui.module.css";

type Packet = {
  id: string;
  status: string;
  subjectUserId?: string;
  signedAt?: string | null;
  version?: { body?: string; template?: { name?: string } };
  signatures?: { typedName: string }[];
};

export default function WaiverPage() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [typedName, setTypedName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const [me, req] = await Promise.all([
      getMe().catch(() => null),
      get<{ packets: Packet[] }>("/api/v1/documents/requirements"),
    ]);
    if (me?.name) setTypedName(me.name);
    setPackets(req.packets);
  }

  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof ApiError ? e.message : "Failed to load waivers"),
    );
  }, []);

  const open = packets.find((p) => p.status === "required");
  const signed = packets.filter((p) => p.status === "signed");

  async function sign(e: FormEvent) {
    e.preventDefault();
    if (!open) return;
    setPending(true);
    setError(null);
    setMsg(null);
    try {
      await post(`/api/v1/documents/packets/${open.id}/sign`, {
        typedName: typedName.trim(),
      });
      setMsg("Waiver signed. Download your PDF record anytime.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign failed");
    } finally {
      setPending(false);
    }
  }

  async function downloadPdf(id: string) {
    setError(null);
    try {
      await downloadAuthenticated(
        `/api/v1/documents/packets/${id}/pdf`,
        `sullys-waiver-${id.slice(0, 8)}.pdf`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Download failed");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Documents</p>
        <h1 className={styles.title}>Liability waiver</h1>
        <p className={styles.lead}>
          Required before QR check-in or membership checkout. Signed packets
          download as PDF records.
        </p>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {msg ? <p className={styles.muted}>{msg}</p> : null}

      {open ? (
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>
            {open.version?.template?.name ?? "Liability waiver"}
          </h2>
          <p className={styles.muted} style={{ whiteSpace: "pre-wrap" }}>
            {open.version?.body}
          </p>
          <form className={styles.form} onSubmit={sign}>
            <label className={styles.field}>
              <span className={styles.label}>Type full legal name</span>
              <input
                className={styles.input}
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                required
              />
            </label>
            <Button type="submit" disabled={pending}>
              {pending ? "Signing…" : "Sign waiver"}
            </Button>
          </form>
        </section>
      ) : (
        <section className={styles.card}>
          <p className={styles.muted}>
            {packets.length
              ? "No open waiver packets. Signed records are below."
              : "No waiver packets on file."}
          </p>
        </section>
      )}

      {signed.length > 0 ? (
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Signed records</h2>
          <ul className={styles.list}>
            {signed.map((p) => (
              <li key={p.id} className={styles.row}>
                <div>
                  <p className={styles.rowTitle}>
                    {p.version?.template?.name ?? "Waiver"}
                  </p>
                  <p className={styles.rowMeta}>
                    {p.signedAt
                      ? new Date(p.signedAt).toLocaleString()
                      : "Signed"}
                    {p.signatures?.[0]?.typedName
                      ? ` · ${p.signatures[0].typedName}`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => downloadPdf(p.id)}
                >
                  Download PDF
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.actionsRow}>
        <Link href="/app/card">
          <Button type="button">Open digital card</Button>
        </Link>
        <Link href="/app/billing">
          <Button type="button" variant="ghost">
            Billing
          </Button>
        </Link>
      </div>
    </div>
  );
}
