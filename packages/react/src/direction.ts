import type { HTMLAttributes } from "react";

/*
 * The one place this reads `dir`: a `dir` PROP wins outright: an explicit value asked for the very
 * directionality `getComputedStyle` would otherwise infer. Without one, the computed style off the
 * PARENT (not the element itself) is checked instead - an element with no `dir` of its own always
 * inherits one from somewhere, and reading the parent sidesteps any `dir="auto"` default the host
 * element itself might carry that has not resolved yet at the point this runs.
 *
 * Shared by every component whose ArrowLeft/ArrowRight (or a directional icon) has to mean
 * "toward the start" / "toward the end" rather than a fixed array index - found as a real,
 * repeated bug class (Segmented's keyboard nav shipped hardcoded to LTR array order), not a
 * one-off.
 */
export function getDirection(dir: HTMLAttributes<HTMLElement>["dir"], root: HTMLElement | null): "ltr" | "rtl" {
  if (dir === "rtl" || dir === "ltr") return dir;
  const target = dir ? root : root?.parentElement ?? root;
  return getComputedStyle(target ?? document.documentElement).direction === "rtl" ? "rtl" : "ltr";
}
