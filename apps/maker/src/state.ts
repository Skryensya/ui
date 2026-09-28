import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  commit,
  createPage,
  isNode,
  parse,
  pending,
  randomId,
  redo,
  serialize,
  startHistory,
  toUsageTree,
  undo,
  walk,
  ancestors,
  resolve,
  type History,
  type MakerNode,
  type MakerPage,
  type Operation,
  type Pending,
} from "@skryensya/maker-model";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { sourceHash } from "../../../artifacts/ai-index.json";

/*
 * The Maker's state, split the way decision 31 splits it: the PAGE (history of maker pages, the
 * only thing persisted or exported) and the VIEW (selection, stage width, theme, mode), which is
 * everything about looking at the page and none of it about the page.
 */

export const CATALOGUE_HASH = sourceHash;

export type StageWidth = "fit" | 36 | 52 | 72 | 90 | { px: number };

export type View = {
  readonly selected?: string;
  readonly width: StageWidth;
  readonly mode: "edit" | "interact";
  readonly scheme: "light" | "dark";
  readonly contrast: boolean;
  readonly density: "compact" | "default" | "comfortable";
  readonly radius: "none" | "sm" | "md" | "lg" | "xl";
};

type State = {
  readonly history: History;
  readonly view: View;
  /** The last refusal, said out loud once and then replaced. */
  readonly notice?: { readonly text: string; readonly at: number };
};

type Action =
  | { type: "gesture"; operations: readonly Operation[]; select?: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "load"; page: MakerPage; notice?: string }
  | { type: "view"; change: Partial<View> }
  | { type: "notice"; text: string };

const STORAGE_KEY = "skryensya-maker:page";
const VIEW_KEY = "skryensya-maker:view";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "gesture": {
      const result = commit(state.history, action.operations);
      if (!result.ok) return { ...state, notice: { text: result.reason, at: Date.now() } };
      const selected = action.select ?? state.view.selected;
      return { ...state, history: result.history, view: { ...state.view, selected: keep(result.history.present.root, selected) } };
    }
    case "undo": {
      const history = undo(state.history);
      return { ...state, history, view: { ...state.view, selected: keep(history.present.root, state.view.selected) } };
    }
    case "redo": {
      const history = redo(state.history);
      return { ...state, history, view: { ...state.view, selected: keep(history.present.root, state.view.selected) } };
    }
    case "load":
      return { ...state, history: startHistory(action.page), view: { ...state.view, selected: undefined }, notice: action.notice ? { text: action.notice, at: Date.now() } : undefined };
    case "view":
      return { ...state, view: { ...state.view, ...action.change } };
    case "notice":
      return { ...state, notice: { text: action.text, at: Date.now() } };
  }
}

function keep(root: MakerNode, id: string | undefined): string | undefined {
  if (!id) return undefined;
  for (const node of walk(root)) {
    if (node.id === id) return id;
    for (const held of Object.values(node.slots)) {
      if (held.kind === "nodes" && held.children.some((child) => child.id === id)) return id;
    }
  }
  return undefined;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private window or blocked storage: the page still works, it just is not remembered. */
  }
}

function initialState(): State {
  const view: View = { width: "fit", mode: "edit", scheme: "light", contrast: false, density: "default", radius: "md" };
  let savedView: Partial<View> = {};
  try {
    savedView = JSON.parse(readStorage(VIEW_KEY) ?? "{}") as Partial<View>;
  } catch {
    savedView = {};
  }
  const saved = readStorage(STORAGE_KEY);
  const opened = saved ? parse(saved, CATALOGUE_HASH) : undefined;
  const page = opened?.ok ? opened.page : createPage(CATALOGUE_HASH, randomId);
  return {
    history: startHistory(page),
    view: { ...view, ...savedView, selected: undefined },
    notice: opened?.ok && opened.catalogueChanged ? { text: "The catalogue changed since this page was saved; anything that no longer fits is marked pending.", at: Date.now() } : undefined,
  };
}

export function useMaker() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const page = state.history.present;

  useEffect(() => writeStorage(STORAGE_KEY, serialize(page, CATALOGUE_HASH)), [page]);
  useEffect(() => {
    const { selected: _selected, ...rest } = state.view;
    writeStorage(VIEW_KEY, JSON.stringify(rest));
  }, [state.view]);

  const problems: Pending = useMemo(() => pending(page.root), [page.root]);

  return {
    page,
    view: state.view,
    notice: state.notice,
    problems,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    gesture: useCallback((operations: readonly Operation[], select?: string) => dispatch({ type: "gesture", operations, select }), []),
    undo: useCallback(() => dispatch({ type: "undo" }), []),
    redo: useCallback(() => dispatch({ type: "redo" }), []),
    load: useCallback((next: MakerPage, notice?: string) => dispatch({ type: "load", page: next, notice }), []),
    setView: useCallback((change: Partial<View>) => dispatch({ type: "view", change }), []),
    say: useCallback((text: string) => dispatch({ type: "notice", text }), []),
  };
}

export type Maker = ReturnType<typeof useMaker>;

/*
 * WHAT THE STAGE RENDERS, which is the page plus two things that are about viewing it and are never
 * part of it: every node marked with its identity (`data-maker-node`), so the chrome can find it in
 * the stage's DOM, and the top-layer ancestors of the selection held open, so what is inside a
 * dialog can be seen while it is being edited. Neither reaches the page, the history or an export.
 */
export function stageTree(root: MakerNode, selected: string | undefined): UsageTree {
  const open = new Set<string>();
  if (selected) {
    const itself = [...walk(root)].find((node) => node.id === selected);
    for (const above of [...ancestors(root, selected), ...(itself ? [itself] : [])]) {
      const resolved = resolve(above);
      if (resolved?.signature.options.includes("open") && resolved.contract.options.open?.type === "boolean") open.add(above.id);
    }
  }
  const mark = (node: MakerNode): MakerNode => {
    const slots = Object.fromEntries(
      Object.entries(node.slots).map(([name, held]) => [
        name,
        held.kind === "nodes" ? { kind: "nodes" as const, children: held.children.map((child) => (isNode(child) ? mark(child) : child)) } : held,
      ]),
    );
    return {
      ...node,
      ...(open.has(node.id) ? { options: { ...node.options, open: true } } : {}),
      attrs: { ...node.attrs, "data-maker-node": node.id },
      slots,
    };
  };
  return toUsageTree(mark(root));
}
