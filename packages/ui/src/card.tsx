import type { HTMLAttributes, ReactNode } from "react";
import styles from "./components.module.css";

export type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  accent?: boolean;
  interactive?: boolean;
  as?: "article" | "section" | "div";
};

export function Card({
  children,
  accent = false,
  interactive = false,
  as: Element = "section",
  className,
  ...props
}: CardProps) {
  return (
    <Element
      {...props}
      className={`${styles.card} ${accent ? styles.cardAccent : ""} ${
        interactive ? styles.cardInteractive : ""
      } ${className ?? ""}`}
    >
      {children}
    </Element>
  );
}
