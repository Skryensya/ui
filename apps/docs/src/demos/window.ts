import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * The control names follow the page's locale: the contract's defaults are English, and a Spanish
 * page announcing "Minimize" would be the exact drift `closeLabel` and its siblings exist to stop.
 */
const labels = (t: Translate) => ({
  closeLabel: t("demo.window.close"),
  minimizeLabel: t("demo.window.minimize"),
  maximizeLabel: t("demo.window.maximize"),
  restoreLabel: t("demo.window.restore"),
});

export const windowTree = (t: Translate): UsageTree => ({
  contract: "window",
  signature: "Window",
  options: { ...labels(t), defaultWidth: 360, defaultHeight: 240 },
  slots: {
    trigger: t("demo.window.trigger"),
    title: t("demo.window.title"),
    children: t("demo.window.body"),
  },
});

/*
 * Pinned in size: `resizable={false}` removes the edges AND the stage controls, because the machine
 * refuses to minimize or maximize a window it cannot resize. It still moves; a window that did not
 * would be a Popover without an anchor.
 */
export const windowFixedTree = (t: Translate): UsageTree => ({
  contract: "window",
  signature: "Window",
  options: { ...labels(t), resizable: false, defaultWidth: 320, defaultHeight: 180 },
  slots: {
    trigger: t("demo.windowFixed.trigger"),
    title: t("demo.windowFixed.title"),
    children: t("demo.windowFixed.body"),
  },
});

/*
 * Open, and pulled into flow by `windowAnatomyCss`: a live window is positioned by its machine and
 * would float wherever it last was. The positioner and resize handle are normally unpainted, so the
 * anatomy sheet gives them a faint drafting outline; otherwise the labels would point at empty air.
 */
export const windowAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("windowPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "window",
      signature: "Window",
      options: { ...labels(t), defaultOpen: true, draggable: false, persistRect: false, defaultWidth: 408, defaultHeight: 216 },
      slots: {
        trigger: t("demo.window.trigger"),
        title: t("demo.window.title"),
        children: t("demo.window.body"),
      },
    },
    items: [
      namePart(".sk-window__trigger", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-window__positioner", "inline-start", { mark: "bracket" }),
      namePart(".sk-window__content", "inline-start", { mark: "bracket" }),
      namePart(".sk-window__drag", "block-start", { mark: "bracket" }),
      namePart(".sk-window__title", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-window__controls", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-window__body", "inline-end", { mark: "bracket" }),
      /* The south edge stands in for all eight resize handles; labelling every edge makes the diagram noisy. */
      { options: { for: '.sk-window__resize[data-axis="s"]', side: "block-end" }, slots: { children: "sk-window__resize" } },
    ],
  },
});

export const windowAnatomyCss = `.sk-canvas,
.sk-canvas__viewport {
  cursor: default !important;
}

.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject .sk-window,
.sk-annotated__subject .sk-window * {
  pointer-events: none !important;
}

.sk-annotated__subject > .sk-window {
  display: grid;
  justify-items: center;
  gap: var(--space-stack-lg);
  inline-size: 29rem;
  margin-inline: auto;
}

.sk-annotated__subject > .sk-window .sk-window__trigger {
  justify-self: start;
  margin-inline-start: var(--space-inline-lg);
}

.sk-annotated__subject > .sk-window .sk-window__positioner {
  position: static !important;
  inset: auto !important;
  translate: none !important;
  transform: none !important;
  box-sizing: border-box;
  inline-size: 27rem !important;
  padding: var(--space-inset-sm);
  border: 1px dashed color-mix(in oklab, var(--color-border-default) 62%, transparent);
  border-radius: calc(var(--radius-surface) + var(--space-inset-sm));
  background: color-mix(in oklab, var(--color-bg-surface-raised) 38%, transparent);
}

.sk-annotated__subject > .sk-window .sk-window__content {
  position: relative;
  inline-size: 25rem !important;
  block-size: 13.5rem !important;
  margin-inline: auto;
}

.sk-annotated__subject > .sk-window .sk-window__resize[data-axis="s"] {
  background: color-mix(in oklab, var(--color-border-accent) 18%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in oklab, var(--color-border-accent) 45%, transparent);
}

.sk-annotated__subject > .sk-window .sk-window__body {
  min-block-size: 0;
}`;
