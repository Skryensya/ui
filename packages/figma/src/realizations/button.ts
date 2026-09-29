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
  state: { axis: "state", rest: "rest", options: ["pressed", "disabled"] },
  // Welding belongs to split buttons and segmented groups, which are not realized yet.
  exclude: ["weldStart", "weldEnd"],
  // Arrows by side: leading points back, trailing points on. A lone icon points on.
  slots: {
    pre: { holds: "icon", icon: "arrow-left" },
    post: { holds: "icon", icon: "arrow-right" },
    children: { holds: "text", sample: "Button", iconWhen: "iconOnly", icon: "arrow-right" },
  },
  icons: { module: "@skryensya/icons-lucide", export: "lucideIcons" },
  grid: { columns: ["iconOnly", "state"], rows: ["variant", "tone", "size"] },
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
  },
  specimen: {
    module: "apps/docs/src/demos/button.ts",
    exports: [
      "buttonVariantTree",
      "buttonAppearanceTree",
      "buttonSizesTree",
      "buttonIconTree",
      "buttonIconOnlyTree",
      "buttonDestructivePairTree",
      // Rest, pressed and disabled; its hover, :active and :focus-visible cells are live-only and draw as rest.
      "buttonBrutalistStatesTree",
    ],
  },
};
