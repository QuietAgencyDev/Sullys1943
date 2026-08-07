"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { get } from "@/lib/api";
import styles from "../ui.module.css";

type AttendanceRow = {
  id: string;
  sessionName?: string;
  title?: string;
  checkedInAt?: string;
  occurredAt?: string;
  status?: string;
};

type AttendanceResponse = {
  attendance?: AttendanceRow[];
  items?: AttendanceRow[];
};

function formatWhen(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AttendancePage() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await get<AttendanceResponse>("/api/v1/attendance/me");
        if (!active) return;
        setRows(data.attendance ?? data.items ?? []);
      } catch {
        if (active) setRows([]);
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
        <p className={styles.eyebrow}>History</p>
        <h1 className={styles.title}>Attendance</h1>
        <p className={styles.lead}>
          Your check-in ledger — classes you showed up for.
        </p>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading attendance…</p>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>No attendance records yet.</div>
      ) : (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.id} className={styles.row}>
              <div className={styles.rowTop}>
                <div>
                  <p className={styles.rowTitle}>
                    {row.sessionName ?? row.title ?? "Session"}
                  </p>
                  <p className={styles.rowMeta}>
                    {formatWhen(row.checkedInAt ?? row.occurredAt)}
                  </p>
                </div>
                {row.status ? (
                  <span className={styles.badgeMuted}>{row.status}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actionsRow}>
        <Link href="/app/profile">
          <Button type="button" variant="secondary">
            Back to profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
