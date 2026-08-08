"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../../staff.module.css";

type Thread = {
  id: string;
  subject: string;
  kind: string;
  sessionId?: string | null;
  messages?: { body?: string; createdAt?: string; sender?: string }[];
};

type HomeSession = { id: string; title: string };
type RosterRow = { userId: string; name: string };

export default function CoachMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    subject: string;
    messages: {
      id: string;
      body: string;
      sender: string;
      mine: boolean;
      createdAt: string;
    }[];
  } | null>(null);
  const [reply, setReply] = useState("");
  const [sessions, setSessions] = useState<HomeSession[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [athleteId, setAthleteId] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadThreads = useCallback(async () => {
    const res = await get<{ threads: Thread[] }>("/api/v1/messages/threads");
    setThreads(res.threads);
  }, []);

  useEffect(() => {
    loadThreads().catch((err) =>
      setError(err instanceof ApiError ? err.message : "Load failed"),
    );
    get<{ today: HomeSession[] }>("/api/v1/coach/home")
      .then((res) => {
        setSessions(res.today);
        if (res.today[0]) setSessionId(res.today[0].id);
      })
      .catch(() => undefined);
  }, [loadThreads]);

  useEffect(() => {
    if (!sessionId) return;
    get<{ roster: RosterRow[] }>(`/api/v1/coach/sessions/${sessionId}/roster`)
      .then((res) => {
        setRoster(res.roster);
        if (res.roster[0]) setAthleteId(res.roster[0].userId);
      })
      .catch(() => setRoster([]));
  }, [sessionId]);

  async function openThread(id: string) {
    setActiveId(id);
    setError(null);
    try {
      const res = await get<{
        thread: {
          subject: string;
          messages: {
            id: string;
            body: string;
            sender: string;
            mine: boolean;
            createdAt: string;
          }[];
        };
      }>(`/api/v1/messages/threads/${id}`);
      setDetail(res.thread);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Open failed");
    }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!activeId || !reply.trim()) return;
    setBusy(true);
    try {
      await post(`/api/v1/messages/threads/${activeId}/messages`, {
        body: reply.trim(),
      });
      setReply("");
      await openThread(activeId);
      await loadThreads();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reply failed");
    } finally {
      setBusy(false);
    }
  }

  async function composeDirect() {
    if (!athleteId || !composeBody.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ thread: { id: string } }>(
        "/api/v1/messages/threads",
        {
          kind: "direct",
          athleteId,
          body: composeBody.trim(),
          sessionId: sessionId || undefined,
        },
      );
      setComposeBody("");
      setMessage("Direct thread created");
      await loadThreads();
      await openThread(res.thread.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Compose failed");
    } finally {
      setBusy(false);
    }
  }

  async function broadcast() {
    if (!sessionId || !composeBody.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ thread: { id: string } }>(
        "/api/v1/messages/threads",
        {
          kind: "class_broadcast",
          sessionId,
          body: composeBody.trim(),
        },
      );
      setComposeBody("");
      setMessage("Class broadcast sent");
      await loadThreads();
      await openThread(res.thread.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Broadcast failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>COACH</p>
      <h1 className={styles.title}>Messages</h1>
      <p className={styles.copy}>
        Direct athlete threads and class broadcasts from the floor.
      </p>
      <p>
        <Link href="/coach">← Coach home</Link>
        {" · "}
        <Link href="/coach/roster">Roster</Link>
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.copy}>{message}</p> : null}

      <section className={styles.panel}>
        <p className={styles.eyebrow}>COMPOSE</p>
        <label className={styles.field}>
          <span>Class</span>
          <select
            className={styles.input}
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Athlete (direct)</span>
          <select
            className={styles.input}
            value={athleteId}
            onChange={(e) => setAthleteId(e.target.value)}
          >
            {roster.map((r) => (
              <option key={r.userId} value={r.userId}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Message</span>
          <textarea
            className={styles.input}
            rows={3}
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
          />
        </label>
        <div className={styles.row}>
          <Button type="button" disabled={busy} onClick={() => void composeDirect()}>
            Send direct
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void broadcast()}
          >
            Broadcast class
          </Button>
        </div>
      </section>

      <ul className={styles.list}>
        {threads.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={styles.item}
              style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
              onClick={() => void openThread(t.id)}
            >
              <strong>
                {t.subject}{" "}
                <span className={styles.meta}>
                  · {t.kind === "class_broadcast" ? "broadcast" : "direct"}
                </span>
              </strong>
              <div className={styles.meta}>
                {t.messages?.[0]?.body ?? "Open thread"}
              </div>
            </button>
          </li>
        ))}
        {threads.length === 0 ? (
          <li className={styles.item}>
            <span className={styles.meta}>No threads yet.</span>
          </li>
        ) : null}
      </ul>

      {detail && activeId ? (
        <section className={styles.panel} style={{ marginTop: "1rem" }}>
          <h2>{detail.subject}</h2>
          <ul className={styles.list}>
            {detail.messages.map((m) => (
              <li key={m.id} className={styles.item}>
                <div className={styles.meta}>
                  {m.mine ? "You" : m.sender} ·{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <strong>{m.body}</strong>
              </li>
            ))}
          </ul>
          <form onSubmit={sendReply}>
            <label className={styles.field}>
              <span>Reply</span>
              <input
                className={styles.input}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={busy}>
              Send reply
            </Button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
