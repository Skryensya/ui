import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

/*
 * RESIZABLE DEMOS.
 *
 * A group has no content to give it a height, so every demo states one, and a hairline frame so the
 * edges of the box read. The panels hold the things this component is for, not lorem: an inbox and
 * the message it opens, a file's code and what it produces. A split only reads as useful when each
 * side is plainly a different thing worth more or less room.
 */

const frame = (height: string) => `block-size: ${height}; border: 1px solid var(--color-border-default); border-radius: var(--radius-control);`;
const pad = "padding: var(--space-inset-md);";

const text = (t: Translate, key: UIKey, options: Record<string, string> = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  children: t(key),
});

const column = (...children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs" },
  children,
});

const rule: UsageTree = { contract: "separator", signature: "Separator", options: { tone: "subtle", spacing: "none" } };

const row = (t: Translate, title: UIKey, body: UIKey): UsageTree =>
  column(text(t, title, { weight: "emphasis", size: "sm" }), text(t, body, { tone: "secondary", size: "sm" }));

/** Three messages with a hairline between them: the "list" half of a list and its detail. */
const inbox = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    row(t, "demo.resizable.row1", "demo.resizable.row1Body"),
    rule,
    row(t, "demo.resizable.row2", "demo.resizable.row2Body"),
    rule,
    row(t, "demo.resizable.row3", "demo.resizable.row3Body"),
  ],
});

/** The message the list opens: a title, who sent it and what it says. */
const message = (t: Translate): UsageTree =>
  column(
    { contract: "typography", signature: "Heading", options: { headingSize: "h4", headingElement: "h3" }, children: t("demo.resizable.subject") },
    text(t, "demo.resizable.from", { tone: "secondary", size: "sm" }),
    text(t, "demo.resizable.message"),
  );

const code = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Code",
  children: t("demo.resizable.code"),
});

const files = (t: Translate): UsageTree =>
  column(
    text(t, "demo.resizable.files", { weight: "emphasis", size: "sm" }),
    text(t, "demo.resizable.file1", { size: "sm" }),
    text(t, "demo.resizable.file2", { tone: "secondary", size: "sm" }),
    text(t, "demo.resizable.file3", { tone: "secondary", size: "sm" }),
  );

const panel = (content: UsageTree, options: Record<string, number | boolean> = {}): UsageTree => ({
  contract: "resizable",
  signature: "Resizable.Panel",
  options,
  attrs: { style: pad },
  children: content,
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
  attrs: { style: frame("11rem") },
  children: [
    panel(inbox(t), { size: 38, minSize: 25 }),
    handle(t, "demo.resizable.handle"),
    panel(message(t)),
  ],
});

/**
 * A panel that can close: the file list of a split. Dragged below its floor it snaps shut and its bar stays; the
 * page's live demo, with its buttons, is where a reader tries that.
 */
export const resizableCollapsibleTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("11rem") },
  children: [
    panel(files(t), { size: 28, minSize: 18, collapsible: true }),
    handle(t, "demo.resizable.handleFiles"),
    panel(code(t), { minSize: 30 }),
  ],
});

/** Stacked: the code a person writes over what it produces. The editor starts taller. */
export const resizableVerticalTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  options: { direction: "vertical" },
  attrs: { style: frame("13rem") },
  children: [
    panel(code(t), { size: 60, minSize: 30 }),
    handle(t, "demo.resizable.handleEditor"),
    panel(text(t, "demo.resizable.result", { weight: "emphasis" })),
  ],
});

/** Three panels: each bar moves only its own pair, and the bounds keep the middle one readable. */
export const resizableThreeTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("11rem") },
  children: [
    panel(files(t), { size: 22, minSize: 15, maxSize: 35 }),
    handle(t, "demo.resizable.handleFiles"),
    panel(code(t), { minSize: 30 }),
    handle(t, "demo.resizable.handleCode"),
    panel(text(t, "demo.resizable.result", { weight: "emphasis" }), { size: 28, minSize: 15 }),
  ],
});

/** Specimen for the option preview: the same group, which only the controls change. */
export const resizableSpecimenTree = (t: Translate): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("12rem") },
  children: [
    panel(inbox(t)),
    handle(t, "demo.resizable.handle"),
    panel(message(t)),
  ],
});

/*
 * DO / DON'T. Both sides of each pair are the same group with one thing changed, so the difference
 * on screen is the rule being taught and nothing else. Each side is half a column wide, so the
 * panels hold a word or two: with real rows the "do" would be as cramped as the "don't".
 */

const word = (t: Translate, key: UIKey): UsageTree => text(t, key, { weight: "emphasis", size: "sm" });

const pair = (t: Translate, list: Record<string, number>): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("6rem") },
  children: [
    panel(word(t, "demo.resizable.list"), list),
    handle(t, "demo.resizable.handle"),
    panel(word(t, "demo.resizable.detail")),
  ],
});

/** The floor held: wherever the list is dragged it stays a word you can read. */
export const resizableDoBoundsTree = (t: Translate): UsageTree => pair(t, { size: 40, minSize: 35 });

/** No floor: the same drag took the list to 4% and its word is a clipped sliver. */
export const resizableDontBoundsTree = (t: Translate): UsageTree => pair(t, { size: 4, minSize: 0 });

const trio = (t: Translate, keys: [UIKey, UIKey, UIKey], handles: [UIKey, UIKey]): UsageTree => ({
  contract: "resizable",
  signature: "Resizable",
  attrs: { style: frame("6rem") },
  children: [
    panel(word(t, keys[0])),
    handle(t, handles[0]),
    panel(word(t, keys[1])),
    handle(t, handles[1]),
    panel(word(t, keys[2])),
  ],
});

/** Few panels: a file list, its editor and its output, each wide enough to read. */
export const resizableDoCountTree = (t: Translate): UsageTree =>
  trio(t, ["demo.resizable.files", "demo.resizable.editor", "demo.resizable.output"], ["demo.resizable.handleFiles", "demo.resizable.handleCode"]);

/** Too many: five peers in the same box, so every one is a sliver and the bars crowd each other. */
export const resizableDontCountTree = (t: Translate): UsageTree => {
  const keys: UIKey[] = ["demo.resizable.files", "demo.resizable.editor", "demo.resizable.output", "demo.resizable.terminal", "demo.resizable.docs"];
  return {
    contract: "resizable",
    signature: "Resizable",
    attrs: { style: frame("6rem") },
    children: keys.flatMap((key, i) => [
      ...(i > 0 ? [handle(t, i % 2 ? "demo.resizable.handleFiles" : "demo.resizable.handleCode")] : []),
      panel(word(t, key)),
    ]),
  };
};

export const resizableAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("resizablePage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      ...resizableHorizontalTree(t),
      attrs: { style: `${frame("8rem")} inline-size: min(100%, 26rem);` },
    },
    items: [
      namePart(".sk-resizable", "block-start", { mark: "bracket" }),
      namePart(".sk-resizable__panel", "inline-start"),
      namePart(".sk-resizable__handle", "block-end", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});
