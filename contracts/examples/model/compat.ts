import { entries } from "./registry.js";
import type { Snippet, SnippetLevel } from "../fixed/snippet.js";
import type { Scale } from "./types.js";

/*
 * THE FLAT, ENGLISH LIST every earlier consumer reads (`discover`, the MCP index, the Maker's palette, the
 * gates' harness): one `Snippet` per example, whatever it is made of. It is DERIVED from the registry, never
 * written: a consumer that wants the taxonomy, the graph or another locale uses the registry, and this
 * exists so the ones that do not are not rewritten in the same change.
 *
 * `level` is the old three-way size. Fragments and components were both "component"; a composition was
 * a "molecule".
 */
const levelOf = (scale: Scale): SnippetLevel => (scale === "page" ? "page" : scale === "composition" ? "molecule" : "component");

export const snippets: readonly Snippet[] = entries("en").map((entry) => ({
  id: entry.id,
  level: levelOf(entry.scale),
  intent: entry.purpose,
  notes: entry.notes,
  tree: entry.tree,
}));
