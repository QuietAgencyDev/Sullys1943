"use client";

import { Alert, Button, Card } from "@sullys/ui";
import styles from "./ui.module.css";

export default function MemberAppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.page}>
      <Card accent>
        <p className={styles.eyebrow}>Temporary corner break</p>
        <h1 className={styles.title}>We couldn&apos;t load this round.</h1>
        <Alert title="Your account is safe" tone="warning">
          Check your connection and try again. No booking or payment was
          changed.
        </Alert>
        <div className={styles.actionsRow}>
          <Button onClick={reset}>Try again</Button>
        </div>
      </Card>
    </div>
  );
}
