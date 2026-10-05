import { slotItems, slotsOf, isUsageTree, type UsageTree } from "@skryensya/core/usage-tree";
import { walkUsageTree } from "./usage-walk.js";

/*
 * DESIGN QUALITY, as rules a tree can fail.
 *
 * `validate_ui` answers "does this compose?" and nothing else: a page can be valid and have two h1s, a
 * heading that skips a level, six buttons that all say "Add to cart" and no way past the navigation.
 * This answers the other question, "is it any good?", for the part of "good" that is checkable from the
 * tree. Every rule here is deterministic, names the guideline behind it (WCAG success criterion or the
 * kit's own convention), and says how to fix the tree, so a failure is a decision to revisit and not an
 * opinion.
 *
 * TWO SEVERITIES, and the difference is the point:
 *   - `error`: an accessibility failure the tree itself causes. A page with one of these is broken for
 *     somebody, whatever it looks like. Style never outranks it.
 *   - `warn`: a mediocre-design smell. Nothing is inaccessible, but the page is harder to scan or use
 *     than it needs to be (several competing primary actions, a data table with no row headers).
 *
 * What it does NOT claim: contrast, focus visibility, target size and reflow depend on rendering, and are
 * settled where the page is actually drawn (`packages/ai-gates`, `patterns.spec.ts`). A clean review is
 * necessary, not sufficient.
 */

export type Severity = "error" | "warn";

export type Finding = {
  readonly rule: string;
  readonly severity: Severity;
  /** Where in the tree: signatures from the root, the same shape `validate_ui` problems use. */
  readonly path: string;
  readonly message: string;
  /** The guideline behind it. */
  readonly reference: string;
  /** What to change. */
  readonly fix: string;
};

export type Review = {
  readonly findings: readonly Finding[];
  readonly errors: number;
  readonly warnings: number;
  /** True when no `error` remains. Warnings never fail a review; they are the part left to judgement. */
  readonly passes: boolean;
};

type Visit = { node: UsageTree; ancestors: readonly UsageTree[]; path: string };

const pathOf = (ancestors: readonly UsageTree[], node: UsageTree) =>
  [...ancestors, node].map((entry) => entry.signature).join(" > ");

/** Every visible string inside a node, in order: what a screen reader would read as its name. */
export function textOf(node: UsageTree): string {
  const parts: string[] = [];
  const collect = (content: unknown): void => {
    for (const item of slotItems(content as Parameters<typeof slotItems>[0])) {
      if (typeof item === "string") parts.push(item);
      else if (isUsageTree(item)) parts.push(textOf(item));
    }
  };
  collect(node.children);
  for (const [key, content] of Object.entries(slotsOf(node))) {
    if (key === "children") continue;
    collect(content);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

const visits = (tree: UsageTree): Visit[] => {
  const out: Visit[] = [];
  walkUsageTree(tree, (node, ancestors) => out.push({ node, ancestors, path: pathOf(ancestors, node) }));
  return out;
};

const GENERIC_NAMES = new Set(["click here", "here", "read more", "more", "learn more", "link", "go", "details"]);

const levelOf = (node: UsageTree): number => {
  const element = String(node.options?.headingElement ?? "h2");
  return Number(element.slice(1)) || 2;
};

/** The accessible name a control exposes: `aria-label` wins over its text, as in the platform. */
const nameOf = (node: UsageTree): string => (node.attrs?.["aria-label"] ?? textOf(node)).trim().toLowerCase();

const isControl = (node: UsageTree): boolean =>
  node.signature === "Button.action" ||
  node.signature === "Button.navigation" ||
  node.signature === "Link" ||
  node.signature === "Tag.link" ||
  node.signature === "ListItemLink";

type Rule = (all: readonly Visit[], tree: UsageTree) => Finding[];

const rules: readonly Rule[] = [
  /* ── page structure ─────────────────────────────────────────────────────────────────────────── */
  (all, tree) => {
    const h1s = all.filter(({ node }) => node.signature === "Heading" && levelOf(node) === 1);
    const hasPageChrome = all.some(({ node }) => node.signature === "Main");
    if (!hasPageChrome) return [];
    if (h1s.length === 1) return [];
    return [
      {
        rule: "one-h1",
        severity: "error",
        path: h1s[1]?.path ?? tree.signature,
        message: h1s.length === 0 ? "The page has no h1." : `The page has ${h1s.length} h1 headings.`,
        reference: "WCAG 2.4.6 Headings and Labels; 1.3.1 Info and Relationships",
        fix: "Give the page exactly one Heading with headingElement h1: the subject of the page. Use h2 and below for the rest.",
      },
    ];
  },
  (all) => {
    const out: Finding[] = [];
    let previous = 0;
    for (const { node, path } of all) {
      if (node.signature !== "Heading") continue;
      const level = levelOf(node);
      if (previous !== 0 && level > previous + 1) {
        out.push({
          rule: "heading-order",
          severity: "error",
          path,
          message: `An h${level} follows an h${previous}: the outline skips ${level - previous - 1} level${level - previous > 2 ? "s" : ""}.`,
          reference: "WCAG 1.3.1 Info and Relationships; 2.4.10 Section Headings",
          fix: `Use h${previous + 1} here. Choose the heading level for the document outline, and the size separately with headingSize.`,
        });
      }
      previous = level;
    }
    return out;
  },
  (all, tree) => {
    const mains = all.filter(({ node }) => node.signature === "Main");
    const asMain = all.filter(({ node }) => node.options?.layoutElement === "main" || node.options?.boxElement === "main");
    const total = mains.length + asMain.length;
    const pageLike = all.some(({ node }) => node.signature === "Navbar" || node.signature === "Sidebar" || node.signature === "Footer");
    if (total === 1 || (total === 0 && !pageLike)) return [];
    return [
      {
        rule: "one-main",
        severity: "error",
        path: mains[1]?.path ?? tree.signature,
        message: total === 0 ? "The page has chrome (navigation or a footer) but no main landmark." : `The page has ${total} main landmarks.`,
        reference: "WCAG 1.3.1; 2.4.1 Bypass Blocks (ARIA landmark: main)",
        fix: "Put the page's primary content in exactly one layout.Main.",
      },
    ];
  },
  (all, tree) => {
    const hasMain = all.some(({ node }) => node.signature === "Main");
    const hasNav = all.some(({ node }) => node.signature === "Navbar" || node.signature === "Sidebar");
    if (!hasMain || !hasNav) return [];
    const skip = all.find(({ node }) => node.signature === "SkipLink");
    const mainId = all.find(({ node }) => node.signature === "Main")?.node.attrs?.id;
    if (!skip) {
      return [
        {
          rule: "skip-link",
          severity: "error",
          path: tree.signature,
          message: "The page has navigation before its content and no way to skip it.",
          reference: "WCAG 2.4.1 Bypass Blocks",
          fix: 'Add a SkipLink as the first focusable element, with href pointing at the Main\'s id (give the Main attrs { id: "main" }).',
        },
      ];
    }
    const target = String(skip.node.options?.href ?? "").replace(/^#/, "");
    if (!mainId || mainId !== target) {
      return [
        {
          rule: "skip-link-target",
          severity: "error",
          path: skip.path,
          message: `The skip link points at "#${target}" but the Main's id is ${mainId ? `"${mainId}"` : "not set"}.`,
          reference: "WCAG 2.4.1 Bypass Blocks",
          fix: "Make the SkipLink's href and the Main's id the same value.",
        },
      ];
    }
    const main = all.find(({ node }) => node.signature === "Main")!;
    if (main.node.attrs?.tabindex !== "-1") {
      return [
        {
          rule: "skip-link-focusable",
          severity: "error",
          path: main.path,
          message: "The skip link's destination cannot take focus, so in some browsers the next Tab lands back in the navigation it skipped.",
          reference: "WCAG 2.4.1 Bypass Blocks (technique G1: the target must be focusable)",
          fix: 'Give the Main attrs { tabindex: "-1" } next to its id.',
        },
      ];
    }
    return [];
  },
  (all) => {
    const first = all.find(({ node }) => isControl(node) || node.signature === "SkipLink");
    if (!first || first.node.signature === "SkipLink") return [];
    const hasSkip = all.some(({ node }) => node.signature === "SkipLink");
    return hasSkip
      ? [
          {
            rule: "skip-link-first",
            severity: "error",
            path: first.path,
            message: "A control comes before the skip link, so keyboard users meet it first.",
            reference: "WCAG 2.4.1 Bypass Blocks",
            fix: "Move the SkipLink to the very start of the page.",
          },
        ]
      : [];
  },
  /* ── landmarks and names ────────────────────────────────────────────────────────────────────── */
  (all) => {
    const navs = all.filter(({ node }) => node.signature === "NavList" || node.signature === "Breadcrumb" || node.signature === "Pagination");
    const named = (node: UsageTree) => Boolean(node.attrs?.["aria-label"] || node.attrs?.["aria-labelledby"] || node.options?.label);
    if (navs.length < 2) return [];
    return navs
      .filter(({ node }) => !named(node))
      .map(({ path }) => ({
        rule: "landmarks-named",
        severity: "error" as const,
        path,
        message: "One of several navigation landmarks has no name.",
        reference: "WCAG 1.3.1; ARIA landmarks: multiple nav need distinct names",
        fix: "Give each NavList an aria-label (and Breadcrumb and Pagination their label option).",
      }));
  },
  (all) => {
    const names = new Map<string, Visit[]>();
    for (const visit of all) {
      if (!isControl(visit.node)) continue;
      const name = nameOf(visit.node);
      if (!name) continue;
      names.set(name, [...(names.get(name) ?? []), visit]);
    }
    const out: Finding[] = [];
    for (const [name, group] of names) {
      if (group.length < 2) continue;
      const hrefs = new Set(group.map(({ node }) => String(node.options?.href ?? "")));
      const actions = group[0]!.node.signature === "Button.action";
      /* Two links with one name that go to the SAME place are one destination twice (a logo and a menu
         item). Two ACTION buttons with one name are ambiguous only when they repeat (a row of cards):
         a call to action said at the top and again at the close is one intent, said twice. */
      if (!actions && hrefs.size === 1) continue;
      if (actions && group.length < 3) continue;
      out.push({
        rule: "distinct-control-names",
        severity: "error",
        path: group[1]!.path,
        message: `${group.length} controls are named "${name}", and a screen reader's list of controls cannot tell them apart.`,
        reference: "WCAG 2.4.4 Link Purpose (In Context); 2.5.3 Label in Name",
        fix: "Make each name say what it acts on (\"Add Trail jacket to cart\"), or set aria-label while keeping the visible words as its start.",
      });
    }
    return out;
  },
  (all) =>
    all
      .filter(({ node }) => isControl(node) && GENERIC_NAMES.has(nameOf(node)))
      .map(({ path, node }) => ({
        rule: "generic-control-name",
        severity: "error" as const,
        path,
        message: `"${nameOf(node)}" says nothing about where it goes or what it does.`,
        reference: "WCAG 2.4.4 Link Purpose (In Context); 2.4.9",
        fix: "Name the destination or the action: \"Read the installation guide\", not \"Read more\".",
      })),
  /* ── data ───────────────────────────────────────────────────────────────────────────────────── */
  (all) =>
    all
      .filter(({ node }) => node.signature === "Table")
      .flatMap(({ node, path }) => {
        const children = slotItems(node.children).filter((item): item is UsageTree => typeof item !== "string");
        const out: Finding[] = [];
        if (!children.some((child) => child.signature === "TableCaption")) {
          out.push({
            rule: "table-caption",
            severity: "error",
            path,
            message: "The table has no caption, so it has no name.",
            reference: "WCAG 1.3.1; 2.4.6",
            fix: "Add a TableCaption as the table's first child, saying what the table shows.",
          });
        }
        const body = children.find((child) => child.signature === "TableBody");
        const firstCells = slotItems(body?.children)
          .filter((row): row is UsageTree => typeof row !== "string")
          .map((row) => slotItems(row.children).find((cell): cell is UsageTree => typeof cell !== "string"));
        if (firstCells.length > 0 && firstCells.some((cell) => cell?.signature !== "TableHeader")) {
          out.push({
            rule: "table-row-headers",
            severity: "warn",
            path,
            message: "The rows have no row header, so a cell is announced without saying which record it belongs to.",
            reference: "WCAG 1.3.1 Info and Relationships (technique H63)",
            fix: 'Make each row\'s first cell a TableHeader with scope "row".',
          });
        }
        return out;
      }),
  (all) =>
    all
      .filter(({ node }) => node.signature === "TableScroll")
      .filter(({ node }) => node.attrs?.tabindex !== "0" || !(node.attrs?.["aria-label"] || node.attrs?.["aria-labelledby"]))
      .map(({ path }) => ({
        rule: "table-scroll-focusable",
        severity: "error" as const,
        path,
        message: "The table's scroll box has no tab stop or no name, so where it scrolls sideways the keyboard cannot reach what is off screen.",
        reference: "WCAG 2.1.1 Keyboard; 4.1.2 Name, Role, Value (axe: scrollable-region-focusable)",
        fix: 'Give the TableScroll attrs { tabindex: "0", role: "region", "aria-label": "<what the table shows>" }.',
      })),
  /* ── references ─────────────────────────────────────────────────────────────────────────────── */
  (all) => {
    const ids = new Set(all.map(({ node }) => node.attrs?.id).filter((id): id is string => Boolean(id)));
    return all.flatMap(({ node, path }) => {
      const target = node.attrs?.["aria-labelledby"];
      if (!target) return [];
      return target
        .split(/\s+/)
        .filter((id) => !ids.has(id))
        .map((id) => ({
          rule: "labelledby-target",
          severity: "error" as const,
          path,
          message: `aria-labelledby points at "${id}", and nothing in the page has that id: the region has no name, so it is not a landmark.`,
          reference: "WCAG 4.1.2 Name, Role, Value; 1.3.1 (ARIA: aria-labelledby must reference an existing id)",
          fix: `Give the heading the id "${id}" (attrs { id: "${id}" }), or point aria-labelledby at the id it already has.`,
        }));
    });
  },
  /* ── forms ──────────────────────────────────────────────────────────────────────────────────── */
  (all) =>
    all
      .filter(({ node }) => node.signature === "FormField" && node.options?.labelHidden === true)
      .map(({ path }) => ({
        rule: "hidden-label",
        severity: "warn" as const,
        path,
        message: "The field's label is visually hidden.",
        reference: "WCAG 3.3.2 Labels or Instructions; plain-language guidance",
        fix: "Show the label unless a visible heading or button already says exactly what the field is (a search box beside a Search button).",
      })),
  /* ── mediocre-design smells ─────────────────────────────────────────────────────────────────── */
  (all) => {
    const primary = all.filter(
      ({ node }) => node.signature.startsWith("Button.") && node.options?.tone === "accent" && (node.options?.variant ?? "solid") === "solid",
    );
    if (primary.length <= 2) return [];
    return [
      {
        rule: "competing-primary-actions",
        severity: "warn",
        path: primary[2]!.path,
        message: `${primary.length} solid accent buttons compete on one page.`,
        reference: "Visual hierarchy: one primary action per view",
        fix: "Keep one solid accent action per region; make the others soft or ghost.",
      },
    ];
  },
  (all) => {
    const buttons = all.filter(({ node }) => node.signature.startsWith("Button.") && node.options?.iconOnly === true);
    return buttons
      .filter(({ node }) => !node.attrs?.["aria-label"] && !node.attrs?.["aria-labelledby"])
      .map(({ path }) => ({
        rule: "icon-only-named",
        severity: "error" as const,
        path,
        message: "An icon-only button has no accessible name.",
        reference: "WCAG 4.1.2 Name, Role, Value; 1.1.1 Non-text Content",
        fix: "Add attrs { \"aria-label\": \"<action>\" }.",
      }));
  },
];

/** Review a tree. Deterministic: the same tree always yields the same findings, in the same order. */
export function reviewTree(tree: UsageTree): Review {
  const all = visits(tree);
  const findings = rules.flatMap((rule) => rule(all, tree));
  const errors = findings.filter((finding) => finding.severity === "error").length;
  return { findings, errors, warnings: findings.length - errors, passes: errors === 0 };
}
