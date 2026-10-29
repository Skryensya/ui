/*
 * WHICH STYLESHEETS A USAGE TREE NEEDS, read off the contracts the tree touches.
 *
 * The question every stage asks (docs frame, gates harness, eval-viewer, Storybook) and that each
 * used to answer by a different guess. The classes the emitter writes come from `parts` and from
 * template `also` lists (including nested nodes: Toast's dismiss borrows `sk-button`). A sheet is
 * "placed" when it is the contract's own `css`, a `hookSheets` entry, or the unique owner of an
 * `also` class. Classes with no unique owner (`sk-interactive`, loaded by every consumer's
 * `tokens.scss`) are shared, not unplaced.
 *
 * `unplaced` is the gate: a class the tree emits that needs a sheet and has none in `sheets`.
 * The architecture review's completeness claim is exactly `unplaced.length === 0` over the
 * canonical corpus.
 */
import { contractIds, getContract } from "@skryensya/core/registry";
import type { ContractTemplate } from "@skryensya/core/contract";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { walkUsageTree } from "./usage-walk.js";

export type SheetsForTree = {
  /** Stylesheets the composition must load, bare specifier form (`@skryensya/core/…`). */
  readonly sheets: readonly string[];
  /** `sk-*` classes the tree's templates name (parts + also). */
  readonly classes: readonly string[];
  /** Classes that need a sheet and do not have one in `sheets`. Empty when the closure is complete. */
  readonly unplaced: readonly string[];
};

/** Part class → the one stylesheet that owns it, only when a single contract claims it. */
const classToCss: ReadonlyMap<string, string> = (() => {
  const claimants = new Map<string, Set<string>>();
  /*
   * Through `getContract`, not `Object.values(contracts)`: the catalogue is `as const`, so optional
   * fields like `hookSheets` are missing from the narrowed literals. The accessor widens to
   * `ComponentContract` (same reason `hooks.ts` uses it).
   */
  for (const id of contractIds()) {
    const contract = getContract(id);
    if (!contract) continue;
    const css = contract.css;
    if (typeof css !== "string" || !contract.parts) continue;
    for (const className of Object.values(contract.parts)) {
      if (typeof className !== "string") continue;
      const owners = claimants.get(className) ?? new Set<string>();
      owners.add(css);
      claimants.set(className, owners);
    }
  }
  const index = new Map<string, string>();
  for (const [className, owners] of claimants) {
    if (owners.size === 1) index.set(className, [...owners][0]!);
  }
  return index;
})();

/** Every appearance sibling sheet any contract names, to tell `button.tactile.css` from a sheet that merely looks like one. */
const appearanceSheets: ReadonlySet<string> = (() => {
  const out = new Set<string>();
  for (const id of contractIds()) {
    const contract = getContract(id);
    if (!contract) continue;
    for (const option of Object.values(contract.options ?? {})) for (const list of Object.values(option.sheets ?? {})) for (const s of list) out.add(s);
    for (const list of Object.values(contract.memberAppearanceSheets ?? {})) for (const s of list) out.add(s);
  }
  return out;
})();

/**
 * The order to LOAD the sheets in, which is the cascade order.
 *
 * Alphabetical by BASE, each appearance sheet right after the base it adds to: the order the one file per
 * component always had, so `button.css`, `button.tactile.css`, `combobox.css`, `combobox.brutalist.css`. Plain
 * alphabetical order of the file names gets it wrong, since it puts `button.brutalist.css` BEFORE `button.css`
 * ('b' < 'c'), and a base that loads after the appearance it should lose to wins every tie at equal specificity.
 * Pairing them is also what keeps a late rule of one component (Combobox's override of its inner Button) after
 * the whole of Button, appearance included, as it was. The sheets import nothing, so nothing is pasted twice.
 */
function inLoadOrder(sheets: ReadonlySet<string>): string[] {
  const baseOf = (s: string) => (appearanceSheets.has(s) ? s.replace(/\.[a-z]+\.css$/, ".css") : s);
  return [...sheets].sort((a, b) => {
    const [x, y] = [baseOf(a), baseOf(b)];
    if (x !== y) return x < y ? -1 : 1;
    return a === x ? -1 : b === y ? 1 : a < b ? -1 : 1;
  });
}

function walkTemplate(node: ContractTemplate | undefined, visit: (n: ContractTemplate) => void): void {
  if (!node) return;
  visit(node);
  for (const child of node.children ?? []) walkTemplate(child, visit);
}

/**
 * Every stylesheet the tree needs, and every class that still has nowhere to live.
 *
 * Walks nested usage trees and nested template nodes: a Toast's dismiss `also: ["sk-button"]` is
 * how `button.css` enters the set. A root-only `also` walk misses it.
 */
export function sheetsForTree(tree: UsageTree): SheetsForTree {
  const sheets = new Set<string>();
  const classes = new Set<string>();

  const visit = (node: UsageTree, ancestors: readonly UsageTree[]): void => {
    const contract = getContract(node.contract);
    if (!contract) return;
    if (typeof contract.css === "string") sheets.add(contract.css);
    for (const hook of contract.hookSheets ?? []) sheets.add(hook);

    /*
     * A value's own sheet, when the contract splits one off (`appearance: "brutalist"` needs
     * `button.brutalist.css`). The EFFECTIVE value counts, the default included, so a default that
     * ever got a sheet would not be missed. And an ancestor that welds its members by watching them
     * (ButtonGroup) needs ITS sheet for that value, because a member asked for it.
     */
    const appearances: string[] = [];
    const seen = (value: string) => {
      appearances.push(value);
      for (const above of ancestors) {
        for (const sheet of getContract(above.contract)?.memberAppearanceSheets?.[value] ?? []) sheets.add(sheet);
      }
    };
    for (const [key, option] of Object.entries(contract.options ?? {})) {
      const value = String(node.options?.[key] ?? option.default ?? "");
      for (const sheet of option.sheets?.[value] ?? []) sheets.add(sheet);
      if (option.attr === "data-appearance") seen(value);
    }
    /* A contract that forwards the Button look (`StateButton`) takes the appearance as an authored attr, not an option. */
    const authored = node.attrs?.["data-appearance"];
    if (typeof authored === "string") seen(authored);

    const signature = contract.signatures[node.signature];
    for (const entry of signature?.compose ?? []) {
      const applies = Object.entries(entry.when ?? {}).every(
        ([key, value]) => String(node.options?.[key] ?? contract.options[key]?.default ?? "") === value,
      );
      if (!applies) continue;
      for (const sheet of entry.sheets ?? []) sheets.add(sheet);
    }
    walkTemplate(signature?.template, (part) => {
      if (part.part) {
        const className = contract.parts[part.part];
        if (typeof className === "string") classes.add(className);
      }
      for (const also of part.also ?? []) {
        classes.add(also);
        const owner = classToCss.get(also);
        if (!owner) continue;
        sheets.add(owner);
        /* A part that borrows another family's class (a CopyButton IS a `.sk-button`) is painted by that
           family's appearance sheet too, for the value this node was given. */
        for (const value of appearances) {
          const sibling = owner.replace(/\.css$/, `.${value}.css`);
          if (appearanceSheets.has(sibling)) sheets.add(sibling);
        }
      }
    });
  };

  walkUsageTree(tree, visit);

  const unplaced = [...classes]
    .filter((className) => {
      const owner = classToCss.get(className);
      /* Shared / multi-claimed (e.g. `sk-interactive`): loaded with tokens, not a missing sheet. */
      if (!owner) return false;
      return !sheets.has(owner);
    })
    .sort();

  return {
    sheets: inLoadOrder(sheets),
    classes: [...classes].sort(),
    unplaced,
  };
}
