import { apply, type Operation } from "./operations.js";
import { FORMAT as PAGE_FORMAT, parse as parsePage, type MakerPage } from "./page.js";
import { walk, type MakerNode } from "./node.js";
import { reidentify, type IdFactory } from "./project.js";

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
};

export type MakerSite = {
  readonly format: typeof SITE_FORMAT;
  readonly formatVersion: typeof SITE_FORMAT_VERSION;
  readonly sourceHash: string;
  readonly pages: readonly MakerPageEntry[];
};

export type SiteOperation =
  | { readonly type: "addPage"; readonly page: MakerPageEntry; readonly index?: number }
  | { readonly type: "removePage"; readonly page: string }
  | { readonly type: "renamePage"; readonly page: string; readonly name: string }
  | { readonly type: "setPagePath"; readonly page: string; readonly path: string }
  | { readonly type: "movePage"; readonly page: string; readonly index: number }
  | { readonly type: "edit"; readonly page: string; readonly operation: Operation };

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

export function applySite(site: MakerSite, operation: SiteOperation): SiteApplied {
  switch (operation.type) {
    case "addPage": {
      const { page } = operation;
      if (pageOf(site, page.id)) return refuse(`A page "${page.id}" already exists.`);
      const problem = pathProblem(page.path) ?? taken(site, page.path);
      if (problem) return refuse(problem);
      if (!page.name.trim()) return refuse("A page needs a name.");
      if (page.root.signature !== "Main") return refuse("A page's root is a Main.");
      const nodeIds = new Set(site.pages.flatMap((p) => [...walk(p.root)].map((n) => n.id)));
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
      if (!page) return refuse(`No page "${operation.page}".`);
      const result = apply(page.root, operation.operation);
      if (!result.ok) return result;
      return change(site, page.id, (entry) => ({ ...entry, root: result.root }));
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
  for (const page of site.pages) {
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
  return { ok: true, site, catalogueChanged: site.sourceHash !== sourceHash };
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
