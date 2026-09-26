import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * Button's frosted demos (and the Tile comparison) stage on this photograph. Kept for them.
 */
const FROST_PHOTO = "/demos/lightbox/street-small.jpg";

export const frostStage = `padding: var(--space-inset-lg); border-radius: var(--radius-surface); background: center / cover url(${FROST_PHOTO});`;

/*
 * THE APPEARANCE STAGE: what a page whose examples follow the appearance switch puts under every
 * example, whichever appearance is chosen, so switching changes the appearance and never the ground.
 *
 * A CONTROLLED GRADIENT, not a photograph: every colour is a semantic token, so it follows light,
 * dark and the brand instead of being whatever a picture happens to contain. Three soft colour fields
 * over a tinted base give frosted something to blur, and stay quiet enough under plain, tactile and
 * brutalist that the component is still what the eye reads.
 *
 * `flex: 1 1 100%` because a preview stage is a wrapping ROW that sizes each child to its content
 * (component-preview.css): without it the stage shrank to a closed accordion's width and grew when a
 * section opened.
 */
export const appearanceStage = [
  "flex: 1 1 100%",
  "min-inline-size: 0",
  "padding: var(--space-inset-lg)",
  "border-radius: var(--radius-surface)",
  "background:" +
    " radial-gradient(circle at 15% 20%, color-mix(in oklab, var(--color-action-accent) 55%, transparent), transparent 45%)," +
    " radial-gradient(circle at 85% 35%, color-mix(in oklab, var(--color-text-success) 45%, transparent), transparent 40%)," +
    " radial-gradient(circle at 55% 95%, color-mix(in oklab, var(--color-text-warning) 45%, transparent), transparent 45%)," +
    " linear-gradient(135deg, var(--color-bg-accent-subtle), var(--color-bg-info-subtle))",
].join("; ");

/** Wraps a demo tree in the appearance stage, unchanged otherwise. */
export const onAppearanceStage = (tree: UsageTree): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { style: appearanceStage },
  children: tree,
});
