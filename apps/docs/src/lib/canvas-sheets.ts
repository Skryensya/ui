import { contractsIn } from "@skryensya/core/usage-tree";
import { allSheetsOf } from "@skryensya/core/contract";
import { getContract } from "@skryensya/core/registry";
import { sheetsForTree } from "@skryensya/ai-compiler/sheets-for-tree";
import type { CanvasBlock } from "./canvas-fragment";

/**
 * The stylesheets one component's canvas needs, and no others. Every contract in its trees brings ALL of its own sheets
 * (`allSheetsOf`, so the appearance toggle can switch to a look whose sheet was not the default), and `sheetsForTree` adds
 * the sheets that own the classes the emitted markup uses. A canvas page used to load every component stylesheet of the
 * kit, which put ~170 sheets in front of the style engine for a page that draws one or two components.
 */
export function canvasSheets(blocks: readonly CanvasBlock[]): string[] {
  // What every mounted component can add after the markup is in: icons, visually hidden text, the pending state. Without
  // them a component changes size when it mounts, and the page shifts.
  const sheets = new Set<string>([
    "@skryensya/core/patterns/icon.css",
    "@skryensya/core/patterns/visually-hidden.css",
    "@skryensya/core/patterns/state-layer.css",
    "@skryensya/core/components/loader.css",
  ]);
  for (const { signature } of blocks) {
    for (const tree of [signature.base, ...signature.groups.flatMap((group) => group.specimens.map((s) => s.tree))]) {
      for (const sheet of sheetsForTree(tree).sheets) sheets.add(sheet);
      for (const id of contractsIn(tree)) {
        const contract = getContract(id);
        if (contract) for (const sheet of allSheetsOf(contract)) sheets.add(sheet);
      }
    }
  }
  return [...sheets];
}
