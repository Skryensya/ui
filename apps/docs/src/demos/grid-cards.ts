import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE CARDS EVERY GRID EXAMPLE FILLS ITS LANES WITH.
 *
 * A grid of identical white boxes shows the lanes and nothing else: the eye cannot tell one cell from the next, so
 * the layout reads as a table with the lines rubbed out. Here every card has a tint of its own, taken from the
 * status surfaces (the same ones Scroll Stack's back layers use, so the text on them keeps its contrast in both
 * schemes), and a little content of the kind a card in a grid holds: what it is, what it is called, how big it is.
 * Project names stay written, as they do everywhere on the site.
 */

/* Three that read as three colours: the accent and success surfaces are both green in the default brand. */
const TINTS = ["accent", "info", "warning"] as const;

const PROJECTS = [
  { name: "Atlas", kind: "design", tasks: 12 },
  { name: "Brisa", kind: "research", tasks: 8 },
  { name: "Cauce", kind: "ops", tasks: 21 },
  { name: "Delta", kind: "growth", tasks: 5 },
  { name: "Estuario", kind: "design", tasks: 16 },
  { name: "Faro", kind: "research", tasks: 9 },
  { name: "Greda", kind: "ops", tasks: 3 },
  { name: "Hiedra", kind: "growth", tasks: 14 },
] as const;

type Project = (typeof PROJECTS)[number];

export const gridTint = (index: number): string => `var(--color-bg-${TINTS[index % TINTS.length]}-subtle)`;

const text = (children: string, options: Record<string, string>): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  children,
});

/**
 * One project card: a small label for its kind, its name, and a line of numbers. `featured` gives it more air and a
 * larger name, the way a card that spans two lanes would carry itself; `compact` drops the numbers line, for the Do/Don't
 * pairs, which are drawn at a third of their size and would otherwise print it too small to read; `extra` adds a line of copy so that cells of a
 * multi-column grid differ in height.
 */
export const projectTile = (
  t: Translate,
  index: number,
  opts: { featured?: boolean; extra?: string; padding?: "md" | "lg"; compact?: boolean } = {},
): UsageTree => {
  const project: Project = PROJECTS[index % PROJECTS.length]!;
  return {
    contract: "box",
    signature: "Box",
    options: { padding: opts.padding ?? (opts.featured ? "lg" : "md"), radius: "surface" },
    attrs: { style: `background: ${gridTint(index)};` },
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        text(t(`demo.gridCards.kind.${project.kind}` as Parameters<Translate>[0]), { size: "caption", weight: "label", tone: "secondary" }),
        text(project.name, { size: opts.featured ? "lg" : "body", weight: "emphasis" }),
        ...(opts.compact ? [] : [text(t("demo.gridCards.tasks", { n: String(project.tasks) }), { size: "sm", tone: "secondary" })]),
        ...(opts.extra ? [text(opts.extra, { size: "sm" })] : []),
      ],
    },
  };
};
