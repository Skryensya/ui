import { useMemo, type MutableRefObject } from "react";
import { AppBar, AppBarMenu, AppBarStatus, type AppBarItem } from "@skryensya/react/app-bar";
import { actions, allowed } from "./actions";
import { quickInserts } from "./Palette";
import { canPaste, copySelection, cutSelection, paste } from "./clipboard";
import { pageCommands } from "./Pages";
import type { CanvasControls } from "./stage/Canvas";
import { selectParent, type Maker, type StageWidth, type View } from "./state";
import type { SyncState } from "./sync";
import type { Workspace } from "./workspace";

/*
 * THE MAKER'S BAR: every command the chrome has, as words in menus, the way a desktop application
 * keeps them. Actions only (the AppBar allows nothing else): a setting is offered as the actions that
 * change it, with the current value unavailable, so "72rem" in the Width menu is greyed out while it
 * is the width. The toolbars and icon clusters that used to float over the canvas are these menus now.
 *
 * With no project open the bar still stands, holding what does not need one: projects and help.
 */

const DOCS = "https://ui.skryensya.dev/maker";

const WIDTHS: readonly StageWidth[] = [36, 52, 72, 90];
const DENSITIES: readonly View["density"][] = ["compact", "default", "comfortable"];
const RADII: readonly View["radius"][] = ["none", "sm", "md", "lg", "xl"];
const QUICK = ["Wrapper", "Stack", "Inline", "Grid", "Box", "Heading", "Text", "Button.action"] as const;

const capital = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export function widthLabel(width: StageWidth): string {
  return typeof width === "number" ? `${width}rem` : width === "fit" ? "72rem" : `${+(width.px / 16).toFixed(1)}rem`;
}

export type BarEditor = {
  maker: Maker;
  sync: SyncState;
  local: boolean;
  panels: { left: boolean; right: boolean };
  setPanels: (next: { left: boolean; right: boolean }) => void;
  canvas: MutableRefObject<CanvasControls | null>;
  zoom: number;
  openExport: () => void;
  openPublish: () => void;
  openInsertPanel: () => void;
  /** Starts the guided tour. */
  startTour: () => void;
};

/** One menu: its items, and what choosing each one does, keyed by the item's value. */
type Built = { items: AppBarItem[]; run: Record<string, () => void> };

function build(entries: readonly (readonly [value: string, label: string, run: (() => void) | undefined, extra?: Partial<AppBarItem>])[]): Built {
  const run: Record<string, () => void> = {};
  const items = entries.map(([value, label, action, extra]) => {
    if (action) run[value] = action;
    return { value, label, ...(action ? {} : { disabled: true }), ...extra } as AppBarItem;
  });
  return { items, run };
}

/** A submenu: a parent item whose children are `built`'s items, with their actions merged in. */
function sub(value: string, label: string, built: Built): Built {
  return { items: [{ value, label, children: built.items }], run: built.run };
}

function join(...parts: Built[]): Built {
  return { items: parts.flatMap((part) => part.items), run: Object.assign({}, ...parts.map((part) => part.run)) };
}

function Menu({ label, built, strong }: { label: string; built: Built; strong?: boolean }) {
  return (
    <AppBarMenu strong={strong} items={built.items} onSelect={({ value }) => built.run[value]?.()}>
      {label}
    </AppBarMenu>
  );
}

export function MakerBar({ workspace, onProjects, editor }: { workspace: Workspace; onProjects: () => void; editor?: BarEditor }) {
  /* Which blocks fit where an insert would land is a walk over the whole catalogue: once per change
     of the page or the selection, never once per render (the Editor renders on every hover). */
  const root = editor?.maker.page.root;
  const selectedId = editor?.maker.view.selected;
  const quick = useMemo(() => (editor ? quickInserts(editor.maker, QUICK) : []), [root, selectedId]);
  const server = workspace.mode.kind === "server";
  const active = workspace.active;

  const makerMenu = build([["projects", "All projects…", server ? onProjects : undefined]]);
  const help = build([
    ...(editor ? ([["tour", "Take the tour", editor.startTour]] as const) : []),
    ["docs", "Maker documentation", undefined, { href: DOCS }],
    ["keyboard", "Keyboard shortcuts", undefined, { href: `${DOCS}#keyboard` }],
  ]);
  /* A link is followed, never "run": the builder marks entries without an action unavailable, so the
     two links get theirs back here. The tour has an action, and is only offered once there is a Maker
     on screen for it to point at. */
  for (const item of help.items) if (item.value !== "tour") delete item.disabled;

  if (!editor) {
    return (
      <AppBar label="Maker">
        <Menu label="Maker" built={makerMenu} strong />
        <Menu label="File" built={build([["new", "New project…", server ? onProjects : undefined]])} />
        <Menu label="Help" built={help} />
      </AppBar>
    );
  }

  const { maker, panels, setPanels, canvas } = editor;
  const { view, setView } = maker;
  const selected = view.selected;
  const page = pageCommands(maker);

  const file = build([
    ["new", "New project…", server ? onProjects : undefined],
    ["close", "Close project", server && active ? () => workspace.close(active) : undefined],
    ["export", "Export…", editor.openExport],
    ["publish", "Publish…", editor.local ? undefined : editor.openPublish],
  ]);

  const selection = build(
    actions.map((action) => {
      const gesture = allowed(maker.page.root, selected, action);
      return [
        `selection-${action.id}`,
        action.label,
        gesture ? () => maker.gesture(gesture.operations, gesture.select) : undefined,
        action.id === "remove" ? { tone: "danger" } : undefined,
      ] as const;
    }),
  );
  const edit = join(
    build([
      ["undo", "Undo", maker.canUndo ? maker.undo : undefined],
      ["redo", "Redo", maker.canRedo ? maker.redo : undefined],
      ["copy", "Copy", selected && selected !== maker.page.root.id ? () => copySelection(maker) : undefined],
      ["cut", "Cut", selected && selected !== maker.page.root.id ? () => cutSelection(maker) : undefined],
      ["paste", "Paste", canPaste(maker) ? () => paste(maker) : undefined],
      ["parent", "Select parent", selected ? () => selectParent(maker) : undefined],
      ["deselect", "Select nothing", selected ? () => setView({ selected: undefined }) : undefined],
    ]),
    selection,
  );

  /* "fit" is the stage's starting width and draws at 72rem, so it is 72rem here too. */
  const currentWidth = view.width === "fit" ? 72 : view.width;
  const widths = build(WIDTHS.map((width) => [`width-${width}`, widthLabel(width), currentWidth === width ? undefined : () => setView({ width })] as const));
  const zoom = build([
    ["zoom-in", "Zoom in", () => canvas.current?.zoomIn()],
    ["zoom-out", "Zoom out", () => canvas.current?.zoomOut()],
    ["zoom-100", "Zoom to 100%", () => canvas.current?.actualSize()],
    ["fit-all", "Fit every page", () => canvas.current?.fitAll()],
    ["fit-page", "Fit the open page", () => canvas.current?.fitPage()],
  ]);
  const view_ = join(
    build([
      ["mode-edit", "Edit mode", view.mode === "edit" ? undefined : () => setView({ mode: "edit" })],
      ["mode-interact", "Interact mode", view.mode === "interact" ? undefined : () => setView({ mode: "interact" })],
    ]),
    sub("width", "Stage width", widths),
    sub(
      "preview",
      "Preview",
      join(
        build([
          ["scheme-light", "Light", view.scheme === "light" ? undefined : () => setView({ scheme: "light" })],
          ["scheme-dark", "Dark", view.scheme === "dark" ? undefined : () => setView({ scheme: "dark" })],
          ["contrast", view.contrast ? "Normal contrast" : "High contrast", () => setView({ contrast: !view.contrast })],
        ]),
        sub("density", "Density", build(DENSITIES.map((density) => [`density-${density}`, capital(density), view.density === density ? undefined : () => setView({ density })] as const))),
        sub("radius", "Radius", build(RADII.map((radius) => [`radius-${radius}`, capital(radius), view.radius === radius ? undefined : () => setView({ radius })] as const))),
      ),
    ),
    sub("zoom", "Zoom", zoom),
    build([
      ["panel-left", panels.left ? "Hide pages and layers" : "Show pages and layers", () => setPanels({ ...panels, left: !panels.left })],
      ["panel-right", panels.right ? "Hide the inspector" : "Show the inspector", () => setPanels({ ...panels, right: !panels.right })],
    ]),
  );

  const pageMenu = build([
    ["page-add", "Add a page", page.add],
    ["page-duplicate", "Duplicate this page", page.duplicate],
    ["page-up", "Move this page up", page.canMoveUp ? page.moveUp : undefined],
    ["page-down", "Move this page down", page.canMoveDown ? page.moveDown : undefined],
    ["page-remove", "Remove this page", page.canRemove ? page.remove : undefined, { tone: "danger" }],
  ]);

  const insert = join(
    build(quick.map(({ signature, insert: run }) => [`insert-${signature}`, signature, run] as const)),
    build([["insert-more", "More blocks and sections…", editor.openInsertPanel]]),
  );

  const status = [
    ...(editor.local ? [] : [<AppBarStatus key="sync">{editor.sync === "saved" ? "Saved" : editor.sync === "syncing" ? "Saving…" : "Offline"}</AppBarStatus>]),
    <StatusMenu key="width" label={widthLabel(view.width)} built={widths} />,
    <StatusMenu key="zoom" label={`${Math.round(editor.zoom * 100)}%`} built={zoom} />,
  ];

  return (
    <AppBar label="Maker" status={status}>
      <Menu label="Maker" built={makerMenu} strong />
      <Menu label="File" built={file} />
      <Menu label="Edit" built={edit} />
      <Menu label="View" built={view_} />
      <Menu label="Page" built={pageMenu} />
      <Menu label="Insert" built={insert} />
      <Menu label="Help" built={help} />
    </AppBar>
  );
}

function StatusMenu({ label, built }: { label: string; built: Built }) {
  return (
    <AppBarStatus items={built.items} onSelect={({ value }) => built.run[value]?.()}>
      {label}
    </AppBarStatus>
  );
}
