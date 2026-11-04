"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMe, type AuthUser } from "@/lib/auth-client";
import styles from "../ui.module.css";

const STAFF = new Set(["owner", "admin", "coach", "front_desk"]);
const OWNERS = new Set(["owner", "admin"]);

export default function MemberManualsPage() {
  const [me, setMe] = useState<AuthUser | null>(null);

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null));
  }, []);

  const role = me?.role ?? "member";

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Private</p>
        <h1 className={styles.title}>Manuals</h1>
        <p className={styles.lead}>
          These stay inside a signed-in account. They are not on the public site.
        </p>
      </div>
      {!me ? (
        <p className={styles.muted}>
          <Link href="/app/login">Sign in</Link> to open a manual.
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
    </div>
  );
}
