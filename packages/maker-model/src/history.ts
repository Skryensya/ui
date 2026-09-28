import { applyAll, type Operation } from "./operations.js";
import type { MakerPage } from "./page.js";
import { applySiteAll, type MakerSite, type SiteOperation } from "./site.js";

/*
 * One undo step is one GESTURE: a drag, a committed field, a chosen value. A gesture may be several
 * operations ("wrap in Box" is a wrap and then an option), and it lands whole or not at all. Pages
 * are immutable and share every untouched subtree, so a step is simply the page before it.
 */

/** The steps of one immutable value: a maker page, or a whole site. */
export type History<T = MakerPage> = {
  readonly past: readonly T[];
  readonly present: T;
  readonly future: readonly T[];
};

export type Committed<T = MakerPage> = { readonly ok: true; readonly history: History<T> } | { readonly ok: false; readonly reason: string };

export function startHistory<T>(value: T): History<T> {
  return { past: [], present: value, future: [] };
}

export function commit(history: History<MakerPage>, gesture: readonly Operation[]): Committed<MakerPage> {
  const result = applyAll(history.present.root, gesture);
  if (!result.ok) return result;
  if (result.root === history.present.root) return { ok: true, history };
  return {
    ok: true,
    history: { past: [...history.past, history.present], present: { ...history.present, root: result.root }, future: [] },
  };
}

/** One gesture on a site: page and site operations together, one step, whole or not at all. */
export function commitSite(history: History<MakerSite>, gesture: readonly SiteOperation[]): Committed<MakerSite> {
  const result = applySiteAll(history.present, gesture);
  if (!result.ok) return result;
  if (result.site === history.present || gesture.length === 0) return { ok: true, history };
  return { ok: true, history: { past: [...history.past, history.present], present: result.site, future: [] } };
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redo<T>(history: History<T>): History<T> {
  const next = history.future[0];
  if (!next) return history;
  return { past: [...history.past, history.present], present: next, future: history.future.slice(1) };
}
