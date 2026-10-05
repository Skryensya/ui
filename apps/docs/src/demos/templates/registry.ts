import { collectionItems, isUsageTree, slotItems, slotsOf, type SlotContent, type UsageTree } from "@skryensya/core/usage-tree";
import type { Locale, Translate } from "../../i18n";
import { templateSections } from "../../lib/templates-nav";
import { appShellExplorerTree, appShellTree } from "../app-shell";
import { articleTree } from "./article";
import { bookingTree } from "./booking";
import { changelogTree } from "./changelog";
import { checkoutTree } from "./checkout";
import { dashboardTree } from "./dashboard";
import { docsSiteTree } from "./docs-site";
import { helpCenterTree } from "./help-center";
import { marketingTree } from "./marketing";
import { notFoundTree } from "./not-found";
import { onboardingTree } from "./onboarding";
import { pricingTree } from "./pricing";
import { productTree } from "./product";
import { settingsTree } from "./settings";
import { signInTree } from "./sign-in";
import { teamTree } from "./team";

/*
 * EVERY PAGE TEMPLATE'S TREE, by section id, in one place. The gallery renders them, the test holds
 * them to their contracts, and `scripts/generate-templates.ts` writes them out for the Maker: three
 * readers of one list, so a template added here is added everywhere. The section list itself (ids,
 * labels, order) stays in `lib/templates-nav.ts`.
 */
export function templateTrees(t: Translate, locale: Locale): Record<string, () => UsageTree> {
  const trees = authoredTrees(t, locale);
  return Object.fromEntries(Object.entries(trees).map(([id, tree]) => [id, () => withPageBasics(tree(), id, t)]));
}

/*
 * WHAT EVERY PAGE OWES, applied once. A template is a whole page, so it owes the three things a page's
 * structure cannot do without (and which the quality review, `packages/ai-compiler/src/quality.ts`, fails
 * a page for): a way past the chrome to the content, a main landmark that the skip link points at, and ONE
 * h1. Seventeen hand-written trees each carried a Heading at the default h2 and no skip link, which is
 * the sort of thing nobody notices in seventeen places and everybody inherits from the one they copy.
 *
 * Done here, not inside each template, so a template added tomorrow cannot forget. The ids are per
 * template (`main-<id>`), because the gallery renders all of them in one document and a repeated `id` is
 * invalid HTML. The first Heading in the page becomes the h1 (its size is untouched: `headingSize` is the
 * look, `headingElement` is the outline); a template whose first heading is not its page title should
 * author its own h1, and this leaves any existing h1 alone.
 */
function withPageBasics(tree: UsageTree, id: string, t: Translate): UsageTree {
  const target = `main-${id}`;
  let hasH1 = false;
  const visit = (node: UsageTree): void => {
    if (node.signature === "Heading" && node.options?.headingElement === "h1") hasH1 = true;
    for (const child of childrenOf(node)) visit(child);
  };
  visit(tree);

  let promoted = hasH1;
  let mainTagged = false;
  const rewrite = (node: UsageTree): UsageTree => {
    let next: UsageTree = node;
    if (node.signature === "Main" && !mainTagged) {
      mainTagged = true;
      next = { ...next, attrs: { ...next.attrs, id: target, tabindex: "-1" } };
    }
    if (node.signature === "Heading" && !promoted) {
      promoted = true;
      next = { ...next, options: { ...next.options, headingElement: "h1" } };
    }
    return mapChildren(next, rewrite);
  };
  let body = rewrite(tree);
  if (!mainTagged) return body;

  /* A work area that ships empty (the app shells) still owes its page a subject: the template's own title. */
  if (!promoted) {
    const title = templateSections(t).find((section) => section.id === id)?.title ?? id;
    const heading: UsageTree = { contract: "typography", signature: "Heading", options: { headingElement: "h1", headingSize: "h2" }, children: title };
    const fill = (node: UsageTree): UsageTree =>
      node.signature === "Main" && node.attrs?.id === target ? { ...node, children: [heading] } : mapChildren(node, fill);
    body = fill(body);
  }

  const skip: UsageTree = { contract: "skip-link", signature: "SkipLink", options: { href: `#${target}` }, children: t("nav.skipToContent") };
  return { contract: "layout", signature: "Stack", options: { gap: "none" }, children: [skip, body] };
}

function childrenOf(node: UsageTree): UsageTree[] {
  const out: UsageTree[] = [];
  const take = (content: unknown): void => {
    for (const item of slotItems(content as Parameters<typeof slotItems>[0])) if (typeof item !== "string") out.push(item);
  };
  take(node.children);
  for (const content of Object.values(slotsOf(node))) take(content);
  for (const content of Object.values(slotsOf(node))) for (const entry of collectionItems(content)) for (const nested of Object.values(entry.slots)) take(nested);
  return [...new Set(out)];
}

/** The same tree with `fn` applied to every direct child node, wherever it sits (children, a slot, a collection entry's slots). */
function mapChildren(node: UsageTree, fn: (child: UsageTree) => UsageTree): UsageTree {
  const mapContent = (content: SlotContent | undefined): SlotContent | undefined => {
    if (content === undefined) return content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content.map((item) => {
        if (typeof item === "string") return item;
        if (isUsageTree(item as UsageTree)) return fn(item as UsageTree);
        const entry = item as { slots: Record<string, SlotContent> };
        return { ...entry, slots: Object.fromEntries(Object.entries(entry.slots).map(([key, value]) => [key, mapContent(value)])) };
      }) as SlotContent;
    }
    return fn(content as UsageTree);
  };
  const slots = node.slots && Object.fromEntries(Object.entries(node.slots).map(([key, value]) => [key, mapContent(value)]));
  return { ...node, ...(node.children !== undefined ? { children: mapContent(node.children) } : {}), ...(slots ? { slots } : {}) } as UsageTree;
}

function authoredTrees(t: Translate, locale: Locale): Record<string, () => UsageTree> {
  return {
    "app-shell": () => appShellTree(t),
    "app-shell-explorer": () => appShellExplorerTree(t),
    marketing: () => marketingTree(t),
    "docs-site": () => docsSiteTree(t),
    dashboard: () => dashboardTree(t, locale),
    checkout: () => checkoutTree(t, locale),
    pricing: () => pricingTree(t, locale),
    "sign-in": () => signInTree(t),
    settings: () => settingsTree(t),
    onboarding: () => onboardingTree(t),
    product: () => productTree(t, locale),
    article: () => articleTree(t),
    "help-center": () => helpCenterTree(t),
    booking: () => bookingTree(t, locale),
    changelog: () => changelogTree(t),
    team: () => teamTree(t),
    "not-found": () => notFoundTree(t),
  };
}
