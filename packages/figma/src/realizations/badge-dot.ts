import type { Realization } from "../realization.js";

/*
 * Badge's dot (`BadgeDot`), as Figma structure: the same contract as the labelled Badge, a different
 * drawing. A bare circle in its tone, no text, so nothing here but where its tones go.
 *
 * `pulse` is not drawn. Its halo is an animation on `::after` that sits at opacity 0 at rest, so the
 * cascade finds no difference between a pulsing dot and a still one, and Figma has no animation to
 * give it. The dot is drawn as it rests.
 */
export const badgeDotRealization: Realization = {
  contract: "badge",
  signature: "BadgeDot",
  // No appearance on the dot: one set.
  state: { axis: "state", rest: "rest", options: [], interactions: [] },
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: {},
  icons: { module: "@skryensya/icons-lucide", export: "lucideIcons" },
  // Its tones across, in one row.
  grid: { columns: ["tone"], rows: [], descending: [] },
  stage: {
    contract: "component-preview",
    hook: "--sk-component-preview-bg",
    label: {
      color: "--color-text-secondary",
      fontFamily: "--font-family-body",
      fontSize: "--font-size-caption",
      fontWeight: "--font-weight-label",
    },
    divider: "--color-border-subtle",
  },
};
