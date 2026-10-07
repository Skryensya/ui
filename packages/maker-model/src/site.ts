import { apply, type Operation } from "./operations.js";
import { FORMAT as PAGE_FORMAT, parse as parsePage, type MakerPage } from "./page.js";
import { walk, type MakerNode } from "./node.js";
import { fromUsageTree, reidentify, type IdFactory } from "./project.js";

/*
 * A MAKER SITE: pages, in order, each with a name, a path and its own tree whose root is a `Main`.
 * Pages are not layout: which page comes first in the list says nothing about any page's layout,
 * only the order the site's navigation offers them in. The tree of each page is exactly a maker page
 * tree, changed by exactly the same operations.
 *
 * THE SITE HAS ITS OWN SMALL SET OF OPERATIONS, next to the page ones: add, remove, rename, set a
 * path, move, and `edit`, which carries one page operation to one page. Undo walks them all in one
 * history, and none of them takes a position either.
 */

export const SITE_FORMAT = "skryensya-maker-site";
export const SITE_FORMAT_VERSION = 1;

export type MakerPageEntry = {
  readonly id: string;
  readonly name: string;
  /** Where the page lives: `/`, `/about`, `/docs/start`. Unique in the site. */
  readonly path: string;
  readonly root: MakerNode;
  /**
   * The layout the page sits in. Absent: the site's default layout, if it has one. `"none"`: no layout, the page stands
   * alone. Otherwise a layout's id. Absent is what makes every new page have the site's header and footer without anyone
   * setting anything.
   */
  readonly layout?: string;
};

/**
 * A LAYOUT: what every page that uses it is drawn inside, edited once. Its tree is an `AppShell` (header, rail, footer,
 * whatever the kit's shell takes) with one `Main` that is the OUTLET: the page's own `Main` takes that place when the
 * page is drawn, exported or published. Shares its id space with pages, so the Maker opens and edits one exactly as it
 * does a page, with the same operations.
 */
export type MakerLayout = {
  readonly id: string;
  readonly name: string;
  readonly root: MakerNode;
};

export type MakerSite = {
  readonly format: typeof SITE_FORMAT;
  readonly formatVersion: typeof SITE_FORMAT_VERSION;
  readonly sourceHash: string;
  readonly pages: readonly MakerPageEntry[];
  /** Shared page frames. Absent in a site made before layouts: it then has none. */
  readonly layouts?: readonly MakerLayout[];
  /** The layout a page uses when it does not say. */
  readonly defaultLayout?: string;
  /**
   * What this project is, in its author's words: given to Maker AI with every request, so it knows the product,
   * the audience and the tone without being told again. A template brings one to start from; it is the project's
   * own after that, edited like anything else in it. Absent: Maker AI knows only what each request says.
   */
  readonly prompt?: string;
};

/** A project prompt is guidance, not a document: past this it is cut rather than refused. */
export const PROMPT_LIMIT = 4000;

export type SiteOperation =
  | { readonly type: "addPage"; readonly page: MakerPageEntry; readonly index?: number }
  | { readonly type: "removePage"; readonly page: string }
  | { readonly type: "renamePage"; readonly page: string; readonly name: string }
  | { readonly type: "setPagePath"; readonly page: string; readonly path: string }
  | { readonly type: "movePage"; readonly page: string; readonly index: number }
  | { readonly type: "edit"; readonly page: string; readonly operation: Operation }
  | { readonly type: "addLayout"; readonly layout: MakerLayout; readonly makeDefault?: boolean }
  | { readonly type: "removeLayout"; readonly layout: string }
  | { readonly type: "renameLayout"; readonly layout: string; readonly name: string }
  | { readonly type: "setDefaultLayout"; readonly layout?: string }
  | { readonly type: "setPageLayout"; readonly page: string; readonly layout?: string }
  /** The project's prompt for Maker AI; empty removes it. */
  | { readonly type: "setPrompt"; readonly prompt: string };

export type SiteApplied = { readonly ok: true; readonly site: MakerSite } | { readonly ok: false; readonly reason: string };

const refuse = (reason: string): SiteApplied => ({ ok: false, reason });

/** A path is `/` or slash-separated lowercase segments of letters, digits and hyphens. */
export function pathProblem(path: string): string | undefined {
  if (path === "/") return undefined;
  if (!/^(\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/.test(path)) {
    return `"${path}" is not a page path: "/" or segments like "/about" or "/docs/getting-started".`;
  }
  return undefined;
}

export function emptyPage(id: string, name: string, path: string, newId: IdFactory): MakerPageEntry {
  return { id, name, path, root: { id: newId(), contract: "layout", signature: "Main", slots: { children: { kind: "nodes", children: [] } } } };
}

export function createSite(sourceHash: string, newId: IdFactory): MakerSite {
  return {
    format: SITE_FORMAT,
    formatVersion: SITE_FORMAT_VERSION,
    sourceHash,
    pages: [emptyPage(newId(), "Home", "/", newId)],
  };
}

/** A site holding one maker page, as the Maker's single-page format opens now. */
export function siteFromPage(page: MakerPage, newId: IdFactory): MakerSite {
  return {
    format: SITE_FORMAT,
    formatVersion: SITE_FORMAT_VERSION,
    sourceHash: page.sourceHash,
    pages: [{ id: newId(), name: "Home", path: "/", root: page.root }],
  };
}

/** A copy of a page with a new identity for it and for every node in it. */
export function duplicatePage(page: MakerPageEntry, name: string, path: string, newId: IdFactory): MakerPageEntry {
  return { id: newId(), name, path, root: reidentify(page.root, newId) as MakerNode };
}

export function pageOf(site: MakerSite, id: string): MakerPageEntry | undefined {
  return site.pages.find((page) => page.id === id);
}

export const layoutsOf = (site: MakerSite): readonly MakerLayout[] => site.layouts ?? [];

export function layoutOf(site: MakerSite, id: string): MakerLayout | undefined {
  return layoutsOf(site).find((layout) => layout.id === id);
}

/** What the Maker opens and edits by id: a page, or a layout, which it treats the same way. */
export function entryOf(site: MakerSite, id: string): MakerPageEntry | MakerLayout | undefined {
  return pageOf(site, id) ?? layoutOf(site, id);
}

/** A layout with its outlet and nothing else: a header, a footer or a rail are added to it like to any tree. */
export function emptyLayout(id: string, name: string, newId: IdFactory): MakerLayout {
  const outlet: MakerNode = { id: newId(), contract: "layout", signature: "Main", slots: { children: { kind: "nodes", children: [] } } };
  return { id, name, root: { id: newId(), contract: "layout", signature: "AppShell", slots: { children: { kind: "nodes", children: [outlet] } } } };
}

/**
 * A layout to start from: a header bar with a brand, the outlet, and a footer with a line of text. Everything in it is
 * ordinary content, changed like any other once it is on the layout's board.
 */
export function starterLayout(id: string, name: string, newId: IdFactory): MakerLayout {
  const base = emptyLayout(id, name, newId);
  const outlet = (base.root.slots.children as { readonly kind: "nodes"; readonly children: readonly MakerNode[] }).children[0]!;
  const header = fromUsageTree({ contract: "navbar", signature: "Navbar", children: [{ contract: "navbar", signature: "NavbarBrand", children: "Your site" }] }, newId) as MakerNode;
  const footer = fromUsageTree(
    { contract: "footer", signature: "Footer", options: { padding: "md" }, children: [{ contract: "wrapper", signature: "Wrapper", children: [{ contract: "typography", signature: "Text", options: { tone: "tertiary", size: "sm" }, children: "Made with Skryensya." }] }] },
    newId,
  ) as MakerNode;
  return { ...base, root: { ...base.root, slots: { children: { kind: "nodes", children: [header, outlet, footer] } } } };
}

/** The layout a page is drawn in: its own choice, else the site's default, else none. */
export function layoutFor(site: MakerSite, page: MakerPageEntry): MakerLayout | undefined {
  if (page.layout === "none") return undefined;
  return layoutOf(site, page.layout ?? site.defaultLayout ?? "");
}

const outletOf = (layout: MakerLayout): MakerNode | undefined => [...walk(layout.root)].find((node) => node.signature === "Main");

/**
 * THE PAGE AS IT IS DRAWN: the layout's tree with the page's own `Main` standing where the layout's outlet is. This is
 * what the stage shows, what is exported and what is published. `layout` holds the ids that belong to the layout, so a
 * page's artboard can show them without letting them be selected there: they are changed in the layout, once.
 */
export function composePage(site: MakerSite, page: MakerPageEntry): { readonly root: MakerNode; readonly layout: ReadonlySet<string> } {
  const layout = layoutFor(site, page);
  const outlet = layout ? outletOf(layout) : undefined;
  if (!layout || !outlet) return { root: page.root, layout: new Set() };
  const place = (node: MakerNode): MakerNode => {
    if (node.id === outlet.id) return page.root;
    const slots = Object.fromEntries(
      Object.entries(node.slots).map(([name, held]) => [name, held.kind === "nodes" ? { ...held, children: held.children.map((child) => ("signature" in child ? place(child) : child)) } : held]),
    );
    return { ...node, slots } as MakerNode;
  };
  return { root: place(layout.root), layout: new Set([...walk(layout.root)].map((node) => node.id).filter((id) => id !== outlet.id)) };
}

export function applySite(site: MakerSite, operation: SiteOperation): SiteApplied {
  switch (operation.type) {
    case "addPage": {
      const { page } = operation;
      if (pageOf(site, page.id)) return refuse(`A page "${page.id}" already exists.`);
      const problem = pathProblem(page.path) ?? taken(site, page.path);
      if (problem) return refuse(problem);
      if (!page.name.trim()) return refuse("A page needs a name.");
      if (page.root.signature !== "Main") return refuse("A page's root is a Main.");
      if (layoutOf(site, page.id)) return refuse(`A layout "${page.id}" already exists.`);
      if (page.layout !== undefined && page.layout !== "none" && !layoutOf(site, page.layout)) return refuse(`No layout "${page.layout}".`);
      const nodeIds = allNodeIds(site);
      if ([...walk(page.root)].some((node) => nodeIds.has(node.id))) return refuse("The new page reuses identities from another page.");
      const pages = [...site.pages];
      pages.splice(clamp(operation.index ?? pages.length, 0, pages.length), 0, page);
      return { ok: true, site: { ...site, pages } };
    }
    case "removePage": {
      if (!pageOf(site, operation.page)) return refuse(`No page "${operation.page}".`);
      if (site.pages.length === 1) return refuse("A site keeps at least one page.");
      return { ok: true, site: { ...site, pages: site.pages.filter((page) => page.id !== operation.page) } };
    }
    case "renamePage": {
      if (!operation.name.trim()) return refuse("A page needs a name.");
      return change(site, operation.page, (page) => ({ ...page, name: operation.name.trim() }));
    }
    case "setPagePath": {
      const problem = pathProblem(operation.path) ?? taken(site, operation.path, operation.page);
      if (problem) return refuse(problem);
      return change(site, operation.page, (page) => ({ ...page, path: operation.path }));
    }
    case "movePage": {
      const from = site.pages.findIndex((page) => page.id === operation.page);
      if (from === -1) return refuse(`No page "${operation.page}".`);
      const pages = [...site.pages];
      const [moved] = pages.splice(from, 1);
      pages.splice(clamp(operation.index, 0, pages.length), 0, moved!);
      return { ok: true, site: { ...site, pages } };
    }
    case "edit": {
      const page = pageOf(site, operation.page);
      if (page) {
        const result = apply(page.root, operation.operation);
        if (!result.ok) return result;
        return change(site, page.id, (entry) => ({ ...entry, root: result.root }));
      }
      const layout = layoutOf(site, operation.page);
      if (!layout) return refuse(`No page "${operation.page}".`);
      const result = apply(layout.root, operation.operation);
      if (!result.ok) return result;
      /* The outlet is what makes it a layout: an edit that removed it would leave pages with nowhere to go. */
      if (!outletOf({ ...layout, root: result.root })) return refuse("A layout keeps its Main: it is where each page goes.");
      return { ok: true, site: { ...site, layouts: layoutsOf(site).map((entry) => (entry.id === layout.id ? { ...entry, root: result.root } : entry)) } };
    }
    case "addLayout": {
      const { layout } = operation;
      if (entryOf(site, layout.id)) return refuse(`Something with the id "${layout.id}" already exists.`);
      if (!layout.name.trim()) return refuse("A layout needs a name.");
      if (layout.root.signature !== "AppShell") return refuse("A layout's root is an AppShell.");
      if (!outletOf(layout)) return refuse("A layout needs a Main: it is where each page goes.");
      const nodeIds = allNodeIds(site);
      if ([...walk(layout.root)].some((node) => nodeIds.has(node.id))) return refuse("The new layout reuses identities from the site.");
      return { ok: true, site: { ...site, layouts: [...layoutsOf(site), layout], ...(operation.makeDefault ? { defaultLayout: layout.id } : {}) } };
    }
    case "removeLayout": {
      if (!layoutOf(site, operation.layout)) return refuse(`No layout "${operation.layout}".`);
      const { defaultLayout, ...rest } = site;
      return {
        ok: true,
        site: {
          ...rest,
          layouts: layoutsOf(site).filter((layout) => layout.id !== operation.layout),
          ...(defaultLayout !== undefined && defaultLayout !== operation.layout ? { defaultLayout } : {}),
          /* A page that named it falls back to the default, which is now none or another. */
          pages: site.pages.map((page) => (page.layout === operation.layout ? (({ layout: _gone, ...kept }) => kept)(page) : page)),
        },
      };
    }
    case "renameLayout": {
      if (!operation.name.trim()) return refuse("A layout needs a name.");
      if (!layoutOf(site, operation.layout)) return refuse(`No layout "${operation.layout}".`);
      return { ok: true, site: { ...site, layouts: layoutsOf(site).map((layout) => (layout.id === operation.layout ? { ...layout, name: operation.name.trim() } : layout)) } };
    }
    case "setDefaultLayout": {
      const { defaultLayout: _old, ...rest } = site;
      if (operation.layout === undefined) return { ok: true, site: rest };
      if (!layoutOf(site, operation.layout)) return refuse(`No layout "${operation.layout}".`);
      return { ok: true, site: { ...rest, defaultLayout: operation.layout } };
    }
    case "setPageLayout": {
      if (operation.layout !== undefined && operation.layout !== "none" && !layoutOf(site, operation.layout)) return refuse(`No layout "${operation.layout}".`);
      return change(site, operation.page, ({ layout: _was, ...page }) => (operation.layout === undefined ? page : { ...page, layout: operation.layout }));
    }
    case "setPrompt": {
      const prompt = operation.prompt.trim().slice(0, PROMPT_LIMIT);
      const { prompt: _was, ...rest } = site;
      return { ok: true, site: prompt ? { ...rest, prompt } : rest };
    }
  }
}

export function applySiteAll(site: MakerSite, operations: readonly SiteOperation[]): SiteApplied {
  let current = site;
  for (const operation of operations) {
    const result = applySite(current, operation);
    if (!result.ok) return result;
    current = result.site;
  }
  return { ok: true, site: current };
}

/** Page operations addressed to one page, as site operations. */
export function onPage(page: string, operations: readonly Operation[]): readonly SiteOperation[] {
  return operations.map((operation) => ({ type: "edit", page, operation }));
}

/*
 * LINKS BETWEEN PAGES are ordinary `href` options. One that starts with "/" means a page of this
 * site, and a path no page has is a broken link: pending, like any other unfinished thing, and
 * named on the node that holds it.
 */
export type BrokenLink = { readonly page: string; readonly node: string; readonly href: string };

export function brokenLinks(site: MakerSite): readonly BrokenLink[] {
  const paths = new Set(site.pages.map((page) => page.path));
  const broken: BrokenLink[] = [];
  for (const page of [...site.pages, ...layoutsOf(site)]) {
    for (const node of walk(page.root)) {
      for (const value of Object.values(node.options ?? {})) {
        if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) continue;
        const path = value.split(/[?#]/)[0]!.replace(/\/$/, "") || "/";
        if (!paths.has(path)) broken.push({ page: page.id, node: node.id, href: value });
      }
    }
  }
  return broken;
}

export function serializeSite(site: MakerSite, sourceHash: string): string {
  return JSON.stringify({ ...site, sourceHash }, null, 2);
}

export type OpenedSite =
  | { readonly ok: true; readonly site: MakerSite; readonly catalogueChanged: boolean }
  | { readonly ok: false; readonly reason: string };

/** Read a saved site, or a single maker page (the earlier format), which opens as a one-page site. */
export function parseSite(json: string, sourceHash: string, newId: IdFactory): OpenedSite {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, reason: "The file is not JSON." };
  }
  const format = typeof data === "object" && data !== null ? (data as { format?: unknown }).format : undefined;
  if (format === PAGE_FORMAT) {
    const opened = parsePage(json, sourceHash);
    return opened.ok ? { ok: true, site: siteFromPage(opened.page, newId), catalogueChanged: opened.catalogueChanged } : opened;
  }
  if (format !== SITE_FORMAT) return { ok: false, reason: "The file is neither a maker site nor a maker page." };
  const site = data as MakerSite;
  if (site.formatVersion !== SITE_FORMAT_VERSION) return { ok: false, reason: `Maker site format ${String(site.formatVersion)} is not one this Maker reads.` };
  if (!Array.isArray(site.pages) || site.pages.length === 0) return { ok: false, reason: "A site holds at least one page." };
  for (const page of site.pages) {
    /* Each page's tree is held to the page format's own checks. */
    const one = parsePage(JSON.stringify({ format: PAGE_FORMAT, formatVersion: 1, sourceHash: site.sourceHash, root: page.root }), sourceHash);
    if (!one.ok) return { ok: false, reason: `Page "${page.name}": ${one.reason}` };
    if (typeof page.id !== "string" || typeof page.name !== "string" || pathProblem(page.path)) {
      return { ok: false, reason: `Page "${String(page.name)}" has no valid id, name or path.` };
    }
  }
  if (new Set(site.pages.map((page) => page.path)).size !== site.pages.length) return { ok: false, reason: "Two pages share a path." };
  for (const layout of site.layouts ?? []) {
    if (typeof layout.id !== "string" || typeof layout.name !== "string" || layout.root?.signature !== "AppShell" || !outletOf(layout)) {
      return { ok: false, reason: `Layout "${String(layout.name)}" is not an AppShell with a Main.` };
    }
  }
  const ids = [...site.pages, ...(site.layouts ?? [])].map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) return { ok: false, reason: "Two pages or layouts share an id." };
  const known = new Set((site.layouts ?? []).map((layout) => layout.id));
  if (site.defaultLayout !== undefined && !known.has(site.defaultLayout)) return { ok: false, reason: `The default layout "${site.defaultLayout}" does not exist.` };
  if (site.prompt !== undefined && (typeof site.prompt !== "string" || site.prompt.length > PROMPT_LIMIT)) return { ok: false, reason: "The project prompt is not text, or is too long." };
  for (const page of site.pages) if (page.layout !== undefined && page.layout !== "none" && !known.has(page.layout)) return { ok: false, reason: `Page "${page.name}" uses a layout that does not exist.` };
  return { ok: true, site, catalogueChanged: site.sourceHash !== sourceHash };
}

/** Every node id in the site, pages and layouts alike: one id names one node anywhere. */
function allNodeIds(site: MakerSite): Set<string> {
  return new Set([...site.pages, ...layoutsOf(site)].flatMap((entry) => [...walk(entry.root)].map((node) => node.id)));
}

function taken(site: MakerSite, path: string, except?: string): string | undefined {
  return site.pages.some((page) => page.path === path && page.id !== except) ? `Another page already lives at "${path}".` : undefined;
}

function change(site: MakerSite, id: string, update: (page: MakerPageEntry) => MakerPageEntry): SiteApplied {
  if (!pageOf(site, id)) return refuse(`No page "${id}".`);
  return { ok: true, site: { ...site, pages: site.pages.map((page) => (page.id === id ? update(page) : page)) } };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}
