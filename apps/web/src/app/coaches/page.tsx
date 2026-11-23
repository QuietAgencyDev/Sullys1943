"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApiError, get } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { FLOOR_COACHES } from "@/lib/floor-schedule";
import { BOXREC_FIGHTERS, boxrecForName } from "@/lib/boxrec-roster";
import { RED_OWL_TEAM } from "@/lib/programs-red-owl";
import styles from "./coaches.module.css";

type Coach = {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
};

const ROSTER_ORDER = FLOOR_COACHES.map((coach) =>
  `${coach.firstName} ${coach.lastName}`.trim().toLowerCase(),
);

const ROSTER_AVATARS = new Map(
  FLOOR_COACHES.map((coach) => [
    `${coach.firstName} ${coach.lastName}`.trim().toLowerCase(),
    coach.photoUrl,
  ]),
);

function withRosterAvatar(coach: Coach): Coach {
  const known = ROSTER_AVATARS.get(coach.name.trim().toLowerCase());
  if (!known) return coach;
  if (!coach.photoUrl || coach.photoUrl.endsWith(".jpg")) {
    return { ...coach, photoUrl: known };
  }
  return coach;
}

function byRoster(a: Coach, b: Coach) {
  const ia = ROSTER_ORDER.indexOf(a.name.trim().toLowerCase());
  const ib = ROSTER_ORDER.indexOf(b.name.trim().toLowerCase());
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
}

function BoxRecLine({ name }: { name: string }) {
  const person = boxrecForName(name);
  if (!person) return null;
  return (
    <p className={styles.record}>
      <a href={person.href}>
        BoxRec {person.kind} #{person.id}
      </a>
      {person.record ? ` · ${person.record}` : " · trainer page, no bout record posted"}
    </p>
  );
}

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
        <BoxRecLine name={coach.name} />
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
        setCoaches((data.coaches ?? []).map(withRosterAvatar).sort(byRoster));
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

        {!isRedOwl ? (
          <section className={styles.founder} aria-label="Founder">
            <p className={styles.role}>Founder</p>
            <h2 className={styles.name}>Earl “Sully” Sullivan</h2>
            <p className={styles.bio}>
              Founder of Sully’s Boxing Gym. 1914–1999. The floor still carries his name.
            </p>
            <ul className={styles.founderRow}>
              <li>
                <div className={styles.photoWrap}>
                  <Image
                    src="/tv/cast/founder-sully-portrait.png"
                    alt="Earl Sully Sullivan, founder, in a pinstripe suit"
                    fill
                    className={styles.photo}
                    sizes="(max-width: 720px) 100vw, 280px"
                  />
                </div>
              </li>
              <li>
                <div className={styles.photoWrap}>
                  <Image
                    src="/tv/cast/founder-sully-wave.png"
                    alt="Earl Sully Sullivan waving"
                    fill
                    className={styles.photo}
                    sizes="(max-width: 720px) 100vw, 280px"
                  />
                </div>
              </li>
              <li>
                <div className={styles.photoWrap}>
                  <Image
                    src="/tv/cast/founder-sully-guard.png"
                    alt="Earl Sully Sullivan in a boxing guard"
                    fill
                    className={styles.photo}
                    sizes="(max-width: 720px) 100vw, 280px"
                  />
                </div>
              </li>
            </ul>
          </section>
        ) : null}

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

        {!isRedOwl ? (
          <section className={styles.fighters} aria-label="Fighters on BoxRec">
            <h2 className={styles.fighterTitle}>Fighters on BoxRec</h2>
            <p className={styles.copy}>
              These boxers list Sully&apos;s on BoxRec. A record is shown only when BoxRec prints one. Viktoria Penney is the 2026 Canadian Elite national champion at women&apos;s 70 kg. BoxRec does not have a page for her.
            </p>
            <ul className={styles.fighterList}>
              {BOXREC_FIGHTERS.map((fighter) => (
                <li key={fighter.id}>
                  <a href={fighter.href}>{fighter.name}</a>
                  <span>
                    {" "}
                    · amateur #{fighter.id}
                    {fighter.record ? ` · ${fighter.record}` : ""}
                    {fighter.active ? "" : " · inactive on BoxRec"}
                  </span>
                  <p className={styles.bio}>{fighter.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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
