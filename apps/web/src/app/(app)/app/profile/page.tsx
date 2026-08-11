"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { get } from "@/lib/api";
import { getMe, logout, type AuthUser } from "@/lib/auth-client";
import { resolveMemberPhoto } from "@/lib/member-photo";
import { FighterRecordLinks } from "@/components/fighter-verification/FighterRecordLinks";
import { FighterVerificationForm } from "@/components/fighter-verification/FighterVerificationForm";
import type { FighterVerification } from "@/components/fighter-verification/types";
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

const EMPTY_FIGHTER: FighterVerification = {
  isCompetitiveFighter: false,
  boxingOntarioRegNum: null,
  boxrecIdPro: null,
  boxrecIdAmateur: null,
};

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [fighter, setFighter] = useState<FighterVerification | null>(null);
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

        // Separate fighter payload — do not fold into getMe / auth-client
        const fighterData = await get<FighterVerification>(
          "/api/v1/fighter-verification/me",
        ).catch(() => EMPTY_FIGHTER);
        if (!active) return;
        setFighter(fighterData);
      } catch {
        if (active) {
          setMe(null);
          setMemberships([]);
          setFighter(null);
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

  // Demo member portrait until AI member-photo system lands
  const profilePhoto = resolveMemberPhoto({
    photoUrl: me?.photoUrl,
    name: me?.name,
    email: me?.email,
  });

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
            <div className={styles.identityRow}>
              {profilePhoto ? (
                <img
                  className={styles.profilePhoto}
                  src={profilePhoto}
                  alt=""
                />
              ) : null}
              <div className={styles.identityText}>
                <p className={styles.rowTitle}>{me.name}</p>
                <p className={styles.rowMeta}>{me.email}</p>
              </div>
            </div>
          </section>

          <FighterRecordLinks profile={fighter} />
          <FighterVerificationForm
            initial={fighter}
            onSaved={(next) => setFighter(next)}
          />

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
