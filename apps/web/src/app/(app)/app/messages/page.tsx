"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../ui.module.css";

type Thread = {
  id: string;
  subject?: string | null;
  kind?: string;
  messages?: { body?: string; createdAt?: string; sender?: string }[];
};

type ThreadDetail = {
  id: string;
  subject: string;
  messages: {
    id: string;
    body: string;
    sender: string;
    mine: boolean;
    createdAt: string;
  }[];
};

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<ThreadDetail | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadThreads = useCallback(async () => {
    const data = await get<{ threads: Thread[] }>("/api/v1/messages/threads");
    setThreads(data.threads ?? []);
  }, []);

  useEffect(() => {
    let activeFlag = true;
    (async () => {
      try {
        await loadThreads();
        if (activeFlag) setError(null);
      } catch (err) {
        if (activeFlag) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load messages.",
          );
        }
      } finally {
        if (activeFlag) setLoading(false);
      }
    })();
    return () => {
      activeFlag = false;
    };
  }, [loadThreads]);

  async function openThread(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await get<{ thread: ThreadDetail }>(
        `/api/v1/messages/threads/${id}`,
      );
      setActive(res.thread);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Open failed");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    setBusy(true);
    try {
      await post(`/api/v1/messages/threads/${active.id}/messages`, {
        body: reply.trim(),
      });
      setReply("");
      await openThread(active.id);
      await loadThreads();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reply failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Inbox</p>
        <h1 className={styles.title}>Messages</h1>
        <p className={styles.lead}>
          Direct threads with the gym — desk notes and coach follow-ups.
        </p>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading inbox…</p>
      ) : error ? (
        <div className={styles.empty}>
          <p className={styles.muted}>{error}</p>
          <div className={styles.actionsRow} style={{ justifyContent: "center" }}>
            <Button type="button" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      ) : threads.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.muted}>
            No threads yet. For membership or schedule questions, visit the desk
            or use Contact on the public site.
          </p>
          <div className={styles.actionsRow} style={{ justifyContent: "center" }}>
            <Link href="/contact">
              <Button type="button">Contact the gym</Button>
            </Link>
            <Link href="/app">
              <Button type="button" variant="secondary">
                Member home
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <ul className={styles.list}>
          {threads.map((thread) => {
            const preview = thread.messages?.[0]?.body ?? "Open thread";
            return (
              <li key={thread.id} className={styles.row}>
                <button
                  type="button"
                  onClick={() => void openThread(thread.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    textAlign: "left",
                    width: "100%",
                    padding: 0,
                    cursor: "pointer",
                    font: "inherit",
                  }}
                >
                  <p className={styles.rowTitle}>
                    {thread.subject ?? "Gym message"}
                    {thread.kind === "class_broadcast" ? " · class" : ""}
                  </p>
                  <p className={styles.rowMeta}>{preview}</p>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {active ? (
        <div className={styles.empty} style={{ marginTop: "1.25rem", textAlign: "left" }}>
          <p className={styles.eyebrow}>THREAD</p>
          <h2 className={styles.title} style={{ fontSize: "1.5rem" }}>
            {active.subject}
          </h2>
          <ul className={styles.list}>
            {active.messages.map((m) => (
              <li key={m.id} className={styles.row}>
                <p className={styles.rowMeta}>
                  {m.mine ? "You" : m.sender} ·{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </p>
                <p className={styles.rowTitle}>{m.body}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={sendReply} className={styles.actionsRow}>
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply…"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "0.65rem 0.75rem",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid var(--border)",
                color: "inherit",
              }}
            />
            <Button type="submit" disabled={busy}>
              Send
            </Button>
          </form>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setActive(null)}
          >
            Close
          </Button>
        </div>
      ) : null}
    </div>
  );
}
