import type { UsageTree } from "@skryensya/core/usage-tree";
import type { MakerNode } from "./node.js";
import { toUsageTree, type IdFactory } from "./project.js";

/*
 * A maker page: one tree whose root is a `Main` that cannot be removed, plus the two facts needed
 * to open it again later. `sourceHash` is the catalogue the page was last saved against; when the
 * catalogue has moved since, the page still opens and whatever no longer fits shows as pending.
 * Nothing else is stored: not the stage width, not the theme, not what the browser measured.
 */

export const FORMAT = "skryensya-maker-page";
export const FORMAT_VERSION = 1;

export type MakerPage = {
  readonly format: typeof FORMAT;
  readonly formatVersion: typeof FORMAT_VERSION;
  readonly sourceHash: string;
  readonly root: MakerNode;
};

export function createPage(sourceHash: string, newId: IdFactory): MakerPage {
  return {
    format: FORMAT,
    formatVersion: FORMAT_VERSION,
    sourceHash,
    root: { id: newId(), contract: "layout", signature: "Main", slots: { children: { kind: "nodes", children: [] } } },
  };
}

export function pageUsageTree(page: MakerPage): UsageTree {
  return toUsageTree(page.root);
}

export function serialize(page: MakerPage, sourceHash: string): string {
  return JSON.stringify({ ...page, sourceHash }, null, 2);
}

export type Opened =
  | { readonly ok: true; readonly page: MakerPage; readonly catalogueChanged: boolean }
  | { readonly ok: false; readonly reason: string };

/**
 * Read a saved page. Refuses only what is not a maker page at all; a page saved against another
 * catalogue opens, reports `catalogueChanged`, and lets validation mark what no longer fits.
 */
export function parse(json: string, sourceHash: string): Opened {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, reason: "The file is not JSON." };
  }
  if (!isRecord(data) || data.format !== FORMAT) return { ok: false, reason: "The file is not a maker page." };
  if (data.formatVersion !== FORMAT_VERSION) {
    return { ok: false, reason: `Maker page format ${String(data.formatVersion)} is not one this Maker reads (${FORMAT_VERSION}).` };
  }
  if (!isMakerNode(data.root) || data.root.signature !== "Main") return { ok: false, reason: "The page's root is not a Main." };
  const page: MakerPage = {
    format: FORMAT,
    formatVersion: FORMAT_VERSION,
    sourceHash: typeof data.sourceHash === "string" ? data.sourceHash : "",
    root: data.root,
  };
  return { ok: true, page, catalogueChanged: page.sourceHash !== sourceHash };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMakerNode(value: unknown): value is MakerNode {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.contract !== "string" || typeof value.signature !== "string") return false;
  if (!isRecord(value.slots)) return false;
  return Object.values(value.slots).every((held) => {
    if (!isRecord(held)) return false;
    if (held.kind === "text") return typeof held.text === "string";
    if (held.kind === "items") return Array.isArray(held.items);
    if (held.kind !== "nodes" || !Array.isArray(held.children)) return false;
    return held.children.every(
      (child: unknown) => isMakerNode(child) || (isRecord(child) && typeof child.id === "string" && typeof child.text === "string"),
    );
  });
}
