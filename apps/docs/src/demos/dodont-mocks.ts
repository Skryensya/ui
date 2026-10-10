import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

type UIKey = Parameters<Translate>[0];

/*
 * DO / DON'T PAIRS FOR THE COMPONENTS THAT CANNOT BE FROZEN: AppShell, Window, Vaul, Tour, UserSelect and Presence.
 *
 * A window, a sheet and a tour step are positioned by a machine the moment they open; a user select is a live control;
 * Presence is motion; AppShell is a whole page. None of them can be put in an inert frame without rewriting its CSS,
 * which would make the picture a picture of the rewrite. So these pairs draw the RULE with the kit's own pieces
 * (Box, Text, Inline, Heading): a mock of the thing, built the way the thing is laid out, with the one detail the
 * rule is about changed. Where the real component can stand in, the other pair modules use it.
 */

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  children,
});

const label = (children: string): UsageTree => text(children, { size: "caption", weight: "label" });

const stack = (gap: string, ...children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap },
  children,
});

const inline = (options: Record<string, string>, ...children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options,
  children,
});

/** A box with a style of its own. A Box needs one option off its default, so `surface` is always set. */
const box = (style: string, children: UsageTree | UsageTree[], surface: "none" | "sunken" | "surface" | "raised" = "surface"): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: surface === "none" ? "sunken" : surface },
  attrs: { style: `box-sizing: border-box; ${style}` },
  children,
});

const button = (children: string, variant = "solid"): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { size: "sm", variant },
  children,
});

const heading = (children: string, size = "h5"): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: size, flush: true },
  children,
});

const RULE = "1px solid var(--color-border-default)";
const R = "var(--radius-surface)";

/* ═════════════ AppShell ═════════════ */

/** One page frame: a header across the top, a rail down the side, the work in `main`. */
const shell = (main: UsageTree, style = "inline-size: 19rem; block-size: 10rem;"): UsageTree =>
  box(
    `display: grid; grid-template-columns: 22% 1fr; grid-template-rows: 1.75rem 1fr; gap: 1px; background: var(--color-border-default); border: ${RULE}; border-radius: ${R}; overflow: hidden; ${style}`,
    [
      box("grid-column: 1 / -1; padding: 0.25rem 0.5rem; display: flex; align-items: center;", label("header")),
      box("padding: 0.5rem;", label("nav")),
      main,
    ],
  );

const mainPane = (children: UsageTree | UsageTree[] = label("main")): UsageTree => box("padding: 0.5rem; min-inline-size: 0;", children);

/** A page has one frame. */
export const appShellOneDoTree = (_t: Translate): UsageTree => shell(mainPane());

/** A frame inside the work area of another: two headers, two rails, nobody knows which one is the page. */
export const appShellOneDontTree = (_t: Translate): UsageTree =>
  shell(mainPane(shell(mainPane(), "inline-size: 100%; block-size: 100%; min-block-size: 0;")));

/** One `main` per page: the landmark a skip link and a screen reader jump to. */
export const appShellMainDoTree = (_t: Translate): UsageTree => shell(mainPane());

/** Two work areas side by side: two `main` landmarks, and the first one is not the content. */
export const appShellMainDontTree = (_t: Translate): UsageTree =>
  shell(
    box(
      "display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--color-border-default); min-inline-size: 0;",
      [mainPane(), mainPane()],
    ),
  );

/* ═════════════ Window ═════════════ */

const windowSpecimen = (t: Translate, title: string, body: UsageTree[], className = "dd-window"): UsageTree => ({
  contract: "window",
  signature: "Window",
  options: {
    closeLabel: t("demo.window.close"),
    minimizeLabel: t("demo.window.minimize"),
    maximizeLabel: t("demo.window.maximize"),
    restoreLabel: t("demo.window.restore"),
    defaultOpen: true,
    draggable: false,
    persistRect: false,
    defaultWidth: 224,
    defaultHeight: 144,
  },
  attrs: { class: className },
  slots: {
    trigger: t("demo.window.trigger"),
    title,
    children: stack("xs", ...body),
  },
});

const inspectorBody = (t: Translate): UsageTree[] => [
  text(t("demo.mock.window.row1"), { size: "sm" }),
  text(t("demo.mock.window.row2"), { size: "sm" }),
  text(t("demo.mock.window.row3"), { size: "sm" }),
];

/** Named by what it holds. */
export const windowTitleDoTree = (t: Translate): UsageTree => windowSpecimen(t, t("demo.mock.window.inspector"), inspectorBody(t), "dd-window dd-window--title");

/** Named by what it is: every window is a window. */
export const windowTitleDontTree = (t: Translate): UsageTree => windowSpecimen(t, t("demo.mock.window.generic"), inspectorBody(t), "dd-window dd-window--title");

const pageLines = (t: Translate): UsageTree =>
  stack("xs", heading(t("demo.mock.window.page"), "h5"), text(t("demo.mock.window.pageBody"), { size: "sm" }), text(t("demo.mock.window.pageBody2"), { size: "sm" }));

/** A tool beside the content: the page stays in view and in reach while the window is open. */
export const windowBesideDoTree = (t: Translate): UsageTree =>
  box(
    "position: relative; inline-size: 32rem; block-size: 16rem; overflow: hidden; border-radius: var(--radius-surface);",
    [
      box("position: absolute; inset: 0; padding: 0.75rem; inline-size: 62%;", pageLines(t)),
      windowSpecimen(t, t("demo.mock.window.inspector"), inspectorBody(t).slice(0, 2), "dd-window dd-window--floating"),
    ],
  );

/** A question that must be answered, in a window over a dimmed page: that is a Dialog, and the page cannot be used meanwhile. */
export const windowBesideDontTree = (t: Translate): UsageTree =>
  box(
    "position: relative; inline-size: 32rem; block-size: 16rem; overflow: hidden; border-radius: var(--radius-surface);",
    [
      box("position: absolute; inset: 0; padding: 0.75rem; inline-size: 62%;", pageLines(t)),
      box("position: absolute; inset: 0; background: var(--color-bg-well); opacity: 0.7;", label("\u00a0")),
      windowSpecimen(
        t,
        t("demo.mock.window.confirm"),
        [text(t("demo.mock.window.confirmBody"), { size: "sm" }), inline({ gap: "xs", justify: "end" }, button(t("demo.mock.cancel"), "ghost"), button(t("demo.mock.accept")))],
        "dd-window dd-window--dialogish",
      ),
    ],
  );

/* ═════════════ Vaul ═════════════ */

const phone = (sheet: UsageTree): UsageTree =>
  box(
    `position: relative; inline-size: 11rem; block-size: 15rem; overflow: hidden; border: ${RULE}; border-radius: 1.25rem; margin-inline: auto;`,
    [box("position: absolute; inset: 0; padding: 0.75rem;", stack("xs", label("···"), label("···"))), sheet],
    "sunken",
  );

const sheetAt = (children: UsageTree[], top = "2rem"): UsageTree =>
  box(
    `position: absolute; inset-inline: 0; inset-block-end: 0; inset-block-start: ${top}; padding: 0.625rem 0.75rem; border-start-start-radius: 1rem; border-start-end-radius: 1rem; display: grid; align-content: space-between; gap: 0.5rem;`,
    children,
  );

const grab = box("inline-size: 2rem; block-size: 0.25rem; margin: 0 auto 0.375rem; border-radius: 1rem; background: var(--color-border-strong);", label("\u00a0"), "raised");

const vaulRows = (t: Translate): UsageTree =>
  stack("xs", text(t("demo.mock.vaul.row1"), { size: "sm" }), text(t("demo.mock.vaul.row2"), { size: "sm" }));

/** The main action at the foot of the sheet, where a thumb already is. */
export const vaulActionDoTree = (t: Translate): UsageTree =>
  phone(
    sheetAt([
      stack("xs", grab, heading(t("demo.mock.vaul.share"), "h5"), vaulRows(t)),
      inline({ justify: "end" }, button(t("demo.mock.vaul.send"))),
    ]),
  );

/** The main action up under the title, at the far end of the screen from the thumb, with the rest of the sheet empty. */
export const vaulActionDontTree = (t: Translate): UsageTree =>
  phone(
    sheetAt(
      [
        stack(
          "xs",
          grab,
          inline({ justify: "between", inlineAlign: "center" }, heading(t("demo.mock.vaul.share"), "h5"), button(t("demo.mock.vaul.send"))),
          vaulRows(t),
        ),
      ],
      "2rem",
    ),
  );

/** Titled with the task. */
export const vaulTitleDoTree = (t: Translate): UsageTree =>
  phone(sheetAt([stack("xs", grab, heading(t("demo.mock.vaul.share"), "h5"), vaulRows(t))]));

/** Titled with what it is. */
export const vaulTitleDontTree = (t: Translate): UsageTree =>
  phone(sheetAt([stack("xs", grab, heading(t("demo.mock.vaul.generic"), "h5"), vaulRows(t))]));

/* ═════════════ Tour ═════════════ */

const dots = (total: number, current: number): UsageTree =>
  inline(
    { gap: "xs", inlineAlign: "center" },
    ...Array.from({ length: total }, (_, i) =>
      box(
        `inline-size: 0.375rem; block-size: 0.375rem; border-radius: 50%; background: ${i < current ? "var(--color-text-primary)" : "var(--color-border-strong)"}; padding: 0;`,
        label("\u00a0"),
        "raised",
      ),
    ),
  );

const stepCard = (title: string, body: string, progress: UsageTree, count: string): UsageTree =>
  box(
    `inline-size: 14rem; padding: 0.75rem; border: ${RULE}; border-radius: ${R}; box-shadow: var(--elevation-overlay);`,
    stack(
      "xs",
      heading(title, "h5"),
      text(body, { size: "sm", tone: "secondary" }),
      inline({ justify: "between", inlineAlign: "center" }, stack("xs", progress, text(count, { size: "caption", tone: "tertiary" })), button("→")),
    ),
  );

/** Titled with the element it points at. */
export const tourTitleDoTree = (t: Translate): UsageTree =>
  stepCard(t("demo.mock.tour.filters"), t("demo.mock.tour.filtersBody"), dots(4, 2), t("demo.mock.tour.progress", { n: "2", total: "4" }));

/** Titled with its number: the progress already says that, and the title says nothing about the element. */
export const tourTitleDontTree = (t: Translate): UsageTree =>
  stepCard(t("demo.mock.tour.stepTwo"), t("demo.mock.tour.filtersBody"), dots(4, 2), t("demo.mock.tour.progress", { n: "2", total: "4" }));

/** Four steps, one idea each. */
export const tourLengthDoTree = (t: Translate): UsageTree =>
  stepCard(t("demo.mock.tour.filters"), t("demo.mock.tour.filtersBody"), dots(4, 2), t("demo.mock.tour.progress", { n: "2", total: "4" }));

/** Fourteen steps: nobody is still taking the tour by the fifth. */
export const tourLengthDontTree = (t: Translate): UsageTree =>
  stepCard(t("demo.mock.tour.filters"), t("demo.mock.tour.filtersBody"), dots(14, 2), t("demo.mock.tour.progress", { n: "2", total: "14" }));

/* ═════════════ UserSelect ═════════════ */

const person = (name: string, email: string | null, initials: string): UsageTree =>
  inline(
    { gap: "sm", inlineAlign: "center" },
    box(
      "inline-size: 1.75rem; block-size: 1.75rem; border-radius: 50%; display: grid; place-content: center; padding: 0; flex: none; background: var(--color-bg-accent-subtle);",
      text(initials, { size: "caption", weight: "emphasis" }),
      "raised",
    ),
    email === null ? text(name, { size: "sm" }) : stack("none", text(name, { size: "sm", weight: "emphasis" }), text(email, { size: "caption", tone: "secondary" })),
  );

const list = (...children: UsageTree[]): UsageTree =>
  box(`inline-size: 15rem; padding: 0.5rem; border: ${RULE}; border-radius: ${R};`, stack("sm", ...children));

/** The email under the name: two people called Ana Pérez stop being the same person. */
export const userSelectEmailDoTree = (t: Translate): UsageTree =>
  list(
    person(t("demo.mock.user.ana"), "ana.perez@acme.com", "AP"),
    person(t("demo.mock.user.ana"), "ana.perez@lumen.io", "AP"),
    person(t("demo.mock.user.luis"), "luis.rios@acme.com", "LR"),
  );

/** Names only: which Ana is which? */
export const userSelectEmailDontTree = (t: Translate): UsageTree =>
  list(person(t("demo.mock.user.ana"), null, "AP"), person(t("demo.mock.user.ana"), null, "AP"), person(t("demo.mock.user.luis"), null, "LR"));

const fieldMock = (labelText: string): UsageTree =>
  stack(
    "xs",
    text(labelText, { size: "sm", weight: "label" }),
    box(
      `inline-size: 15rem; padding: 0.375rem 0.5rem; border: ${RULE}; border-radius: var(--radius-control);`,
      inline({ gap: "xs" }, person("Ana", null, "AP"), person("Luis", null, "LR")),
    ),
  );

/** Named by the role the people will have. */
export const userSelectNameDoTree = (t: Translate): UsageTree => fieldMock(t("demo.mock.user.assignees"));

/** Named by what they are: every one of these is a "user". */
export const userSelectNameDontTree = (t: Translate): UsageTree => fieldMock(t("demo.mock.user.users"));

/* ═════════════ Presence ═════════════ */

const frameBox = (opacity: number, scale: number, caption: string): UsageTree =>
  stack(
    "xs",
    box(
      `inline-size: 3.75rem; block-size: 2.5rem; border-radius: var(--radius-control); border: ${RULE}; display: grid; place-content: center; padding: 0; opacity: ${opacity}; scale: ${scale};`,
      text("¡!", { weight: "emphasis" }),
      "raised",
    ),
    text(caption, { size: "caption", tone: "tertiary" }),
  );

const strip = (...children: UsageTree[]): UsageTree => inline({ gap: "md", inlineAlign: "start" }, ...children);

/** Frames of the same entry: it arrives, which is what Presence gives it. */
export const presenceFramesDoTree = (t: Translate): UsageTree =>
  strip(frameBox(0, 0.9, "0 ms"), frameBox(0.5, 0.96, "80 ms"), frameBox(1, 1, "160 ms"));

/** Two frames: nothing, then everything. */
export const presenceFramesDontTree = (t: Translate): UsageTree => strip(frameBox(0, 1, "0 ms"), frameBox(1, 1, "1 ms"));

const para = (t: Translate, key: UIKey): UsageTree => text(t(key), { size: "sm" });

/** After it leaves, the paragraphs close up around the gap. */
export const presenceSpaceDoTree = (t: Translate): UsageTree =>
  box(`inline-size: 15rem; padding: 0.625rem; border: ${RULE}; border-radius: ${R};`, stack("xs", para(t, "demo.mock.presence.before"), para(t, "demo.mock.presence.after")));

/** It has faded, but its box is still there: a hole where the notice was. */
export const presenceSpaceDontTree = (t: Translate): UsageTree =>
  box(
    `inline-size: 15rem; padding: 0.625rem; border: ${RULE}; border-radius: ${R};`,
    stack("xs", para(t, "demo.mock.presence.before"), box("block-size: 2.5rem; padding: 0; background: transparent;", label("\u00a0"), "sunken"), para(t, "demo.mock.presence.after")),
  );
