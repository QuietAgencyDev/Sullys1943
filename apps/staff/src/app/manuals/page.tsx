"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { me } from "@/lib/auth";
import styles from "../staff.module.css";

const STAFF = new Set(["owner", "admin", "coach", "front_desk"]);
const OWNERS = new Set(["owner", "admin"]);

export default function StaffManualsPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    me().then((data) => {
      const user = data?.user ?? data;
      setRole(user?.role ?? null);
    });
  }, []);

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>PRIVATE</p>
      <h1 className={styles.title}>Manuals</h1>
      <p className={styles.copy}>
        Company papers. Sign-in required. Nothing here is on the public website.
      </p>
      {!role ? (
        <p className={styles.copy}>
          <Link href="/">Sign in</Link> to open a document.
        </p>
      ) : (
        <div className={styles.actions}>
          <a href="/api/v1/manuals/member-guide">Member and family guide</a>
          {STAFF.has(role) ? (
            <a href="/api/v1/manuals/owner-manual">Owner and staff manual</a>
          ) : null}
          {OWNERS.has(role) ? (
            <>
              <a href="/api/v1/manuals/app-costs">App hard costs</a>
              <a href="/api/v1/manuals/for-danielle">Brief for Danielle</a>
            </>
          ) : null}
        </div>
      )}
    </main>
  );
}
