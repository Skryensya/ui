import { walk, type MakerSite } from "@skryensya/maker-model";

/**
 * What the canvas draws while Maker AI works: the site as it would be with the operations written so far.
 * `added` is what is NEW against the real project, found by identity, so the stage can bring those nodes in.
 * It is read-only and never saved: applying a proposal is a separate, undoable gesture.
 */
export type Draft = {
  readonly site: MakerSite;
  readonly added: ReadonlySet<string>;
  /** How many operations it stands for. */
  readonly operations: number;
  /** Still being written. False once the proposal is final and waiting for Apply or Discard. */
  readonly building: boolean;
};

export function draftOf(base: MakerSite, site: MakerSite, operations: number, building: boolean): Draft {
  const known = new Set<string>();
  for (const page of base.pages) for (const node of walk(page.root)) known.add(node.id);
  const added = new Set<string>();
  for (const page of site.pages) for (const node of walk(page.root)) if (!known.has(node.id)) added.add(node.id);
  return { site, added, operations, building };
}
