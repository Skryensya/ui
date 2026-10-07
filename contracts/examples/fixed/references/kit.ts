import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * SHORTHANDS for the reference patterns, nothing more: each one returns the same `UsageTree` a pattern
 * could write by hand, so a pattern still reads as a tree of published signatures. They exist because a
 * whole page is a few hundred nodes, and most of them are the same ten shapes.
 */
type Node = UsageTree | string;
type Opts = Record<string, string | number | boolean>;

export const text = (children: Node, options: Opts = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  children,
});

export const heading = (children: Node, size: string, as: string): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: size, headingElement: as },
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

export const grid = (children: Node[], options: Opts = {}): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options,
  children,
});

export const box = (children: Node | Node[], options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "box",
  signature: "Box",
  options,
  ...(attrs ? { attrs } : {}),
  children: children as UsageTree["children"],
});

export const main = (children: Node | Node[], attrs: Record<string, string> = {}): UsageTree => ({
  contract: "layout",
  signature: "Main",
  attrs: { id: "main", tabindex: "-1", ...attrs },
  children: children as UsageTree["children"],
});

export const icon = (name: string): UsageTree => ({ contract: "icon", signature: "Icon", options: { name } });

export const button = (label: Node, options: Opts = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options,
  ...(attrs ? { attrs } : {}),
  children: label,
});

export const iconButton = (name: string, label: string, options: Opts = {}): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { iconOnly: true, variant: "ghost", ...options },
  attrs: { "aria-label": label },
  children: icon(name),
});

export const link = (label: Node, href: string): UsageTree => ({
  contract: "typography",
  signature: "Link",
  options: { href },
  children: label,
});

export const badge = (label: string, tone = "neutral"): UsageTree => ({
  contract: "badge",
  signature: "Badge",
  options: { tone, size: "sm" },
  children: label,
});

export const tag = (label: string, tone = "neutral"): UsageTree => ({
  contract: "tag",
  signature: "Tag",
  options: { tone },
  children: label,
});

export const navbar = (brand: string, actions: Node[]): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    { contract: "navbar", signature: "NavbarBrand", children: brand },
    { contract: "navbar", signature: "NavbarActions", children: actions as UsageTree["children"] },
  ],
});

export const skipLink = (label = "Skip to content"): UsageTree => ({
  contract: "skip-link",
  signature: "SkipLink",
  options: { href: "#main" },
  children: label,
});

export const navLink = (label: string, href: string, current = false, extra: Record<string, Node> = {}): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  slots: { children: label, ...extra } as UsageTree["slots"],
});

export const navList = (label: string, groups: UsageTree[]): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": label },
  children: groups,
});

export const navGroup = (links: UsageTree[], label?: string): UsageTree => ({
  contract: "nav-list",
  signature: "NavListGroup",
  slots: { ...(label ? { label } : {}), children: links } as UsageTree["slots"],
});

export const table = (caption: string, head: string[], rows: Node[][], rowHeaders = true): UsageTree => ({
  contract: "table",
  signature: "TableScroll",
  /* A table that is wider than its column scrolls sideways, and a scrolling region has to be reachable and named: tabindex 0 puts it in the tab order, role region plus a name make it a landmark a screen reader can announce. */
  attrs: { tabindex: "0", role: "region", "aria-label": caption },
  children: {
    contract: "table",
    signature: "Table",
    children: [
      { contract: "table", signature: "TableCaption", children: caption },
      {
        contract: "table",
        signature: "TableHead",
        children: {
          contract: "table",
          signature: "TableRow",
          children: head.map((label) => ({ contract: "table", signature: "TableHeader", options: { scope: "col" }, children: label })),
        },
      },
      {
        contract: "table",
        signature: "TableBody",
        children: rows.map((cells) => ({
          contract: "table",
          signature: "TableRow",
          children: cells.map((cell, index) =>
            rowHeaders && index === 0
              ? { contract: "table", signature: "TableHeader", options: { scope: "row" }, children: cell as UsageTree["children"] }
              : { contract: "table", signature: "TableCell", children: cell as UsageTree["children"] },
          ),
        })),
      },
    ],
  },
});

export const field = (label: string, control: UsageTree, extra: { hint?: string; labelHidden?: boolean } = {}): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  options: extra.labelHidden ? { labelHidden: true } : {},
  slots: { label, ...(extra.hint ? { hint: extra.hint } : {}), children: control } as UsageTree["slots"],
});

export const input = (options: Opts): UsageTree => ({ contract: "input", signature: "Input", options });

/* No gutter of its own by default: a page region gets its inline inset from the `band` that holds it, so the inset is written once and every region starts at the same left edge. */
export const wrapper = (children: Node | Node[], size = "lg", gutter = "none"): UsageTree => ({
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: size, gutter },
  children: children as UsageTree["children"],
});

/*
 * A BAND: one horizontal region of a page. It owns the page's inset (the Box padding), and its content sits
 * in a Wrapper with no gutter of its own, so every band's text starts at the SAME left edge whether or not
 * the band has a background. A page is a Stack of bands; nothing else sets the left edge.
 */
export const band = (children: Node[], options: { surface?: string; gap?: string } = {}): UsageTree =>
  box(wrapper(stack(children, { gap: options.gap ?? "md" })), { padding: "lg", surface: options.surface ?? "none", radius: "none" });

export const itemList = (entries: Array<[value: string, label: string]>) =>
  entries.map(([value, label]) => ({ options: { value }, slots: { label } }));

export const avatar = (name: string): UsageTree => ({
  contract: "avatar",
  signature: "Avatar.initials",
  options: { name, size: "sm" },
  children: name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2),
});

export const appShell = (children: Node[], options: Opts = {}): UsageTree => ({
  contract: "layout",
  signature: "AppShell",
  options,
  children: children as UsageTree["children"],
});

/*
 * THE RAIL ON A PHONE. Below the expanded line an AppShell does not draw its rails, so what a rail carries
 * travels in a drawer instead: the same navigation, opened by a button that exists only on that side of the
 * line (`show: "compact"`). Two nodes because they live in two places: the trigger in the header, the drawer
 * as a child of the shell.
 */
export const railTrigger = (panelId: string, label: string): UsageTree =>
  inline(
    [
      {
        contract: "vaul",
        signature: "Vaul.Trigger",
        options: { opens: panelId, buttonVariant: "ghost", buttonIconOnly: true, buttonLabel: label },
        children: icon("menu"),
      },
    ],
    { show: "compact" },
  );

export const railDrawer = (panelId: string, label: string, content: UsageTree): UsageTree => ({
  contract: "vaul",
  signature: "Vaul.drawer",
  options: { panelId, label, edge: "inline-start" },
  /* The panel owns no inset: what sits in it does, the way a page's Box does. */
  children: box(
    stack(
      [
        inline(
          [
            text(label, { weight: "emphasis" }),
            {
              contract: "vaul",
              signature: "Vaul.Close",
              options: { buttonVariant: "ghost", buttonIconOnly: true, buttonLabel: `Close ${label.toLowerCase()}` },
              children: icon("close"),
            },
          ],
          { justify: "between", inlineAlign: "center" },
        ),
        content,
      ],
      { gap: "md" },
    ),
    { padding: "md" },
  ),
});
