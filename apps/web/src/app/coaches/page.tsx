"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApiError, get } from "@/lib/api";
import styles from "./coaches.module.css";

type Coach = {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
};

function CoachCard({ coach }: { coach: Coach }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = Boolean(coach.photoUrl) && !imgFailed;

  return (
    <li className={styles.card}>
      <div className={styles.photoWrap}>
        {showPhoto ? (
          <Image
            src={coach.photoUrl!}
            alt={coach.name}
            fill
            className={styles.photo}
            sizes="(max-width: 720px) 100vw, 320px"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={styles.photoFallback} aria-hidden>
            {coach.name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.role}>{coach.title}</p>
        <h2 className={styles.name}>{coach.name}</h2>
        <p className={styles.bio}>{coach.bio}</p>
      </div>
    </li>
  );
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await get<{ coaches: Coach[] }>("/api/v1/portal/coaches");
        if (!active) return;
        setCoaches(data.coaches ?? []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load coaches right now.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>The floor</p>
        <h1 className={styles.title}>Coaches</h1>
        <p className={styles.copy}>
          The floor staff at Canada&apos;s oldest boxing gym — champions,
          competitive coaches, and instructors who build craft and character
          every round.
        </p>

        {loading ? (
          <p className={styles.copy}>Loading coaches…</p>
        ) : error ? (
          <div className={styles.empty}>
            <p>{error}</p>
            <Button type="button" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : coaches.length === 0 ? (
          <div className={styles.empty}>
            <p>Coach profiles are being updated. Visit the gym or join a class.</p>
            <Link href="/join">
              <Button type="button">Join Sully&apos;s</Button>
            </Link>
          </div>
        ) : (
          <ul className={styles.grid}>
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </ul>
        )}

        <div className={styles.cta}>
          <Link href="/join">
            <Button type="button">Train with us</Button>
          </Link>
          <Link href="/programs" className={styles.secondaryLink}>
            See programs →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
