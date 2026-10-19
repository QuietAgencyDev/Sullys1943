"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApiError, get } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { RED_OWL_TEAM } from "@/lib/programs-red-owl";
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
  const brand = getBrand();
  const isRedOwl = brand.id === "red-owl";
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(!isRedOwl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isRedOwl) {
      setCoaches(
        RED_OWL_TEAM.map((t) => ({
          id: t.id,
          name: t.name,
          title: t.title,
          bio: t.bio,
          photoUrl: t.photoUrl,
        })),
      );
      setLoading(false);
      return;
    }

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
  }, [isRedOwl]);

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>
          {isRedOwl ? "Smartbox & gym" : "The floor"}
        </p>
        <h1 className={styles.title}>
          {isRedOwl ? "The team" : "Coaches"}
        </h1>
        <p className={styles.copy}>
          {isRedOwl
            ? "Boxing coaches, mentors, tutors, counselling, career and nutrition partners — the Smartbox model powered by Red Owl Boxing and Scarberian Boxing Club. Named coach portraits come next."
            : "The floor staff at Canada's oldest boxing gym — champions, competitive coaches, and instructors who build craft and character every round."}
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
            <p>
              Coach profiles are being updated. Visit the gym or join a class.
            </p>
            <Link href="/join">
              <Button type="button">
                {isRedOwl ? "Join Red Owl" : "Join Sully's"}
              </Button>
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
          <Link href={isRedOwl ? "/smartbox" : "/join"}>
            <Button type="button">
              {isRedOwl ? "Smartbox program" : "Train with us"}
            </Button>
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
