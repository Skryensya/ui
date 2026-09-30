import type { Realization } from "../realization.js";

/*
 * WHAT EVERY REALIZATION SHARES: the stage every set stands on (the docs preview's background, so a
 * component reads the same in Figma as on its page) and the icon set that draws the Icon contract.
 * One place, so a new component is only what makes it different.
 */
export const stage: Realization["stage"] = {
  contract: "component-preview",
  hook: "--sk-component-preview-bg",
  label: {
    color: "--color-text-secondary",
    fontFamily: "--font-family-body",
    fontSize: "--font-size-caption",
    fontWeight: "--font-weight-label",
  },
  divider: "--color-border-subtle",
  // Body copy, as a docs page sets it.
  inherit: {
    "font-family": "--font-family-body",
    color: "--color-text-primary",
    "font-size": "--font-size-body",
    "font-weight": "--font-weight-body",
    "line-height": "--font-line-height-body",
  },
};

export const icons: Realization["icons"] = { module: "@skryensya/icons-lucide", export: "lucideIcons" };

/** A component that is never hovered, pressed or focused: no state axis at all. */
export const noStates: Realization["state"] = { axis: "state", rest: "rest", options: [], interactions: [] };
