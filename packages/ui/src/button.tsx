import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "var(--accent-contrast)",
    border: "1px solid transparent",
  },
  secondary: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid transparent",
  },
};

export function Button({
  variant = "primary",
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        minHeight: "44px",
        padding: "0 20px",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: "15px",
        letterSpacing: "0.02em",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        transition: "transform 120ms ease, opacity 120ms ease",
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
