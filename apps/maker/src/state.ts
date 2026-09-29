import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  ancestors,
  brokenLinks,
  commitSite,
  createSite,
  isNode,
  locate,
  onPage,
  parseSite,
  pending,
  randomId,
  redo,
  resolve,
  serializeSite,
  startHistory,
  toUsageTree,
  undo,
  walk,
  type History,
  type MakerNode,
  type MakerPageEntry,
  type MakerSite,
  type Operation,
  type Pending,
  type SiteOperation,
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
  /** The page open on the stage. */
  readonly page: string;
  readonly selected?: string;
  readonly selectedIds: readonly string[];
  readonly width: StageWidth;
  readonly mode: "edit" | "interact";
  readonly scheme: "light" | "dark";
  readonly contrast: boolean;
  readonly density: "compact" | "default" | "comfortable";
  readonly radius: "none" | "sm" | "md" | "lg" | "xl";
};

type State = {
  readonly history: History<MakerSite>;
  readonly view: View;
  /** The last refusal, said out loud once and then replaced. */
  readonly notice?: { readonly text: string; readonly at: number };
};

type Action =
  | { type: "gesture"; operations: readonly SiteOperation[]; select?: string; page?: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "load"; site: MakerSite; notice?: string }
  | { type: "remote"; site: MakerSite; notice?: string }
  | { type: "view"; change: Partial<View> }
  | { type: "notice"; text: string };

const STORAGE_KEY = "skryensya-maker:site";
/** Where the single-page Maker kept its page; read once, as a one-page site, then left alone. */
const LEGACY_PAGE_KEY = "skryensya-maker:page";
const VIEW_KEY = "skryensya-maker:view";

/** The view, held to the site: an open page that no longer exists falls back to the first. */
function settle(site: MakerSite, view: View): View {
  const page = site.pages.some((entry) => entry.id === view.page) ? view.page : site.pages[0]!.id;
  const root = site.pages.find((entry) => entry.id === page)!.root;
  const selected = page === view.page ? keep(root, view.selected) : undefined;
  const selectedIds = page === view.page ? view.selectedIds.filter((id) => keep(root, id)) : [];
  return { ...view, page, selected, selectedIds: selected ? (selectedIds.includes(selected) ? selectedIds : [selected, ...selectedIds]) : selectedIds };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "gesture": {
      const result = commitSite(state.history, action.operations);
      if (!result.ok) return { ...state, notice: { text: result.reason, at: Date.now() } };
      const view = {
        ...state.view,
        page: action.page ?? state.view.page,
        selected: action.select ?? state.view.selected,
        ...(action.select !== undefined ? { selectedIds: action.select ? [action.select] : [] } : {}),
      };
      return { ...state, history: result.history, view: settle(result.history.present, view) };
    }
    case "undo": {
      const history = undo(state.history);
      return { ...state, history, view: settle(history.present, state.view) };
    }
    case "redo": {
      const history = redo(state.history);
      return { ...state, history, view: settle(history.present, state.view) };
    }
    case "load":
      return {
        ...state,
        history: startHistory(action.site),
        view: settle(action.site, { ...state.view, page: action.site.pages[0]!.id, selected: undefined, selectedIds: [] }),
        notice: action.notice ? { text: action.notice, at: Date.now() } : undefined,
      };
    case "remote": {
      /* A change made elsewhere (an agent, through the site file) is one more step: undoable. */
      const history = { past: [...state.history.past, state.history.present], present: action.site, future: [] };
      return { ...state, history, view: settle(action.site, state.view), notice: action.notice ? { text: action.notice, at: Date.now() } : state.notice };
    }
    case "view": {
      const change =
        "selected" in action.change && !("selectedIds" in action.change)
          ? { ...action.change, selectedIds: action.change.selected ? [action.change.selected] : [] }
          : action.change;
      return { ...state, view: settle(state.history.present, { ...state.view, ...change }) };
    }
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
    /* Private window or blocked storage: the site still works, it just is not remembered. */
  }
}

const CATALOGUE_MOVED = "The catalogue changed since this site was saved; anything that no longer fits is marked pending.";

/** The view preferences a person carries from project to project: width, mode, theme. */
function savedPreferences(): Partial<View> {
  try {
    const { page: _page, selected: _selected, selectedIds: _selectedIds, ...rest } = JSON.parse(readStorage(VIEW_KEY) ?? "{}") as Partial<View>;
    return rest;
  } catch {
    return {};
  }
}

/**
 * A project's state when it opens: the site it was given, or (the browser-only project) what this
 * browser kept, and the view preferences the person last used.
 */
function initialState(given?: MakerSite): State {
  let site = given;
  let catalogueChanged = false;
  if (!site) {
    const saved = readStorage(STORAGE_KEY) ?? readStorage(LEGACY_PAGE_KEY);
    const opened = saved ? parseSite(saved, CATALOGUE_HASH, randomId) : undefined;
    site = opened?.ok ? opened.site : createSite(CATALOGUE_HASH, randomId);
    catalogueChanged = opened?.ok === true && opened.catalogueChanged;
  } else {
    catalogueChanged = given!.sourceHash !== CATALOGUE_HASH;
  }
  const view: View = { page: site.pages[0]!.id, selectedIds: [], width: "fit", mode: "edit", scheme: "light", contrast: false, density: "default", radius: "md", ...savedPreferences() };
  return {
    history: startHistory(site),
    view: settle(site, view),
    notice: catalogueChanged ? { text: CATALOGUE_MOVED, at: Date.now() } : undefined,
  };
}

/*
 * EVERY OPEN PROJECT KEEPS ITS STATE, its history and its view, for as long as it is open, whether
 * or not its tab is the one showing. So the state lives here, keyed by project, and not inside a
 * component that unmounts when another tab is chosen.
 */

/** The project that lives in this browser only, used when there is no projects server. */
export const LOCAL_PROJECT = "local";

const states = new Map<string, State>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** Open a project's state with its site (or, for the local project, what the browser kept). */
export function seedProject(id: string, site?: MakerSite): void {
  if (states.has(id)) return;
  states.set(id, initialState(site));
  emit();
}

export function isSeeded(id: string): boolean {
  return states.has(id);
}

/** Close a project: its state, history included, is let go. */
export function forgetProject(id: string): void {
  if (states.delete(id)) emit();
}

function dispatchTo(id: string, action: Action): void {
  const state = states.get(id);
  if (!state) return;
  states.set(id, reducer(state, action));
  emit();
}

export function useMaker(projectId: string) {
  seedProject(projectId);
  const state = useSyncExternalStore(subscribe, () => states.get(projectId)!);
  const dispatch = useCallback((action: Action) => dispatchTo(projectId, action), [projectId]);
  const site = state.history.present;
  const page: MakerPageEntry = site.pages.find((entry) => entry.id === state.view.page) ?? site.pages[0]!;

  /* Only the browser-only project is kept in the browser; the others are kept by the server. */
  useEffect(() => {
    if (projectId === LOCAL_PROJECT) writeStorage(STORAGE_KEY, serializeSite(site, CATALOGUE_HASH));
  }, [projectId, site]);
  useEffect(() => {
    const { selected: _selected, page: _page, ...rest } = state.view;
    writeStorage(VIEW_KEY, JSON.stringify(rest));
  }, [state.view]);

  /* What the validator says about this page, plus its links to paths no page of the site has. */
  const problems: Pending = useMemo(() => {
    const own = pending(page.root);
    const broken = brokenLinks(site)
      .filter((link) => link.page === page.id)
      .map((link) => ({
        path: "",
        rule: "broken-link",
        severity: "error" as const,
        message: `Links to "${link.href}", and no page of this site lives there.`,
        nodes: [link.node],
      }));
    return { valid: own.valid && broken.length === 0, problems: [...own.problems, ...broken] };
  }, [page.root, site]);

  const pageId = page.id;
  return {
    projectId,
    site,
    page,
    view: state.view,
    notice: state.notice,
    problems,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    /** Operations on the open page's tree: one gesture, one step. */
    gesture: useCallback(
      (operations: readonly Operation[], select?: string) => dispatch({ type: "gesture", operations: onPage(pageId, operations), select }),
      [dispatch, pageId],
    ),
    /** Operations on the site itself (pages), optionally opening a page afterwards. */
    siteGesture: useCallback(
      (operations: readonly SiteOperation[], open?: string) => dispatch({ type: "gesture", operations, page: open, select: undefined }),
      [dispatch],
    ),
    undo: useCallback(() => dispatch({ type: "undo" }), [dispatch]),
    redo: useCallback(() => dispatch({ type: "redo" }), [dispatch]),
    load: useCallback((next: MakerSite, notice?: string) => dispatch({ type: "load", site: next, notice }), [dispatch]),
    /** A site that changed elsewhere, taken in as one undoable step. */
    receive: useCallback((next: MakerSite, notice?: string) => dispatch({ type: "remote", site: next, notice }), [dispatch]),
    setView: useCallback((change: Partial<View>) => dispatch({ type: "view", change }), [dispatch]),
    say: useCallback((text: string) => dispatch({ type: "notice", text }), [dispatch]),
  };
}

export type Maker = ReturnType<typeof useMaker>;

/**
 * One step up the tree, the way a design tool's Escape does: from a node to the container it sits
 * in, from the page's Main to nothing. It is how the person gets back to Main after a section fills
 * the page, to put the next one below it.
 */
export function selectParent(maker: Maker): void {
  const id = maker.view.selected;
  if (!id) return;
  const at = locate(maker.page.root, id);
  maker.setView({ selected: at?.parent.id });
}

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
