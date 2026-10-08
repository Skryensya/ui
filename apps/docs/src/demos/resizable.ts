import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

/*
 * RESIZABLE DEMOS.
 *
 * A group has no content to give it a height, so every demo states one, and a hairline frame so the
 * edges of the box read. The panels hold a title and a line of copy: enough to see which one grew.
 */

const frame = (height: string) => `block-size: ${height}; border: 1px solid var(--color-border-default); border-radius: var(--radius-control);`;
const pad = "padding: var(--space-inset-md);";

const content = (t: Translate, title: UIKey, body: UIKey): UsageTree[] => [
  { contract: "typography", signature: "Text", options: { weight: "emphasis" }, children: t(title) },
  { contract: "typography", signature: "Text", options: { tone: "secondary", size: "sm" }, children: t(body) },
];

const panel = (t: Translate, title: UIKey, body: UIKey, options: Record<string, number> = {}): UsageTree => ({
  contract: "resizable",
  signature: "Resizable.Panel",
  options,
  attrs: { style: pad },
  children: content(t, title, body),
});

const handle = (t: Translate, label: UIKey): UsageTree => ({
  contract: "resizable",
  signature: "Resizable.Handle",
  options: { label: t(label) },
});

/** The shape the page is about: a list with its detail beside it. */
export const resizableHorizontalTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("9rem") },
  children: [
    panel(t, "demo.resizable.list", "demo.resizable.listBody", { size: 35, minSize: 20 }),
    handle(t, "demo.resizable.handle"),
    panel(t, "demo.resizable.detail", "demo.resizable.detailBody"),
  ],
});

export const resizableVerticalTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  options: { direction: "vertical" },
  attrs: { style: frame("14rem") },
  children: [
    panel(t, "demo.resizable.editor", "demo.resizable.editorBody", { size: 60 }),
    handle(t, "demo.resizable.handleEditor"),
    panel(t, "demo.resizable.output", "demo.resizable.outputBody"),
  ],
});

/** Three panels: each bar moves only its own pair, and the bounds keep the middle one readable. */
export const resizableThreeTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("9rem") },
  children: [
    panel(t, "demo.resizable.nav", "demo.resizable.listBody", { size: 20, minSize: 15, maxSize: 35 }),
    handle(t, "demo.resizable.handleNav"),
    panel(t, "demo.resizable.main", "demo.resizable.listBody", { minSize: 30 }),
    handle(t, "demo.resizable.handleInspector"),
    panel(t, "demo.resizable.inspector", "demo.resizable.detailBody", { size: 30, minSize: 15 }),
  ],
});

/** Specimen for the option preview: the same group, which only the controls change. */
export const resizableSpecimenTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("10rem") },
  children: [
    panel(t, "demo.resizable.list", "demo.resizable.listBody"),
    handle(t, "demo.resizable.handle"),
    panel(t, "demo.resizable.detail", "demo.resizable.detailBody"),
  ],
});

export const resizableAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("resizablePage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      ...resizableHorizontalTree(t),
      attrs: { style: `${frame("7rem")} inline-size: min(100%, 24rem);` },
    },
    items: [
      namePart(".sk-resizable", "block-start", { mark: "bracket" }),
      namePart(".sk-resizable__panel", "inline-start"),
      namePart(".sk-resizable__handle", "block-end", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});
