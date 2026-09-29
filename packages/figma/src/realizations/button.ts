import type { Realization } from "../realization.js";

/*
 * Button, as Figma structure. Everything else (the axes, their values, the defaults, the slots, the
 * paint of every cell) is read from `buttonContract` and `button.css`.
 */
export const buttonRealization: Realization = {
  contract: "button",
  // Button.navigation paints identically; only its host differs.
  signature: "Button.action",
  // An appearance is picked for a product, rarely per instance, and each set stays a size Figma edits.
  splitBy: "appearance",
  // Pressed and disabled at once is unavailable-and-on; the CSS paints it as disabled, so it adds nothing.
  state: {
    axis: "state",
    rest: "rest",
    options: ["pressed", "disabled"],
    // Hover shows on hover in a prototype. Figma has no keyboard focus, so focus is drawn, not reached.
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  // Welding belongs to split buttons and segmented groups, which are not realized yet.
  exclude: ["weldStart", "weldEnd"],
  // Arrows by side: leading points back, trailing points on. A lone icon points on.
  slots: {
    pre: { holds: "icon", icon: "arrow-left" },
    post: { holds: "icon", icon: "arrow-right" },
    children: { holds: "text", sample: "Button", iconWhen: "iconOnly", icon: "arrow-right" },
  },
  icons: { module: "@skryensya/icons-lucide", export: "lucideIcons" },
  // A section per size, largest first; within it a group per variant, a row per tone.
  grid: { columns: ["iconOnly", "state"], rows: ["size", "variant", "tone"], descending: ["size"] },
  // The docs preview's background, so the frame and the browser show a Button on the same surface.
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
