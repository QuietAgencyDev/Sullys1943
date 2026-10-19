import { Card, Skeleton } from "@sullys/ui";
import styles from "./ui.module.css";

export default function MemberAppLoading() {
  return (
    <div className={styles.page} aria-label="Loading member portal">
      <div className={styles.headerBlock}>
        <Skeleton width="5.5rem" height="0.7rem" />
        <Skeleton width="72%" height="3rem" />
        <Skeleton width="92%" height="1rem" />
      </div>
      <Card>
        <Skeleton width="6rem" height="0.7rem" />
        <Skeleton width="64%" height="1.8rem" />
        <Skeleton width="100%" height="4.5rem" />
      </Card>
      <Card>
        <Skeleton width="8rem" height="0.7rem" />
        <Skeleton width="100%" height="3.5rem" />
        <Skeleton width="86%" height="3.5rem" />
      </Card>
    </div>
  );
}
