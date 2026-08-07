"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { get } from "@/lib/api";
import { getMe, logout, type AuthUser } from "@/lib/auth-client";
import styles from "../ui.module.css";

type Membership = {
  id: string;
  productName?: string;
  planName?: string;
  status?: string;
  renewsAt?: string;
};

type MembershipsResponse = {
  memberships?: Membership[];
  items?: Membership[];
};

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [user, membershipData] = await Promise.all([
          getMe(),
          get<MembershipsResponse>("/api/v1/memberships/me").catch(
            (): MembershipsResponse => ({ memberships: [] }),
          ),
        ]);
        if (!active) return;
        setMe(user);
        setMemberships(
          membershipData.memberships ?? membershipData.items ?? [],
        );
      } catch {
        if (active) {
          setMe(null);
          setMemberships([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function onLogout() {
    try {
      await logout();
    } finally {
      router.push("/app/login");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.lead}>
          Your member details, memberships, and training history.
        </p>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading profile…</p>
      ) : !me ? (
        <div className={styles.empty}>
          <p className={styles.muted}>Sign in to view your profile.</p>
          <div className={styles.actionsRow}>
            <Link href="/app/login">
              <Button type="button">Sign in</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className={styles.card}>
            <p className={styles.rowTitle}>{me.name}</p>
            <p className={styles.rowMeta}>{me.email}</p>
          </section>

          <section className={styles.page}>
            <h2 className={styles.rowTitle}>Memberships</h2>
            {memberships.length === 0 ? (
              <div className={styles.empty}>No active memberships on file.</div>
            ) : (
              <ul className={styles.list}>
                {memberships.map((m) => (
                  <li key={m.id} className={styles.row}>
                    <div className={styles.rowTop}>
                      <div>
                        <p className={styles.rowTitle}>
                          {m.productName ?? m.planName ?? "Plan"}
                        </p>
                        {m.renewsAt ? (
                          <p className={styles.rowMeta}>
                            Renews {new Date(m.renewsAt).toLocaleDateString()}
                          </p>
                        ) : null}
                      </div>
                      <span className={styles.badge}>{m.status ?? "active"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className={styles.actions}>
            <Link href="/app/passport">
              <Button type="button" variant="secondary">
                Boxing Passport
              </Button>
            </Link>
            <Link href="/app/billing">
              <Button type="button" variant="secondary">
                Billing & payments
              </Button>
            </Link>
            <Link href="/app/waiver">
              <Button type="button" variant="secondary">
                Liability waiver
              </Button>
            </Link>
            <Link href="/app/nutrition">
              <Button type="button" variant="secondary">
                Nutrition & kitchen
              </Button>
            </Link>
            <Link href="/app/attendance">
              <Button type="button" variant="ghost">
                Attendance history
              </Button>
            </Link>
            <Link href="/app/family">
              <Button type="button" variant="ghost">
                Family
              </Button>
            </Link>
            <Button type="button" variant="ghost" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
