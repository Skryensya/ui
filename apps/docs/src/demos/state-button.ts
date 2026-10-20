import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

export { default as stateButtonDemoScript } from "./scripts/state-button-demos.ts?raw";

const centred = (child: UsageTree): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { inlineAlign: "center", justify: "center" },
  // The frame's stage is a wrapping flex row of content-sized items; taking the line is what centres it.
  attrs: { style: "flex: 1 1 100%" },
  children: [child],
});

export const stateButtonPlaygroundTree = (t: Translate): UsageTree => ({
  contract: "state-button",
  signature: "StateButton",
  options: { current: "grid" },
  attrs: {
    id: "demo-state-button-view-mode",
    "aria-label": t("demo.state-button.viewMode.grid"),
    "data-variant": "ghost",
    "data-size": "md",
  },
  slots: {
    faces: [
      { options: { name: "grid", icon: "calendar" }, slots: {} },
      { options: { name: "list", icon: "menu" }, slots: {} },
      { options: { name: "compact", icon: "zoom-out" }, slots: {} },
    ],
  },
});

const themeToggle = (t: Translate): UsageTree => ({
  contract: "state-button",
  signature: "StateButton",
  options: { current: "light" },
  attrs: {
    id: "demo-state-button-theme",
    "aria-label": t("demo.state-button.themeToggle.title"),
    "data-variant": "ghost",
    "data-size": "md",
  },
  slots: {
    faces: [
      { options: { name: "light", icon: "mode-light" }, slots: {} },
      { options: { name: "dark", icon: "mode-dark" }, slots: {} },
      { options: { name: "system", icon: "mode-system" }, slots: {} },
    ],
  },
});

const copy = (t: Translate): UsageTree => ({
  contract: "state-button",
  signature: "StateButton",
  options: { current: "ready" },
  attrs: {
    id: "demo-state-button-copy",
    "aria-label": t("demo.state-button.copy.title"),
    "data-variant": "ghost",
    "data-size": "md",
  },
  slots: {
    faces: [
      { options: { name: "ready", icon: "copy" }, slots: {} },
      { options: { name: "copied", icon: "check" }, slots: {} },
    ],
  },
});

export const stateButtonBasicTree = (t: Translate): UsageTree => centred(stateButtonPlaygroundTree(t));
export const stateButtonThemeToggleTree = (t: Translate): UsageTree => centred(themeToggle(t));
export const stateButtonCopyTree = (t: Translate): UsageTree => centred(copy(t));

/*
 * The button, and the one face showing. Every state is a `data-face` child and only the one marked
 * `data-active` is visible, so a ring on the others would circle nothing. The legend reads the
 * attribute because there is no class to read: faces are data, not parts.
 */
export const stateButtonAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("stateButtonPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "state-button",
      signature: "StateButton",
      options: { current: "grid" },
      attrs: { "aria-label": t("demo.state-button.viewMode.grid") },
      slots: {
        faces: [
          { options: { name: "grid", icon: "calendar" }, slots: {} },
          { options: { name: "list", icon: "menu" }, slots: {} },
        ],
      },
    },
    items: [
      namePart(".sk-state-button", "block-start", { ringPlacement: "offset", ringDistance: 4 }),
      { options: { for: ".sk-state-button > [data-active]", side: "inline-end" }, slots: { children: "[data-face][data-active]" } },
    ],
  },
});
