import type { UsageTree } from "@skryensya/core/usage-tree";
import { slotsOf } from "@skryensya/core/usage-tree";
import { fromUsageTree, type IdFactory } from "./project.js";
import { PROMPT_LIMIT, SITE_FORMAT, SITE_FORMAT_VERSION, type MakerSite } from "./site.js";

/*
 * A DOCS TEMPLATE AS A MAKER SITE. The gallery's templates (artifacts/templates.json) are usage trees
 * written with the kit alone: what a phone shows and a wide screen hides is `show` on a layout
 * primitive, and a rail reaches a phone through a `Vaul.drawer` (decision 35), so the tree reads the
 * same in the gallery's frame and on the Maker's stage. A class the gallery still hands a node (a demo
 * hook, never layout) means nothing to the Maker, which has no authorable classes, so it is dropped.
 *
 * The tree becomes the one page of a new site, inside the page's Main unless it already is one.
 */

function withoutClasses(content: unknown): unknown {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(withoutClasses);
  if (typeof content === "object" && content !== null && "signature" in content) return withoutTemplateChrome(content as UsageTree);
  if (typeof content === "object" && content !== null && "slots" in content) {
    const entry = content as { options?: unknown; slots: Record<string, unknown> };
    return { ...entry, slots: Object.fromEntries(Object.entries(entry.slots).map(([name, value]) => [name, withoutClasses(value)])) };
  }
  return content;
}

/** The tree without the gallery's own classes. */
export function withoutTemplateChrome(tree: UsageTree): UsageTree {
  const { class: _class, ...attrs } = tree.attrs ?? {};
  const slots = Object.fromEntries(Object.entries(slotsOf(tree)).map(([name, content]) => [name, withoutClasses(content)]));
  const { children, ...named } = slots;
  return {
    contract: tree.contract,
    signature: tree.signature,
    ...(tree.options ? { options: tree.options } : {}),
    ...(Object.keys(attrs).length ? { attrs } : {}),
    ...(Object.keys(named).length ? { slots: named as UsageTree["slots"] } : {}),
    ...(children !== undefined ? { children: children as UsageTree["children"] } : {}),
  };
}

/*
 * A SHELL TEMPLATE IS A LAYOUT AND A PAGE. A template whose tree is an AppShell (a header, a Main, perhaps rails, a
 * footer and the drawer that carries them to a phone) is not one page: its frame is what every page of the site shares, and only what is inside its Main is this page. So the
 * frame becomes the site's default layout, with its Main left as the outlet, and the Main's content becomes the page.
 * Put in a Main as it is, it would read Main > AppShell > Main: a main landmark inside another, and a frame that each
 * new page would have to copy.
 */
const isShell = (tree: UsageTree) => tree.contract === "layout" && tree.signature === "AppShell";
const childList = (tree: UsageTree): UsageTree[] => (Array.isArray(tree.children) ? tree.children : tree.children && typeof tree.children === "object" ? [tree.children] : []).filter((child): child is UsageTree => typeof child === "object" && child !== null && "signature" in child);

/** The AppShell of a template and what sits beside it (a skip link put before it), when the template is one. */
function shellOf(tree: UsageTree): { shell: UsageTree; before: UsageTree[] } | undefined {
  if (isShell(tree)) return { shell: tree, before: [] };
  if (tree.signature !== "Stack") return undefined;
  const children = childList(tree);
  const shell = children.find(isShell);
  return shell && children.every((child) => child === shell || child.signature === "SkipLink") ? { shell, before: children.filter((child) => child !== shell) } : undefined;
}

export function siteFromTemplate(
  tree: UsageTree,
  options: { pageName: string; sourceHash: string; newId: IdFactory; prompt?: string },
): MakerSite {
  const clean = withoutTemplateChrome(tree);
  const prompt = options.prompt?.trim() ? { prompt: options.prompt.trim().slice(0, PROMPT_LIMIT) } : {};
  const found = shellOf(clean);
  const main = found ? childList(found.shell).find((child) => child.signature === "Main") : undefined;
  if (found && main) {
    const outlet: UsageTree = { contract: "layout", signature: "Main" };
    const frame: UsageTree = { ...found.shell, children: [...found.before, ...childList(found.shell).map((child) => (child === main ? outlet : child))] };
    /* Named apart from the page: a page and a layout under one name could not be told apart by name, by a person or an agent. */
    const layout = { id: options.newId(), name: `${options.pageName} · frame`, root: fromUsageTree(frame, options.newId) };
    const page = { ...main, children: main.children ?? [] } as UsageTree;
    return {
      format: SITE_FORMAT,
      formatVersion: SITE_FORMAT_VERSION,
      sourceHash: options.sourceHash,
      pages: [{ id: options.newId(), name: options.pageName, path: "/", root: fromUsageTree(page, options.newId) }],
      layouts: [layout],
      defaultLayout: layout.id,
      ...prompt,
    };
  }
  const page = clean.signature === "Main" && clean.contract === "layout" ? clean : { contract: "layout", signature: "Main", children: clean };
  return {
    format: SITE_FORMAT,
    formatVersion: SITE_FORMAT_VERSION,
    sourceHash: options.sourceHash,
    pages: [{ id: options.newId(), name: options.pageName, path: "/", root: fromUsageTree(page, options.newId) }],
    ...prompt,
  };
}
