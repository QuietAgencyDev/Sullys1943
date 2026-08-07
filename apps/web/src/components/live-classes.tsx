import type { LiveClass } from "@sullys/types";
import styles from "./live-classes.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchLiveClasses(): Promise<LiveClass[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/classes/live`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return fallbackClasses;
    const data = (await res.json()) as { classes: LiveClass[] };
    return data.classes ?? fallbackClasses;
  } catch {
    return fallbackClasses;
  }
}

const fallbackClasses: LiveClass[] = [
  {
    id: "1",
    startsAt: "12:00 PM",
    name: "Beginner Boxing",
    spotsLeft: 8,
    capacity: 16,
    status: "open",
  },
  {
    id: "2",
    startsAt: "6:00 PM",
    name: "Competitive Team",
    spotsLeft: 0,
    capacity: 12,
    status: "full",
  },
  {
    id: "3",
    startsAt: "7:00 PM",
    name: "Women's Boxing",
    spotsLeft: 5,
    capacity: 14,
    status: "open",
  },
];

export async function LiveClasses() {
  const classes = await fetchLiveClasses();

  return (
    <section id="classes" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>On the floor</p>
          <h2 className={styles.title}>Boxing is the engine</h2>
          <p className={styles.copy}>
            Structured classes that teach discipline, focus, and emotional
            regulation — then open the door to everything else.
          </p>
        </div>

        <ul className={styles.list}>
          {classes.map((session) => (
            <li key={session.id} className={styles.row}>
              <time className={styles.time}>{session.startsAt}</time>
              <div className={styles.meta}>
                <p className={styles.name}>{session.name}</p>
                <p
                  className={
                    session.status === "full" ? styles.full : styles.spots
                  }
                >
                  {session.status === "full"
                    ? "Full"
                    : `${session.spotsLeft} Spots Left`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
