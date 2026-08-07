"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get } from "@/lib/api";
import styles from "../ui.module.css";

type Thread = {
  id: string;
  subject?: string | null;
  messages?: { body?: string; createdAt?: string }[];
};

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await get<{ threads: Thread[] }>(
          "/api/v1/messages/threads",
        );
        if (!active) return;
        setThreads(data.threads ?? []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load messages.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
                <p className={styles.rowTitle}>
                  {thread.subject ?? "Gym message"}
                </p>
                <p className={styles.rowMeta}>{preview}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
