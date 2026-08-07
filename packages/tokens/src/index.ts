/**
 * Sully's Boxing Gym — design tokens from official badge (EST 1943).
 * Source: docs/06-design/01-ui-design-system.md
 */
export const colors = {
  brandCream: "#F3E6C8",
  brandRed: "#C82026",
  brandBrown: "#3A2418",
  brandGlove: "#C4A06A",
  bgCanvas: "#140F0C",
  bgElevated: "#1C1612",
  bgCream: "#F3E6C8",
  textPrimary: "#F3E6C8",
  textMuted: "#B8A990",
  textOnCream: "#3A2418",
  danger: "#E23B3B",
  warning: "#D4A017",
  success: "#2F9E6B",
} as const;

export const radii = {
  sm: "4px",
  md: "10px",
  lg: "16px",
  full: "9999px",
} as const;

export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "48px",
  8: "64px",
} as const;

export const fonts = {
  display: '"Bebas Neue", "Arial Narrow", Impact, sans-serif',
  body: '"DM Sans", "Segoe UI", sans-serif',
  heritage: '"Libre Baskerville", Georgia, serif',
} as const;
