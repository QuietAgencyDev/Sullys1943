import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./components.module.css";

export type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

export function Skeleton({
  width = "100%",
  height = "1rem",
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={`${styles.skeleton} ${className ?? ""}`}
      style={{ width, height, ...style }}
    />
  );
}
