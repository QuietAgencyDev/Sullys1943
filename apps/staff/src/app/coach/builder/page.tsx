"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, get, post } from "@/lib/api";
import styles from "../coach.module.css";

type Block = {
  phase: string;
  title: string;
  notes: string;
  durationSec?: number | null;
};

type Template = {
  id: string;
  name: string;
  description: string;
  kidsMode: boolean;
  blocks: Block[];
};

const EMPTY: Block[] = [
  { phase: "warmup", title: "WARMUP", notes: "" },
  { phase: "round", title: "ROUND 1", notes: "" },
  { phase: "round", title: "ROUND 2", notes: "" },
  { phase: "round", title: "ROUND 3", notes: "" },
  { phase: "cooldown", title: "COOLDOWN", notes: "" },
];

export default function CoachBuilderPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("Sully's Boxing Fundamentals");
  const [description, setDescription] = useState("");
  const [kidsMode, setKidsMode] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await get<{ templates: Template[] }>(
      "/api/v1/coach/workouts/templates",
    );
    setTemplates(res.templates);
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof ApiError ? err.message : "Load failed"),
    );
  }, []);

  function loadTemplate(t: Template) {
    setEditId(t.id);
    setName(t.name);
    setDescription(t.description);
    setKidsMode(t.kidsMode);
    setBlocks(
      t.blocks.map((b) => ({
        phase: b.phase,
        title: b.title,
        notes: b.notes,
        durationSec: b.durationSec,
      })),
    );
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await post("/api/v1/coach/workouts/templates", {
        id: editId ?? undefined,
        name,
        description,
        kidsMode,
        blocks,
      });
      setMessage("Template saved");
      setEditId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.shell}>
      <nav className={styles.topNav}>
        <Link href="/coach">Home</Link>
        <Link href="/coach/roster">Roster</Link>
        <Link href="/coach/builder">Builder</Link>
        <Link href="/">Staff hub</Link>
      </nav>
      <p className={styles.eyebrow}>CLASS BUILDER</p>
      <h1 className={styles.title}>Workout templates</h1>
      <p className={styles.meta}>
        Simple round lists — attach from Live Class Mode.
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.ok}>{message}</p> : null}

      <div className={`${styles.grid} ${styles.grid2}`}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Saved</p>
          <ul className={styles.list}>
            {templates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={styles.row}
                  onClick={() => loadTemplate(t)}
                >
                  <span className={styles.rowTitle}>{t.name}</span>
                  <span className={styles.rowMeta}>
                    {t.blocks.length} blocks
                    {t.kidsMode ? " · kids" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.primary}
            style={{ width: "100%", marginTop: "0.75rem" }}
            onClick={() => {
              setEditId(null);
              setName("New class");
              setBlocks(EMPTY);
              setKidsMode(false);
            }}
          >
            New template
          </button>
        </section>

        <section className={styles.card}>
          <label className={styles.hint}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={styles.hint}>
            Description
            <input
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className={styles.hint}>
            <input
              type="checkbox"
              checked={kidsMode}
              onChange={(e) => setKidsMode(e.target.checked)}
            />{" "}
            Kids mode template
          </label>

          {blocks.map((b, i) => (
            <div key={i} className={styles.blockEditor}>
              <select
                value={b.phase}
                onChange={(e) => {
                  const next = [...blocks];
                  next[i] = { ...b, phase: e.target.value };
                  setBlocks(next);
                }}
              >
                <option value="warmup">Warmup</option>
                <option value="round">Round</option>
                <option value="work">Work</option>
                <option value="cooldown">Cooldown</option>
              </select>
              <input
                value={b.title}
                placeholder="Title"
                onChange={(e) => {
                  const next = [...blocks];
                  next[i] = { ...b, title: e.target.value };
                  setBlocks(next);
                }}
              />
              <button
                type="button"
                onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setBlocks([
                ...blocks,
                { phase: "round", title: `ROUND ${blocks.length}`, notes: "" },
              ])
            }
          >
            Add block
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={busy}
            style={{ width: "100%", marginTop: "0.75rem" }}
            onClick={() => void save()}
          >
            Save template
          </button>
        </section>
      </div>
    </main>
  );
}
