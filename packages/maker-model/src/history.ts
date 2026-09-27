import { applyAll, type Operation } from "./operations.js";
import type { MakerPage } from "./page.js";

/*
 * One undo step is one GESTURE: a drag, a committed field, a chosen value. A gesture may be several
 * operations ("wrap in Box" is a wrap and then an option), and it lands whole or not at all. Pages
 * are immutable and share every untouched subtree, so a step is simply the page before it.
 */

export type History = {
  readonly past: readonly MakerPage[];
  readonly present: MakerPage;
  readonly future: readonly MakerPage[];
};

export type Committed = { readonly ok: true; readonly history: History } | { readonly ok: false; readonly reason: string };

export function startHistory(page: MakerPage): History {
  return { past: [], present: page, future: [] };
}

export function commit(history: History, gesture: readonly Operation[]): Committed {
  const result = applyAll(history.present.root, gesture);
  if (!result.ok) return result;
  if (result.root === history.present.root) return { ok: true, history };
  return {
    ok: true,
    history: { past: [...history.past, history.present], present: { ...history.present, root: result.root }, future: [] },
  };
}

export function undo(history: History): History {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redo(history: History): History {
  const next = history.future[0];
  if (!next) return history;
  return { past: [...history.past, history.present], present: next, future: history.future.slice(1) };
}
