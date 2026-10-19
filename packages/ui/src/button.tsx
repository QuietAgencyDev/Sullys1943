import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./components.module.css";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: styles.buttonPrimary!,
  secondary: styles.buttonSecondary!,
  ghost: styles.buttonGhost!,
};

export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`${styles.button} ${variantClass[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
