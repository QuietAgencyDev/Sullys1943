/** Development & marketing partner credit */
export const QUIET_AGENCY = {
  name: "Quiet Agency",
  blurb: "Web & system development",
  /** Override with NEXT_PUBLIC_QUIET_AGENCY_URL if needed */
  url:
    process.env.NEXT_PUBLIC_QUIET_AGENCY_URL?.trim() ||
    "https://quietagency.co",
} as const;
