"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, get, post } from "@/lib/api";
import styles from "../coach.module.css";
import builderStyles from "./builder.module.css";

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
  { phase: "warmup", title: "Warmup", notes: "", durationSec: 300 },
  { phase: "round", title: "Round 1", notes: "", durationSec: 180 },
  { phase: "round", title: "Round 2", notes: "", durationSec: 180 },
  { phase: "round", title: "Round 3", notes: "", durationSec: 180 },
  { phase: "cooldown", title: "Cooldown", notes: "", durationSec: 300 },
];

function cloneEmpty() {
  return EMPTY.map((block) => ({ ...block }));
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function CoachBuilderPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("Sully's Boxing Fundamentals");
  const [description, setDescription] = useState("");
  const [kidsMode, setKidsMode] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>(cloneEmpty);
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

  const totalDuration = useMemo(
    () => blocks.reduce((total, block) => total + (block.durationSec ?? 0), 0),
    [blocks],
  );

  function updateBlock(index: number, patch: Partial<Block>) {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    );
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  function duplicateBlock(index: number) {
    setBlocks((current) => [
      ...current.slice(0, index + 1),
      { ...current[index]!, title: `${current[index]!.title} copy` },
      ...current.slice(index + 1),
    ]);
  }

  return (
    <main className={`${styles.shell} ${builderStyles.builderShell}`}>
      <nav className={styles.topNav}>
        <Link href="/coach">Home</Link>
        <Link href="/coach/roster">Roster</Link>
        <Link href="/coach/builder">Builder</Link>
        <Link href="/">Staff hub</Link>
      </nav>
      <header className={builderStyles.builderHeader}>
        <div>
          <p className={styles.eyebrow}>CLASS BUILDER</p>
          <h1 className={styles.title}>Program every bell</h1>
          <p className={styles.meta}>
            Build the full class flow once, then drive Coach Live and Floor TV
            from the same plan.
          </p>
        </div>
        <div className={builderStyles.builderSummary}>
          <span>{blocks.length} blocks</span>
          <strong>{formatDuration(totalDuration)}</strong>
          <small>planned class time</small>
        </div>
      </header>

      <div aria-live="polite">
        {error ? <p className={styles.error}>{error}</p> : null}
        {message ? <p className={builderStyles.saveMessage}>{message}</p> : null}
      </div>

      <div className={builderStyles.builderLayout}>
        <aside className={builderStyles.templateLibrary}>
          <div className={builderStyles.libraryHeading}>
            <div>
              <p className={styles.eyebrow}>WORKOUT LIBRARY</p>
              <h2>Saved classes</h2>
            </div>
            <span>{templates.length}</span>
          </div>
          <button
            type="button"
            className={builderStyles.newTemplate}
            onClick={() => {
              setEditId(null);
              setName("New class");
              setDescription("");
              setBlocks(cloneEmpty());
              setKidsMode(false);
            }}
          >
            <span>+</span>
            Start a new class
          </button>
          <ul>
            {templates.map((template) => {
              const duration = template.blocks.reduce(
                (total, block) => total + (block.durationSec ?? 0),
                0,
              );
              return (
                <li key={template.id}>
                  <button
                    type="button"
                    className={
                      editId === template.id ? builderStyles.templateActive : ""
                    }
                    onClick={() => loadTemplate(template)}
                  >
                    <strong>{template.name}</strong>
                    <span>
                      {template.blocks.length} blocks · {formatDuration(duration)}
                    </span>
                    <small>
                      {template.kidsMode ? "Kids program" : "All-level program"}
                    </small>
                  </button>
                </li>
              );
            })}
            {templates.length === 0 ? (
              <li className={builderStyles.libraryEmpty}>
                Save your first workout to build the library.
              </li>
            ) : null}
          </ul>
        </aside>

        <section className={builderStyles.programEditor}>
          <div className={builderStyles.programMeta}>
            <label>
              <span>Class name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              <span>Coach intention</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What should athletes leave with?"
              />
            </label>
            <label className={builderStyles.kidsToggle}>
              <input
                type="checkbox"
                checked={kidsMode}
                onChange={(event) => setKidsMode(event.target.checked)}
              />
              <span>
                <strong>Kids mode</strong>
                Simplified Floor TV language and cues
              </span>
            </label>
          </div>

          <div className={builderStyles.flowHeading}>
            <div>
              <p className={styles.eyebrow}>CLASS FLOW</p>
              <h2>Round-by-round plan</h2>
            </div>
            <span>Drag-free controls · safe on tablets</span>
          </div>

          <div className={builderStyles.blockList}>
            {blocks.map((block, index) => (
              <article
                key={`${index}-${block.phase}`}
                className={builderStyles.programBlock}
                data-phase={block.phase}
              >
                <div className={builderStyles.blockNumber}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, -1)}
                      aria-label={`Move ${block.title} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, 1)}
                      aria-label={`Move ${block.title} down`}
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <div className={builderStyles.blockFields}>
                  <label>
                    <span>Phase</span>
                    <select
                      value={block.phase}
                      onChange={(event) =>
                        updateBlock(index, { phase: event.target.value })
                      }
                    >
                      <option value="warmup">Warmup</option>
                      <option value="round">Round</option>
                      <option value="work">Work</option>
                      <option value="rest">Rest</option>
                      <option value="cooldown">Cooldown</option>
                    </select>
                  </label>
                  <label className={builderStyles.titleField}>
                    <span>Floor TV title</span>
                    <input
                      value={block.title}
                      placeholder="Heavy Bag Power"
                      onChange={(event) =>
                        updateBlock(index, { title: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Duration</span>
                    <select
                      value={block.durationSec ?? 180}
                      onChange={(event) =>
                        updateBlock(index, {
                          durationSec: Number(event.target.value),
                        })
                      }
                    >
                      <option value={60}>1:00</option>
                      <option value={90}>1:30</option>
                      <option value={120}>2:00</option>
                      <option value={180}>3:00</option>
                      <option value={300}>5:00</option>
                      <option value={600}>10:00</option>
                    </select>
                  </label>
                  <label className={builderStyles.notesField}>
                    <span>Coach cues</span>
                    <input
                      value={block.notes}
                      placeholder="Six-punch combinations · finish with a slip"
                      onChange={(event) =>
                        updateBlock(index, { notes: event.target.value })
                      }
                    />
                  </label>
                </div>
                <div className={builderStyles.blockActions}>
                  <button type="button" onClick={() => duplicateBlock(index)}>
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBlocks((current) =>
                        current.filter((_, blockIndex) => blockIndex !== index),
                      )
                    }
                    disabled={blocks.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className={builderStyles.addBlockRail}>
            {(["warmup", "round", "rest", "cooldown"] as const).map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() =>
                  setBlocks((current) => [
                    ...current,
                    {
                      phase,
                      title:
                        phase === "round"
                          ? `Round ${current.filter((b) => b.phase === "round").length + 1}`
                          : phase.charAt(0).toUpperCase() + phase.slice(1),
                      notes: "",
                      durationSec:
                        phase === "round" ? 180 : phase === "rest" ? 60 : 300,
                    },
                  ])
                }
              >
                + {phase}
              </button>
            ))}
          </div>

          <div className={builderStyles.floorPreview}>
            <div>
              <p className={styles.eyebrow}>FLOOR TV PREVIEW</p>
              <h3>{blocks[0]?.title || "First block"}</h3>
              <span>
                {blocks[1] ? `Next: ${blocks[1].title}` : "Add the next block"}
              </span>
            </div>
            <strong>
              {blocks[0] ? formatDuration(blocks[0].durationSec ?? 0) : "0:00"}
            </strong>
          </div>

          <div className={builderStyles.saveRail}>
            <div>
              <strong>{name || "Untitled class"}</strong>
              <span>
                {blocks.length} blocks · {formatDuration(totalDuration)}
                {kidsMode ? " · Kids mode" : ""}
              </span>
            </div>
            <button
              type="button"
              disabled={busy || !name.trim() || blocks.length === 0}
              onClick={() => void save()}
            >
              {busy ? "Saving…" : editId ? "Update template" : "Save template"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
