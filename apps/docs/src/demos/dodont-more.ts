import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { tableTree } from "./table";
import { tablePagerTree, tablePagerMinimalTree } from "./table-pager";
import { treegridInboxTree } from "./treegrid";
import { dataGridScoresTree } from "./data-grid";

type UIKey = Parameters<Translate>[0];

/*
 * SECOND PAIRS FOR THE PAGES THAT HAD ONE: each rule here is one the page already states in prose and its first pair
 * does not draw. Where a page's own specimen can be reused it is, with the one detail changed (a table without its
 * caption, a pager without its range); where it cannot, the rule is drawn with the kit's own boxes and text.
 */

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({ contract: "typography", signature: "Text", options, children });
const heading = (children: string, size = "h5"): UsageTree => ({ contract: "typography", signature: "Heading", options: { headingSize: size, flush: true }, children });
const stack = (gap: string, ...children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Stack", options: { gap }, children });
const button = (children: string, variant = "solid"): UsageTree => ({ contract: "button", signature: "Button.action", options: { size: "sm", variant }, children });
const box = (style: string, children: UsageTree | UsageTree[], options: Record<string, string> = { surface: "surface", border: "subtle" }): UsageTree => ({
  contract: "box",
  signature: "Box",
  options,
  attrs: { style: `box-sizing: border-box; ${style}` },
  children,
});

/* ───────────── Hero: a title in a few words ───────────── */

const hero = (title: string, body: string): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  children: {
    contract: "wrapper",
    signature: "Wrapper",
    children: stack("sm", { contract: "typography", signature: "Heading", options: { headingSize: "h2", flush: true }, children: title }, text(body, { tone: "secondary" }), button("→", "solid")),
  },
});

export const heroTitleDoTree = (t: Translate): UsageTree => hero(t("dd3.hero.shortTitle"), t("dd3.hero.body"));
export const heroTitleDontTree = (t: Translate): UsageTree => hero(t("dd3.hero.longTitle"), t("dd3.hero.body"));

/* ───────────── Changelog: a breaking change says what to do ───────────── */

const release = (title: string, body: string): UsageTree => ({
  contract: "changelog",
  signature: "Changelog",
  attrs: { "aria-label": title },
  children: {
    contract: "changelog",
    signature: "ChangelogRelease",
    slots: { version: "0.2.0" },
    children: {
      contract: "changelog",
      signature: "ChangelogEntry",
      options: { kind: "breaking" },
      slots: { kind: "breaking", title },
      children: body,
    },
  },
});

export const changelogBreakingDoTree = (t: Translate): UsageTree => release(t("dd3.changelog.doTitle"), t("dd3.changelog.doBody"));
export const changelogBreakingDontTree = (t: Translate): UsageTree => release(t("dd3.changelog.dontTitle"), t("dd3.changelog.dontBody"));

/* ───────────── Carousel: each card has its own title ───────────── */

const slide = (title: string, body: string): UsageTree => ({
  contract: "carousel",
  signature: "CarouselSlide",
  children: box("padding: 0.75rem;", stack("xs", text(title, { size: "lg", weight: "label" }), text(body, { size: "sm", tone: "secondary" })), { padding: "md", surface: "surface", border: "subtle" }),
});

const carousel = (t: Translate, titles: readonly string[]): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  attrs: { "aria-label": t("demo.carousel.label") },
  children: titles.map((title, i) => slide(title, t(`dd3.carousel.body${i + 1}` as UIKey))),
});

export const carouselTitlesDoTree = (t: Translate): UsageTree => carousel(t, [t("dd3.carousel.t1"), t("dd3.carousel.t2"), t("dd3.carousel.t3")]);
export const carouselTitlesDontTree = (t: Translate): UsageTree => carousel(t, ["Slide 1", "Slide 2", "Slide 3"]);

/* ───────────── Canvas: a drawing, not controls ───────────── */

const canvas = (t: Translate, content: UsageTree): UsageTree => ({
  contract: "canvas",
  signature: "Canvas",
  options: { label: t("canvas.demoLabel"), zoomInLabel: t("canvas.zoomInLabel"), zoomOutLabel: t("canvas.zoomOutLabel"), fitLabel: t("canvas.fitLabel") },
  attrs: { style: "inline-size: 20rem; block-size: 11rem;" },
  slots: { touchHint: t("canvas.touchHint"), wheelHint: t("canvas.wheelHint"), children: content },
});

export const canvasDrawingDoTree = (t: Translate): UsageTree =>
  canvas(t, box("padding: 0.75rem;", text(t("canvas.nodeDraft")), { padding: "md", surface: "surface", border: "subtle" }));

export const canvasDrawingDontTree = (t: Translate): UsageTree =>
  canvas(t, box("padding: 0.75rem;", { contract: "layout", signature: "Inline", options: { gap: "xs" }, children: [button(t("dd3.canvas.save")), button(t("dd3.canvas.cancel"), "ghost")] }, { padding: "md", surface: "surface", border: "subtle" }));

/* ───────────── Card: one action, with a verb ───────────── */

const card = (title: string, body: string, actions: UsageTree[]): UsageTree =>
  box("inline-size: 15rem;", stack("sm", heading(title), text(body, { size: "sm", tone: "secondary" }), { contract: "layout", signature: "Inline", options: { gap: "xs" }, children: actions }), { padding: "md", surface: "raised", border: "subtle" });

export const cardActionDoTree = (t: Translate): UsageTree => card(t("dd3.card.name"), t("dd3.card.body"), [button(t("dd3.card.view"))]);
export const cardActionDontTree = (t: Translate): UsageTree =>
  card(t("dd3.card.name"), t("dd3.card.body"), [button(t("dd3.card.click")), button(t("dd3.card.more"), "ghost"), button(t("dd3.card.share"), "ghost")]);

/* ───────────── Table: short headers ───────────── */

function withTableHeaders(node: UsageTree, labels: string[]): UsageTree {
  if (node.signature === "TableHeader") return { ...node, children: labels.shift() ?? node.children };
  const children = node.children;
  if (children === undefined || typeof children === "string") return node;
  if (Array.isArray(children)) return { ...node, children: (children as UsageTree[]).map((child) => (typeof child === "string" ? child : withTableHeaders(child, labels))) };
  return { ...node, children: withTableHeaders(children as UsageTree, labels) };
}

export const tableHeadersDoTree = (t: Translate): UsageTree => tableTree(t);
export const tableHeadersDontTree = (t: Translate): UsageTree =>
  withTableHeaders(tableTree(t), [t("dd3.table.h1"), t("dd3.table.h2"), t("dd3.table.h3")]);

/* ───────────── TablePager: the range, with its total ───────────── */

export const tablePagerRangeDoTree = (t: Translate): UsageTree => tablePagerTree(t);
export const tablePagerRangeDontTree = (t: Translate): UsageTree => tablePagerMinimalTree(t);

/* ───────────── DataGrid: a hierarchy is a Treegrid ───────────── */

export const dataGridHierarchyDoTree = (t: Translate): UsageTree => treegridInboxTree(t);
export const dataGridHierarchyDontTree = (t: Translate): UsageTree => dataGridScoresTree(t);

/* ───────────── Treegrid: short headers ───────────── */

function withHeaders(tree: UsageTree, labels: readonly string[]): UsageTree {
  const grid = (tree.children as UsageTree);
  const parts = grid.children as readonly UsageTree[];
  const head = parts[0]!;
  const row = head.children as UsageTree;
  const cells = (row.children as readonly UsageTree[]).map((cell, i) => ({ ...cell, children: labels[i] ?? cell.children }));
  return { ...tree, children: { ...grid, children: [{ ...head, children: { ...row, children: cells } }, ...parts.slice(1)] } };
}

export const treegridHeadersDoTree = (t: Translate): UsageTree => treegridInboxTree(t);
export const treegridHeadersDontTree = (t: Translate): UsageTree =>
  withHeaders(treegridInboxTree(t), [t("dd3.treegrid.h1"), t("dd3.treegrid.h2"), t("dd3.treegrid.h3"), t("dd3.treegrid.h4")]);

/* ───────────── TreeView: short names ───────────── */

const treeOf = (t: Translate, names: readonly string[]): UsageTree => ({
  contract: "tree-view",
  signature: "TreeView",
  options: { label: t("demo.treeView.label") },
  attrs: { style: "inline-size: 13rem;" },
  slots: { items: names.map((name) => ({ options: { id: name }, slots: { label: name } })) },
});

export const treeViewNamesDoTree = (t: Translate): UsageTree => treeOf(t, ["index.ts", "app.ts", "styles.css", "README.md"]);
export const treeViewNamesDontTree = (t: Translate): UsageTree =>
  treeOf(t, ["informe-trimestral-de-ventas-final-v3.pdf", "presentacion-para-la-direccion-revisada.key", "hoja-de-calculo-del-presupuesto-2026.xlsx", "notas-de-la-reunion-del-jueves-con-el-equipo.md"]);

/* ───────────── Stack: one gap, not margins ───────────── */

export const stackRhythmDoTree = (t: Translate): UsageTree =>
  stack("md", heading(t("dd3.stack.heading")), text(t("dd3.stack.body")), button(t("dd3.stack.action")));

export const stackRhythmDontTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    { ...heading(t("dd3.stack.heading")), attrs: { style: "margin-block-end: 0;" } },
    { ...text(t("dd3.stack.body")), attrs: { style: "margin-block: 2rem 0;" } },
    { ...button(t("dd3.stack.action")), attrs: { style: "margin-block-start: 0.25rem;" } },
  ],
});

/* ───────────── Wrapper: a measure to read at ───────────── */

const prose = (t: Translate): UsageTree => text(t("dd3.wrapper.body"));
const frame = (children: UsageTree): UsageTree => box("inline-size: 44rem; padding: 0.5rem;", children, { padding: "sm", surface: "surface", border: "subtle" });

export const wrapperMeasureDoTree = (t: Translate): UsageTree => frame({ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "sm" }, children: prose(t) });
export const wrapperMeasureDontTree = (t: Translate): UsageTree => frame(prose(t));

/* ───────────── BackToTop: only where there is a top to go back to ───────────── */

const page = (lines: number, t: Translate): UsageTree =>
  box(
    "position: relative; inline-size: 14rem; block-size: 8rem; overflow: hidden; padding: 0.5rem;",
    [
      stack("xs", ...Array.from({ length: lines }, (_, i) => text(t(`dd3.backToTop.line${(i % 3) + 1}` as UIKey), { size: "sm" }))),
      box("position: absolute; inset-block-end: 0.5rem; inset-inline-end: 0.5rem; padding: 0.125rem 0.5rem; border-radius: 999px;", text("↑", { weight: "emphasis" }), { surface: "raised", border: "default" }),
    ],
    { padding: "none", surface: "surface", border: "subtle" },
  );

export const backToTopLengthDoTree = (t: Translate): UsageTree => page(14, t);
export const backToTopLengthDontTree = (t: Translate): UsageTree => page(2, t);

/* ───────────── CodePreview: code in a sentence is Code ───────────── */

export const codePreviewInlineDoTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [t("dd3.code.before"), { contract: "typography", signature: "Code", attrs: { style: "white-space: nowrap;" }, children: "--sk-button-radius" }, t("dd3.code.after")],
});

export const codePreviewInlineDontTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs" },
  children: [
    text(t("dd3.code.before") + t("dd3.code.after")),
    { contract: "code-preview", signature: "CodePreview", slots: { label: "css", children: "--sk-button-radius" } },
  ],
});

/* ───────────── Scrollbar: visible when there is more to find ───────────── */

import { scrollbarAlwaysTree, scrollbarRevealTree } from "./scrollbar";

export const scrollbarVisibleDoTree = (t: Translate): UsageTree => scrollbarAlwaysTree(t);
export const scrollbarVisibleDontTree = (t: Translate): UsageTree => scrollbarRevealTree(t);
