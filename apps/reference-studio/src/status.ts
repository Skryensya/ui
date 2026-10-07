import type { BadgeProps } from "@skryensya/react/badge";
const tones: Record<string, NonNullable<BadgeProps["tone"]>> = {
  processing: "accent",
  review: "warning",
  accepted: "success",
  rejected: "danger",
  publishing: "accent",
  published: "success",
  pending: "neutral",
  "pr-open": "accent",
  merged: "success",
  failed: "danger",
};
/** The badge tone a reference or publication status reads as. */
export const toneOf = (status: string) => tones[status] ?? "neutral";
