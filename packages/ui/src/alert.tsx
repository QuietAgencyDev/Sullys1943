import type { HTMLAttributes, ReactNode } from "react";
import styles from "./components.module.css";

type Tone = "info" | "success" | "warning" | "danger";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  children?: ReactNode;
  tone?: Tone;
};

const toneClass: Record<Tone, string> = {
  info: styles.alertInfo!,
  success: styles.alertSuccess!,
  warning: styles.alertWarning!,
  danger: styles.alertDanger!,
};

const toneIcon: Record<Tone, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  danger: "×",
};

export function Alert({
  title,
  children,
  tone = "info",
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      {...props}
      className={`${styles.alert} ${toneClass[tone]} ${className ?? ""}`}
    >
      <span className={styles.alertIcon} aria-hidden>
        {toneIcon[tone]}
      </span>
      <div className={styles.alertBody}>
        <p className={styles.alertTitle}>{title}</p>
        {children ? <div className={styles.alertMessage}>{children}</div> : null}
      </div>
    </div>
  );
}
