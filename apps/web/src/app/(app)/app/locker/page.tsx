"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { get } from "@/lib/api";
import styles from "../ui.module.css";

type LockerOffer = {
  name: string;
  limited: boolean;
  priceCents: number | null;
  note: string;
};

export default function LockerPage() {
  const [offer, setOffer] = useState<LockerOffer | null>(null);

  useEffect(() => {
    get<LockerOffer>("/api/v1/lockers/offer")
      .then(setOffer)
      .catch(() =>
        setOffer({
          name: "Locker rental",
          limited: true,
          priceCents: null,
          note: "Limited lockers. Ask the front desk to reserve one. The fee will be added to membership when the desk posts it. Nothing is charged in the app yet.",
        }),
      );
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.headerBlock}>
        <p className={styles.eyebrow}>Membership add-on</p>
        <h1 className={styles.title}>{offer?.name ?? "Locker rental"}</h1>
        <p className={styles.lead}>
          A locker is limited and sits on top of a membership. The desk assigns
          it. The app does not take payment for it yet.
        </p>
      </div>
      <section className={styles.card}>
        <p className={styles.rowTitle}>Fee</p>
        <p>
          {offer?.priceCents == null
            ? "Not posted yet. Bring the price to the desk and it will be added here."
            : `$${(offer.priceCents / 100).toFixed(2)} CAD`}
        </p>
        <p className={styles.muted}>{offer?.note}</p>
        <div className={styles.actionsRow}>
          <Link href="/app/profile">
            <Button type="button" variant="secondary">
              Back to membership
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
