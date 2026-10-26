import { allSheetsOf, type ComponentContract } from "@skryensya/core/contract";
import { contractIds, getContract } from "@skryensya/core/registry";

/*
 * Every sheet whose hooks a contract is answerable for.
 *
 * `allSheetsOf` knows what the contract itself names. A contract that borrows another family's sheet
 * (`table-pager` lists `pagination.css` in `hookSheets` and publishes its hooks) is answerable for that
 * sheet's APPEARANCE siblings too: `--sk-pagination-brutalist-offset` is declared in
 * `pagination.brutalist.css` now, and the contract that republishes the hook has no appearance option of
 * its own to hang that sheet on. Only the reconciliation wants this; `sheetsForTree` does not, because a
 * tree should load a sibling only when it asks for that appearance.
 */
const siblingsOf: ReadonlyMap<string, readonly string[]> = (() => {
  const out = new Map<string, Set<string>>();
  const note = (sheet: string) => {
    const base = sheet.replace(/\.[a-z]+\.css$/, ".css");
    if (base === sheet) return;
    out.set(base, (out.get(base) ?? new Set()).add(sheet));
  };
  for (const id of contractIds()) {
    const contract = getContract(id);
    if (!contract) continue;
    for (const option of Object.values(contract.options ?? {})) for (const list of Object.values(option.sheets ?? {})) list.forEach(note);
    for (const list of Object.values(contract.memberAppearanceSheets ?? {})) list.forEach(note);
  }
  return new Map([...out].map(([base, set]) => [base, [...set]]));
})();

export function sheetsToReconcile(contract: ComponentContract): readonly string[] {
  const own = [contract.css, ...(contract.hookSheets ?? [])];
  const out = new Set<string>(own);
  // A value's list also names the sheets of whatever it builds on, for load order (`back-to-top.tactile.css` is
  // listed after `button.tactile.css`). Those are another family's sheets and another family's hooks: only a
  // sibling of one of THIS contract's own sheets is answerable to it.
  for (const sheet of allSheetsOf(contract)) if (own.includes(sheet.replace(/\.[a-z]+\.css$/, ".css"))) out.add(sheet);
  for (const sheet of own) for (const sibling of siblingsOf.get(sheet) ?? []) out.add(sibling);
  return [...out];
}
