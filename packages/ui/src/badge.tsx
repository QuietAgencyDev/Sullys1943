import type { HTMLAttributes, ReactNode } from "react";
import styles from "./components.module.css";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: Tone;
};

const toneClass: Record<Tone, string> = {
  neutral: "",
  accent: styles.badgeAccent!,
  success: styles.badgeSuccess!,
  warning: styles.badgeWarning!,
  danger: styles.badgeDanger!,
};

export function Badge({
  children,
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={`${styles.badge} ${toneClass[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
