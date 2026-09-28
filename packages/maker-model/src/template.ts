import type { UsageTree } from "@skryensya/core/usage-tree";
import { slotsOf } from "@skryensya/core/usage-tree";
import { fromUsageTree, type IdFactory } from "./project.js";
import { SITE_FORMAT, SITE_FORMAT_VERSION, type MakerSite } from "./site.js";

/*
 * A DOCS TEMPLATE AS A MAKER SITE. The gallery's templates (artifacts/templates.json) are usage
 * trees written for the docs page, which shows them in a frame with CSS of its own: a node marked
 * `template-narrow-only` (the phone's menu button) appears only when that frame is narrow, and one
 * marked `template-wide-only` only when it is wide. The Maker has neither that CSS nor authorable
 * classes, so the narrow-only stand-ins are left out, the classes are dropped, and what remains is
 * the page as it reads on a wide screen: the links the menu button stood in for.
 *
 * The tree becomes the one page of a new site, inside the page's Main unless it already is one.
 */

const NARROW_ONLY = "template-narrow-only";

function classesOf(tree: UsageTree): readonly string[] {
  return (tree.attrs?.class ?? "").split(/\s+/).filter(Boolean);
}

/** The tree without the gallery's own classes, and without what only a narrow frame would show. */
export function withoutTemplateChrome(tree: UsageTree): UsageTree {
  const clean = (content: unknown): unknown => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .filter((entry) => !(typeof entry === "object" && entry && "signature" in entry && classesOf(entry as UsageTree).includes(NARROW_ONLY)))
        .map(clean);
    }
    if (typeof content === "object" && content !== null && "signature" in content) return withoutTemplateChrome(content as UsageTree);
    if (typeof content === "object" && content !== null && "slots" in content) {
      const entry = content as { options?: unknown; slots: Record<string, unknown> };
      return { ...entry, slots: Object.fromEntries(Object.entries(entry.slots).map(([name, value]) => [name, clean(value)])) };
    }
    return content;
  };
  const { class: _class, ...attrs } = tree.attrs ?? {};
  const slots = Object.fromEntries(Object.entries(slotsOf(tree)).map(([name, content]) => [name, clean(content)]));
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

export function siteFromTemplate(
  tree: UsageTree,
  options: { pageName: string; sourceHash: string; newId: IdFactory },
): MakerSite {
  const clean = withoutTemplateChrome(tree);
  const page = clean.signature === "Main" && clean.contract === "layout" ? clean : { contract: "layout", signature: "Main", children: clean };
  return {
    format: SITE_FORMAT,
    formatVersion: SITE_FORMAT_VERSION,
    sourceHash: options.sourceHash,
    pages: [{ id: options.newId(), name: options.pageName, path: "/", root: fromUsageTree(page, options.newId) }],
  };
}
