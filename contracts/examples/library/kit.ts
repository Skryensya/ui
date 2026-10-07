import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * THE SMALL PIECES EVERY PATTERN BUILDS WITH. Each returns the same `UsageTree` a pattern could write by
 * hand, so a pattern still reads as a tree of published signatures. Nothing here carries a word of
 * copy: the strings come in as arguments, from a use's content.
 *
 * Headings inside a pattern start at h4, because the pages that show one put it under an h2 (the
 * subject) and an h3 (the example's title). A pattern whose whole job is to be a page owns its h1.
 */

export type Opts = Record<string, string | number | boolean>;
export type Node = UsageTree | string;
export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface Person {
  readonly name: string;
  readonly initials: string;
}

export const text = (children: Node | Node[], options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  ...(attrs ? { attrs } : {}),
  children: children as UsageTree["children"],
});

/** Text that must sit inside a `<span>` slot (a list row's trailing, a switch label): a `<p>` there is invalid HTML. */
export const inlineText = (children: Node | Node[], options: Opts = {}, attrs?: Record<string, string>): UsageTree =>
  text(children, { ...options, textElement: "span" }, attrs);

export const heading = (children: Node, size = "h5", options: Opts = {}): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingElement: "h4", headingSize: size, flush: true, ...options },
  children,
});

export const stack = (children: Node[], options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options,
  ...(attrs ? { attrs } : {}),
  children,
});

export const inline = (children: Node[], options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options,
  ...(attrs ? { attrs } : {}),
  children,
});

export const grid = (children: Node[], options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options,
  ...(attrs ? { attrs } : {}),
  children,
});

export const box = (children: Node[], options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "box",
  signature: "Box",
  options,
  ...(attrs ? { attrs } : {}),
  children,
});

export const icon = (name: string, size: "sm" | "md" | "lg" = "md"): UsageTree => ({ contract: "icon", signature: "Icon", options: { name, size } });

export const avatar = (person: Person, size: "sm" | "md" | "lg" | "xl" = "sm"): UsageTree => ({
  contract: "avatar",
  signature: "Avatar.initials",
  options: { name: person.name, size },
  children: person.initials,
});

export const badge = (label: string, tone: Tone = "neutral", size: "sm" | "md" = "md"): UsageTree => ({
  contract: "badge",
  signature: "Badge",
  options: tone === "neutral" ? { size } : { tone, size },
  children: label,
});

export const separator = (): UsageTree => ({ contract: "separator", signature: "Separator", options: { spacing: "none", tone: "default" } });

export const action = (label: Node, options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options,
  ...(attrs ? { attrs } : {}),
  children: label,
});

export const navAction = (label: Node, href: string, options: Opts = {}): UsageTree => ({
  contract: "button",
  signature: "Button.navigation",
  options: { href, ...options },
  children: label,
});

/** The bordered, padded surface a card sits on, with its content one column. `featured` lifts it and darkens its edge. */
export const surface = (children: Node[], featured = false): UsageTree =>
  box([stack(children, { gap: "md" })], featured ? { surface: "raised", border: "default", padding: "lg", boxElement: "article" } : { surface: "surface", border: "subtle", padding: "lg", boxElement: "article" });

/** A card's own title, with an optional line under it. */
export const titleBlock = (title: string, body?: string): UsageTree =>
  stack([heading(title), ...(body ? [text(body, { size: "sm", tone: "secondary" })] : [])], { gap: "xs" });

/** A named, responsive grid: one lane on a phone, `columns` on a desktop. `equal` stretches every cell to its row's tallest. */
export const lanes = (label: string, children: Node[], columns: "2" | "3" = "3", equal = false): UsageTree =>
  grid(children, equal ? { columns, gap: "md", responsive: true, align: "stretch" } : { columns, gap: "md", responsive: true }, { role: "group", "aria-label": label });

/** A `List` of rows; each row is a `ListItem` (or `ListItemLink` with an href) with the slots it has. */
export interface Row {
  readonly leading?: UsageTree;
  readonly title: string;
  readonly description?: string;
  readonly trailing?: UsageTree | UsageTree[];
  readonly href?: string;
}

export const list = (label: string, rows: readonly Row[], dividers = true): UsageTree => ({
  contract: "list",
  signature: "List",
  options: { dividers },
  attrs: { "aria-label": label },
  children: rows.map(
    (row): UsageTree => ({
      contract: "list",
      signature: row.href ? "ListItemLink" : "ListItem",
      ...(row.href ? { options: { href: row.href } } : {}),
      slots: {
        ...(row.leading ? { leading: row.leading } : {}),
        title: row.title,
        ...(row.description ? { description: row.description } : {}),
        ...(row.trailing ? { trailing: row.trailing } : {}),
      },
    }),
  ),
});

export const tone = (value: string | undefined): Tone => (value === "accent" || value === "success" || value === "warning" || value === "danger" ? value : "neutral");
