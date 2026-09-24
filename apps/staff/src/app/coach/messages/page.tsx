"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../../staff.module.css";
import messageStyles from "./messages.module.css";

type Thread = {
  id: string;
  subject: string;
  kind: string;
  sessionId?: string | null;
  createdAt?: string;
  participants?: { id: string; name: string }[];
  messages?: { body?: string; createdAt?: string; sender?: string }[];
};

type HomeSession = { id: string; title: string };
type RosterRow = { userId: string; name: string };

export default function CoachMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    subject: string;
    kind?: string;
    sessionId?: string | null;
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
  const [composeMode, setComposeMode] = useState<"direct" | "broadcast">(
    "direct",
  );
  const [search, setSearch] = useState("");
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
    const refresh = window.setInterval(() => {
      loadThreads().catch(() => undefined);
    }, 15_000);
    return () => window.clearInterval(refresh);
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

  const filteredThreads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return threads;
    return threads.filter((thread) =>
      [
        thread.subject,
        thread.kind,
        thread.messages?.[0]?.body,
        ...(thread.participants?.map((participant) => participant.name) ?? []),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [search, threads]);

  return (
    <main className={`${styles.main} ${messageStyles.messagesMain}`}>
      <header className={messageStyles.messagesHeader}>
        <div>
          <p className={styles.eyebrow}>COACH COMMUNICATIONS</p>
          <h1 className={styles.title}>Keep the corner connected</h1>
          <p className={styles.copy}>
            One place for athlete conversations and clear class-wide updates.
          </p>
        </div>
        <nav aria-label="Coach navigation">
          <Link href="/coach">Coach home</Link>
          <Link href="/coach/roster">Roster</Link>
        </nav>
      </header>

      <section className={messageStyles.messagePulse} aria-label="Message summary">
        <div>
          <strong>{threads.length}</strong>
          <span>Conversations</span>
        </div>
        <div>
          <strong>
            {threads.filter((thread) => thread.kind === "direct").length}
          </strong>
          <span>Athlete threads</span>
        </div>
        <div>
          <strong>
            {threads.filter((thread) => thread.kind === "class_broadcast").length}
          </strong>
          <span>Class broadcasts</span>
        </div>
        <div>
          <strong>{roster.length}</strong>
          <span>Current class reach</span>
        </div>
      </section>

      <div aria-live="polite">
        {error ? <p className={styles.error}>{error}</p> : null}
        {message ? <p className={messageStyles.messageSuccess}>{message}</p> : null}
      </div>

      <div className={messageStyles.communicationGrid}>
        <aside className={messageStyles.inbox}>
          <div className={messageStyles.inboxHeading}>
            <div>
              <p className={styles.eyebrow}>INBOX</p>
              <h2>Conversations</h2>
            </div>
            <span>Live · 15s</span>
          </div>
          <label className={messageStyles.threadSearch}>
            <span>Search messages</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Athlete, class or message…"
            />
          </label>
          <ul className={messageStyles.threadList}>
            {filteredThreads.map((thread) => {
              const latest = thread.messages?.[0];
              const broadcast = thread.kind === "class_broadcast";
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    className={activeId === thread.id ? messageStyles.threadActive : ""}
                    onClick={() => void openThread(thread.id)}
                  >
                    <span
                      className={`${messageStyles.threadIcon} ${
                        broadcast ? messageStyles.broadcastIcon : ""
                      }`}
                      aria-hidden
                    >
                      {broadcast ? "B" : thread.subject.slice(0, 1)}
                    </span>
                    <span className={messageStyles.threadCopy}>
                      <strong>{thread.subject}</strong>
                      <span>{latest?.body ?? "Open conversation"}</span>
                      <small>
                        {broadcast ? "Class broadcast" : "Direct"}
                        {latest?.createdAt
                          ? ` · ${new Date(latest.createdAt).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}`
                          : ""}
                      </small>
                    </span>
                  </button>
                </li>
              );
            })}
            {filteredThreads.length === 0 ? (
              <li className={messageStyles.inboxEmpty}>
                {threads.length === 0
                  ? "No conversations yet."
                  : "No messages match that search."}
              </li>
            ) : null}
          </ul>
        </aside>

        <div className={messageStyles.conversationStack}>
          {detail && activeId ? (
            <section className={messageStyles.conversation}>
              <header>
                <div>
                  <p className={styles.eyebrow}>
                    {detail.kind === "class_broadcast"
                      ? "CLASS BROADCAST"
                      : "DIRECT THREAD"}
                  </p>
                  <h2>{detail.subject}</h2>
                </div>
                <span>{detail.messages.length} messages</span>
              </header>
              <ul className={messageStyles.messageList}>
                {detail.messages.map((entry) => (
                  <li
                    key={entry.id}
                    className={entry.mine ? messageStyles.messageMine : ""}
                  >
                    <div>
                      <span>{entry.mine ? "You" : entry.sender}</span>
                      <small>
                        {new Date(entry.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                    <p>{entry.body}</p>
                  </li>
                ))}
              </ul>
              <form className={messageStyles.replyBar} onSubmit={sendReply}>
                <label>
                  <span>Reply to this conversation</span>
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    rows={2}
                    placeholder="Write a clear, useful reply…"
                  />
                </label>
                <Button type="submit" disabled={busy || !reply.trim()}>
                  {busy ? "Sending…" : "Send reply"}
                </Button>
              </form>
            </section>
          ) : (
            <section className={messageStyles.conversationEmpty}>
              <span aria-hidden>S</span>
              <p className={styles.eyebrow}>SULLY&apos;S CORNER</p>
              <h2>Select a conversation</h2>
              <p>Open an athlete thread or compose a new message below.</p>
            </section>
          )}

          <section className={messageStyles.composer}>
            <div className={messageStyles.composerHeading}>
              <div>
                <p className={styles.eyebrow}>NEW MESSAGE</p>
                <h2>Reach the right people</h2>
              </div>
              <div className={messageStyles.composeTabs}>
                <button
                  type="button"
                  className={composeMode === "direct" ? messageStyles.tabActive : ""}
                  onClick={() => setComposeMode("direct")}
                >
                  Athlete
                </button>
                <button
                  type="button"
                  className={
                    composeMode === "broadcast" ? messageStyles.tabActive : ""
                  }
                  onClick={() => setComposeMode("broadcast")}
                >
                  Class
                </button>
              </div>
            </div>

            <div className={messageStyles.composeFields}>
              <label className={styles.field}>
                <span>Class context</span>
                <select
                  className={styles.input}
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                >
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title}
                    </option>
                  ))}
                </select>
              </label>
              {composeMode === "direct" ? (
                <label className={styles.field}>
                  <span>Athlete</span>
                  <select
                    className={styles.input}
                    value={athleteId}
                    onChange={(event) => setAthleteId(event.target.value)}
                  >
                    {roster.map((athlete) => (
                      <option key={athlete.userId} value={athlete.userId}>
                        {athlete.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className={messageStyles.broadcastReach}>
                  <strong>{roster.length}</strong>
                  <span>booked athletes will receive this update</span>
                </div>
              )}
              <label className={`${styles.field} ${messageStyles.composeMessage}`}>
                <span>Message</span>
                <textarea
                  className={styles.input}
                  rows={4}
                  value={composeBody}
                  onChange={(event) => setComposeBody(event.target.value)}
                  placeholder={
                    composeMode === "broadcast"
                      ? "Example: Bring wraps tonight. We start on the bags."
                      : "Write a focused athlete message…"
                  }
                />
              </label>
            </div>

            <div className={messageStyles.composeAction}>
              <p>
                {composeMode === "broadcast"
                  ? "Class broadcasts go to every active booking."
                  : "Direct messages stay in the athlete conversation."}
              </p>
              <Button
                type="button"
                disabled={
                  busy ||
                  !composeBody.trim() ||
                  !sessionId ||
                  (composeMode === "direct" && !athleteId)
                }
                onClick={() =>
                  void (composeMode === "direct" ? composeDirect() : broadcast())
                }
              >
                {busy
                  ? "Sending…"
                  : composeMode === "direct"
                    ? "Send to athlete"
                    : `Broadcast to ${roster.length}`}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
