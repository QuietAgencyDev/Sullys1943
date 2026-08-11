"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, post } from "@/lib/api";
import styles from "../staff.module.css";
import { GYM } from "@/lib/gym-info";

type MemberHit = { id: string; name: string; email: string };
type Session = {
  id: string;
  title: string;
  startsAt: string;
  booked: number;
  capacity: number;
};

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function DeskPage() {
  const [token, setToken] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<MemberHit[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [lastFailedEmail, setLastFailedEmail] = useState<string | null>(null);
  const [dropName, setDropName] = useState("");
  const [dropEmail, setDropEmail] = useState("");
  const [dropCheckIn, setDropCheckIn] = useState(true);
  const [parentEmail, setParentEmail] = useState("parent@sullys.local");
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [childDob, setChildDob] = useState("");
  const [createChild, setCreateChild] = useState(true);
  const [addToMembership, setAddToMembership] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(sessionId);
  const overrideRef = useRef(override);
  const reasonRef = useRef(overrideReason);
  sessionIdRef.current = sessionId;
  overrideRef.current = override;
  reasonRef.current = overrideReason;

  useEffect(() => {
    get<{ sessions: Session[] }>("/api/v1/sessions")
      .then((res) => {
        const today = res.sessions.filter((s) => isToday(s.startsAt));
        setSessions(today);
        if (today[0]) setSessionId(today[0].id);
      })
      .catch(() => setSessions([]));
    inputRef.current?.focus();
  }, []);

  const submitScan = useCallback(
    async (raw: string, email?: string) => {
      const value = raw.trim();
      if ((!value && !email) || busy) return;
      setBusy(true);
      setError(null);
      setMessage(null);
      try {
        const res = await post<{
          member?: { name: string };
          xpAwarded?: number;
          duplicate?: boolean;
          overridden?: boolean;
          flags?: string[];
        }>("/api/v1/check-in/scan", {
          ...(email ? { email } : { token: value }),
          sessionId: sessionIdRef.current || undefined,
          override: overrideRef.current || undefined,
          overrideReason: overrideRef.current
            ? reasonRef.current
            : undefined,
        });
        const flagNote =
          res.overridden && res.flags?.length
            ? ` · OVERRIDE (${res.flags.join(", ")})`
            : "";
        setMessage(
          res.duplicate
            ? `Already checked in: ${res.member?.name ?? "member"}`
            : `Checked in ${res.member?.name ?? "member"} · +${res.xpAwarded ?? 10} XP${flagNote}`,
        );
        setToken("");
        setLastFailedEmail(null);
        setOverride(false);
        setOverrideReason("");
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Scan failed";
        setError(msg);
        setToken("");
        if (email) setLastFailedEmail(email);
        if (
          msg.toLowerCase().includes("waiver") ||
          msg.toLowerCase().includes("membership")
        ) {
          setOverride(true);
        }
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy],
  );

  function onTokenKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void submitScan(token);
    }
  }

  function onTokenChange(value: string) {
    if (value.includes("\n") || value.includes("\r")) {
      const cleaned = value.replace(/[\r\n]+/g, "").trim();
      setToken(cleaned);
      void submitScan(cleaned);
      return;
    }
    setToken(value);
  }

  async function scanToken(e: FormEvent) {
    e.preventDefault();
    await submitScan(token);
  }

  async function search(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await get<{ members: MemberHit[] }>(
        `/api/v1/check-in/search?q=${encodeURIComponent(query)}`,
      );
      setHits(res.members);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed");
    }
  }

  async function sellDropIn(tender: "cash" | "card") {
    if (!dropName.trim() || !dropEmail.trim() || busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{
        member: { name: string; email: string };
        amountCents: number;
        productName: string;
        tender?: string;
        checkIn?: { xpAwarded?: number } | null;
      }>("/api/v1/desk/drop-in", {
        name: dropName.trim(),
        email: dropEmail.trim(),
        sessionId: sessionId || undefined,
        checkIn: dropCheckIn,
        tender,
      });
      const tenderLabel =
        (res.tender || tender) === "cash"
          ? "CASH"
          : (res.tender || tender) === "card"
            ? "CARD"
            : String(res.tender || tender).toUpperCase();
      setMessage(
        `Sold ${res.productName} ($${(res.amountCents / 100).toFixed(2)}) · ${tenderLabel} · ${res.member.name}${
          res.checkIn ? ` · checked in +${res.checkIn.xpAwarded ?? 10} XP` : ""
        }`,
      );
      setDropName("");
      setDropEmail("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Drop-in sale failed");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  async function linkFamily(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{
        alreadyLinked?: boolean;
        parent: { name: string; email: string };
        child: { name: string; email: string };
        waiverStatus: string;
        membershipNote: string | null;
      }>("/api/v1/desk/family/link", {
        parentEmail: parentEmail.trim(),
        childName: childName.trim() || undefined,
        childEmail: childEmail.trim() || undefined,
        childDob: childDob || undefined,
        createChildIfMissing: createChild,
        addToParentMembership: addToMembership,
      });
      setMessage(
        `${res.alreadyLinked ? "Already linked" : "Linked"}: ${res.child.name} → ${res.parent.name} (${res.parent.email}). Waiver ${res.waiverStatus}${res.membershipNote ? ` · ${res.membershipNote}` : ""}`,
      );
      setChildName("");
      setChildEmail("");
      setChildDob("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Family link failed");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.softLaunch}>
        <p className={styles.softLaunchTitle}>{GYM.name}</p>
        <p className={styles.softLaunchMeta}>
          <a href={GYM.mapUrl} target="_blank" rel="noreferrer">
            {GYM.addressLine1}
          </a>
          {" · "}
          <a href={`tel:${GYM.phoneTel}`}>{GYM.phoneDisplay}</a>
        </p>
        <p className={styles.softLaunchMeta}>{GYM.hoursSummary}</p>
      </div>
      <p className={styles.eyebrow}>FRONT DESK</p>
      <h1 className={styles.title}>Scanner</h1>
      <p className={styles.copy}>
        USB scanner → focused field → auto check-in. Attach today&apos;s class
        for late flags. Staff override available when waiver/membership blocks.
      </p>
      <p>
        <Link href="/">← Staff home</Link>
      </p>

      <form className={styles.panel} onSubmit={scanToken}>
        <label className={styles.field}>
          <span>Today&apos;s session</span>
          <select
            className={styles.input}
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          >
            <option value="">Open gym / no class</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.startsAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · {s.title} ({s.booked}/{s.capacity})
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Scan target (keep focused)</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            onKeyDown={onTokenKeyDown}
            placeholder="Waiting for scanner…"
            autoComplete="off"
            autoFocus
            disabled={busy}
          />
        </label>

        <label className={styles.field}>
          <span>
            <input
              type="checkbox"
              checked={override}
              onChange={(e) => setOverride(e.target.checked)}
            />{" "}
            Staff override (waiver / membership)
          </span>
        </label>
        {override ? (
          <label className={styles.field}>
            <span>Override reason (required)</span>
            <input
              className={styles.input}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Parent bringing signed paper waiver"
            />
          </label>
        ) : null}

        <Button type="submit" disabled={busy || !token.trim()}>
          {busy ? "Checking in…" : "Submit token"}
        </Button>
        {lastFailedEmail && override ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy || overrideReason.trim().length < 4}
            onClick={() => submitScan("", lastFailedEmail)}
          >
            Override check-in for {lastFailedEmail}
          </Button>
        ) : null}
      </form>

      <form className={styles.panel} onSubmit={search}>
        <label className={styles.field}>
          <span>Member search</span>
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email"
          />
        </label>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className={styles.panel}>
        <p className={styles.copy}>
          <strong>Sell drop-in</strong> — walk-in without membership ($25
          same-day). Choose tender so owner analytics tracks cash vs card.
        </p>
        <label className={styles.field}>
          <span>Guest name</span>
          <input
            className={styles.input}
            value={dropName}
            onChange={(e) => setDropName(e.target.value)}
            placeholder="Alex Walkin"
          />
        </label>
        <label className={styles.field}>
          <span>Guest email</span>
          <input
            className={styles.input}
            type="email"
            value={dropEmail}
            onChange={(e) => setDropEmail(e.target.value)}
            placeholder="walkin@example.com"
          />
        </label>
        <label className={styles.field}>
          <span>
            <input
              type="checkbox"
              checked={dropCheckIn}
              onChange={(e) => setDropCheckIn(e.target.checked)}
            />{" "}
            Check in immediately after sale
          </span>
        </label>
        <div className={styles.actions}>
          <Button
            type="button"
            disabled={busy || !dropName.trim() || !dropEmail.trim()}
            onClick={() => sellDropIn("cash")}
          >
            {busy ? "Selling…" : "CASH"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || !dropName.trim() || !dropEmail.trim()}
            onClick={() => sellDropIn("card")}
          >
            {busy ? "Selling…" : "CARD"}
          </Button>
        </div>
      </div>

      <form className={styles.panel} onSubmit={linkFamily}>
        <p className={styles.copy}>
          <strong>Link child to parent</strong> — creates youth profile if
          needed, guardianship, required waiver packet, and optional membership
          attach.
        </p>
        <label className={styles.field}>
          <span>Parent email</span>
          <input
            className={styles.input}
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          <span>Child name</span>
          <input
            className={styles.input}
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Emma Kid"
            required={createChild}
          />
        </label>
        <label className={styles.field}>
          <span>Child email (optional if creating)</span>
          <input
            className={styles.input}
            type="email"
            value={childEmail}
            onChange={(e) => setChildEmail(e.target.value)}
            placeholder="Leave blank to auto-generate"
          />
        </label>
        <label className={styles.field}>
          <span>Child date of birth</span>
          <input
            className={styles.input}
            type="date"
            value={childDob}
            onChange={(e) => setChildDob(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>
            <input
              type="checkbox"
              checked={createChild}
              onChange={(e) => setCreateChild(e.target.checked)}
            />{" "}
            Create child account if missing
          </span>
        </label>
        <label className={styles.field}>
          <span>
            <input
              type="checkbox"
              checked={addToMembership}
              onChange={(e) => setAddToMembership(e.target.checked)}
            />{" "}
            Add child to parent&apos;s active membership
          </span>
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Linking…" : "Link family"}
        </Button>
      </form>

      {message ? <p className={styles.copy}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <ul className={styles.list}>
        {hits.map((m) => (
          <li key={m.id} className={styles.item}>
            <strong>{m.name}</strong>
            <div className={styles.meta}>{m.email}</div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.buttonish}
                onClick={() => submitScan("", m.email)}
              >
                Check in
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
