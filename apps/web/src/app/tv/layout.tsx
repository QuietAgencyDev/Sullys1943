import styles from "./tv.module.css";

export default function TvLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.tvScreen}>{children}</div>;
}
