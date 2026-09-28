import { useState } from "react";
import { detectMac, formatHotkey, isTypingContext } from "@skryensya/core/hotkey";
import { useHotkey } from "@skryensya/react/hotkey";
import { Button } from "@skryensya/react/button";
import { Menu } from "@skryensya/react/menu";
import { Popover } from "@skryensya/react/popover";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@skryensya/react/toolbar";
import { useDrag } from "./drag";
import { useProjectSync } from "./sync";
import { ProjectsPanel } from "./ProjectsPanel";
import { PublishPanel } from "./PublishPanel";
import { useWorkspace, type Workspace } from "./workspace";
import { ExportPanel } from "./ExportPanel";
import { IconButton } from "./IconButton";
import { MakerIcon, type AnyIcon } from "./icons";
import { Inspector } from "./Inspector";
import { Outline } from "./Outline";
import { Pages } from "./Pages";
import { Palette } from "./Palette";
import { Canvas } from "./stage/Canvas";
import { SegmentedControl } from "@skryensya/react/segmented";
import { LOCAL_PROJECT, useMaker, type StageWidth, type View } from "./state";

/*
 * The Maker's chrome, floating over the canvas: a small toolbar on top for VIEWING the page (history,
 * edit or interact, and the stage width and theme behind two menus, since they change less often);
 * saving and sharing at the top right; pages, layers and the palette on the left; the inspector on
 * the right. Nothing in the top toolbar changes the page except undo and redo.
 */

const WIDTHS: readonly { width: StageWidth; label: string; icon: AnyIcon }[] = [
  { width: 36, label: "36rem, compact (phone)", icon: { role: "screen-mobile" } },
  { width: 52, label: "52rem, where expanded begins (tablet)", icon: { role: "screen-tablet" } },
  { width: 72, label: "72rem (desktop)", icon: { role: "screen-desktop" } },
  { width: 90, label: "90rem, the widest page column", icon: { role: "maximize" } },
];

const WIDTH_VALUES = new Set<StageWidth>(WIDTHS.map((entry) => entry.width));

/** The stage width, one menu: the four widths that matter, and the one dragged to if it is none of them. */
function WidthMenu({ maker }: { maker: ReturnType<typeof useMaker> }) {
  const { width } = maker.view;
  const current = WIDTHS.find((entry) => entry.width === width);
  const shown = typeof width === "number" ? `${width}rem` : width === "fit" ? "72rem" : `${+(width.px / 16).toFixed(1)}rem`;
  return (
    <Menu
      label="Stage width"
      triggerLabel={`Stage width: ${shown}`}
      triggerVariant="ghost"
      triggerSize="sm"
      triggerClassName="maker__width"
      trigger={
        <>
          <MakerIcon icon={current?.icon ?? { glyph: "width" }} />
          <span>{shown}</span>
        </>
      }
      items={WIDTHS.map((entry) => ({ value: String(entry.width), label: entry.label, kind: "radio" as const, group: "width", checked: entry.width === width }))}
      onCheckedChange={({ value, checked }) => {
        const next = Number(value) as StageWidth;
        if (checked && WIDTH_VALUES.has(next)) maker.setView({ width: next });
      }}
    />
  );
}

/** How the stage is themed: never part of the page, and seldom changed, so it waits in a popover. */
function PreviewSettings({ maker }: { maker: ReturnType<typeof useMaker> }) {
  const { view, setView } = maker;
  return (
    <Popover
      title="Preview"
      description="How the stage shows the page. None of it is saved in the site."
      trigger={<MakerIcon icon={{ glyph: "scheme" }} />}
      triggerLabel="Preview settings"
      triggerIconOnly
      triggerVariant="ghost"
      triggerSize="sm"
      placement="block-end"
      contentClassName="maker-preview"
    >
      <div className="maker-preview__fields">
        <div className="maker-preview__row">
          <span aria-hidden="true">Color scheme</span>
          <SegmentedControl
            label="Color scheme"
            value={view.scheme}
            onValueChange={(value) => setView({ scheme: value as View["scheme"] })}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
        <div className="maker-preview__row">
          <span aria-hidden="true">Contrast</span>
          <SegmentedControl
            label="Contrast"
            value={view.contrast ? "high" : "normal"}
            onValueChange={(value) => setView({ contrast: value === "high" })}
            options={[
              { value: "normal", label: "Normal" },
              { value: "high", label: "High" },
            ]}
          />
        </div>
        <div className="maker-preview__row">
          <span aria-hidden="true">Density</span>
          <SegmentedControl
            label="Density"
            value={view.density}
            onValueChange={(value) => setView({ density: value as View["density"] })}
            options={[
              { value: "compact", label: "Compact" },
              { value: "default", label: "Default" },
              { value: "comfortable", label: "Comfy" },
            ]}
          />
        </div>
        <div className="maker-preview__row">
          <span aria-hidden="true">Radius</span>
          <SegmentedControl
            label="Radius"
            value={view.radius}
            onValueChange={(value) => setView({ radius: value as View["radius"] })}
            options={["none", "sm", "md", "lg", "xl"].map((r) => ({ value: r, label: r }))}
          />
        </div>
      </div>
    </Popover>
  );
}

/*
 * THE SHELL: the open projects as tabs, and the one that shows. With nothing open, the list of
 * projects is the whole screen.
 */
export function App() {
  const workspace = useWorkspace();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const server = workspace.mode.kind === "server";

  return (
    <div className="maker-shell" data-sk-density-scope="">
      <header className="maker-tabs">
        <h1 className="maker__brand">
          <MakerIcon icon={{ glyph: "insert" }} size="md" />
          Maker
        </h1>
        {server ? (
          <>
            <nav className="maker-tabs__list" aria-label="Open projects">
              {workspace.open.map((id) => (
                <span key={id} className="maker-tabs__tab" data-active={id === workspace.active ? "" : undefined}>
                  <button type="button" className="maker-tabs__name" aria-current={id === workspace.active ? "page" : undefined} onClick={() => workspace.setActive(id)}>
                    {workspace.nameOf(id)}
                  </button>
                  <IconButton icon={{ role: "close" }} label={`Close ${workspace.nameOf(id)}`} onClick={() => workspace.close(id)} />
                </span>
              ))}
            </nav>
            <IconButton icon={{ role: "folder" }} label="All projects" pressed={projectsOpen} onClick={() => setProjectsOpen((value) => !value)} />
          </>
        ) : null}
        {workspace.mode.kind === "local" ? <span className="maker-tabs__store">This browser only</span> : null}
      </header>
      {workspace.mode.kind === "local" ? (
        <p className="maker-shell__local" role="status">
          {workspace.mode.reason}
        </p>
      ) : null}
      {workspace.active ? (
        <Editor key={workspace.active} projectId={workspace.active} workspace={workspace} projectsOpen={projectsOpen} onCloseProjects={() => setProjectsOpen(false)} />
      ) : workspace.mode.kind === "server" ? (
        <main className="maker-start">
          <ProjectsPanel workspace={workspace} />
        </main>
      ) : null}
    </div>
  );
}

function Editor({
  projectId,
  workspace,
  projectsOpen,
  onCloseProjects,
}: {
  projectId: string;
  workspace: Workspace;
  projectsOpen: boolean;
  onCloseProjects: () => void;
}) {
  const maker = useMaker(projectId);
  const drag = useDrag(maker.page.root, maker.gesture);
  const sync = useProjectSync(maker, projectId !== LOCAL_PROJECT);
  const [exporting, setExporting] = useState(false);
  const [publishingOpen, setPublishingOpen] = useState(false);
  const [panels, setPanels] = usePanels();
  const [leftTab, setLeftTab] = useState<"layers" | "insert">("layers");
  const { view, setView } = maker;

  /* Undo and redo page-wide, through the kit's hotkeys; inside a text field they stay the field's. */
  const history = (step: () => void) => (event: KeyboardEvent) => {
    if (isTypingContext(event.target)) return;
    event.preventDefault();
    step();
  };
  useHotkey("mod+z", history(maker.undo), { preventDefault: false });
  useHotkey("mod+shift+z", history(maker.redo), { preventDefault: false });

  const mac = detectMac();
  /* Mod+\\ hides both panels for a clear canvas, and brings them back. */
  useHotkey("mod+\\", () => setPanels(panels.left || panels.right ? { left: false, right: false } : { left: true, right: true }));

  return (
    <div className={`maker${drag.session ? " maker--dragging" : ""}`}>
      {/* Not a <header>: the shell's tab row is the page's one banner. A named region instead. */}
      <section className="maker__top maker-float" aria-label="View">
        <Toolbar label="Maker" className="maker__toolbar">
          <ToolbarGroup label="History">
            <IconButton icon={{ glyph: "undo" }} label="Undo" shortcut={formatHotkey("mod+z", mac)} onClick={maker.undo} disabled={!maker.canUndo} />
            <IconButton icon={{ glyph: "redo" }} label="Redo" shortcut={formatHotkey("mod+shift+z", mac)} onClick={maker.redo} disabled={!maker.canRedo} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup label="Mode">
            <IconButton icon={{ glyph: "edit" }} label="Edit: a click selects" pressed={view.mode === "edit"} onClick={() => setView({ mode: "edit" })} />
            <IconButton icon={{ glyph: "interact" }} label="Interact: the page responds" pressed={view.mode === "interact"} onClick={() => setView({ mode: "interact" })} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <WidthMenu maker={maker} />
          <PreviewSettings maker={maker} />
        </Toolbar>
      </section>

      <section className="maker__share" aria-label="Save and share">
        {projectId !== LOCAL_PROJECT ? (
          <span className={`maker__sync maker__sync--${sync}`} role="status" title={sync === "offline" ? "Offline: changes wait here" : undefined}>
            {sync === "saved" ? "Saved" : sync === "syncing" ? "Saving…" : "Offline"}
          </span>
        ) : null}
        <IconButton icon={{ role: "download" }} label="Export" onClick={() => { setPublishingOpen(false); setExporting(true); }} />
        {projectId !== LOCAL_PROJECT ? (
          <Button variant="solid" size="sm" onClick={() => { setExporting(false); setPublishingOpen(true); }}>
            Publish
          </Button>
        ) : null}
      </section>

      {panels.left ? (
        <aside className="maker__left maker-float" aria-label="Site">
          <div className="maker-float__head">
            <SegmentedControl
              label="Left panel"
              value={leftTab}
              onValueChange={(value) => setLeftTab(value as "layers" | "insert")}
              options={[
                { value: "layers", label: "Layers" },
                { value: "insert", label: "Insert" },
              ]}
            />
            <IconButton icon={{ role: "chevron-left" }} label="Hide the left panel" onClick={() => setPanels({ ...panels, left: false })} />
          </div>
          {leftTab === "layers" ? (
            <>
              <section className="maker__panel maker__pages" aria-labelledby="maker-pages">
                <Pages maker={maker} titleId="maker-pages" />
              </section>
              <section className="maker__panel maker__outline" aria-labelledby="maker-layers">
                <header className="maker__panel-header">
                  <h2 className="maker__panel-title" id="maker-layers">
                    Layers
                  </h2>
                </header>
                <Outline maker={maker} drag={drag} />
              </section>
            </>
          ) : (
            <section className="maker__panel maker__palette" aria-label="Insert">
              <Palette maker={maker} drag={drag} />
            </section>
          )}
        </aside>
      ) : (
        <span className="maker-float-toggle maker-float-toggle--left">
          <IconButton icon={{ glyph: "layers" }} label="Show the left panel" onClick={() => setPanels({ ...panels, left: true })} />
        </span>
      )}

      <main className="maker__stage">
        <Canvas maker={maker} drag={drag} insets={{ left: panels.left ? 300 : 16, right: panels.right ? 348 : 16, top: 64 }} />
      </main>

      {!panels.right && !projectsOpen && !publishingOpen && !exporting ? (
        <span className="maker-float-toggle maker-float-toggle--right">
          <IconButton icon={{ glyph: "inspect" }} label="Show the inspector" onClick={() => setPanels({ ...panels, right: true })} />
        </span>
      ) : (
      <aside className="maker__right maker-float" aria-label={projectsOpen ? "Projects" : publishingOpen ? "Publish" : exporting ? "Export" : "Inspector"}>
        {!projectsOpen && !publishingOpen && !exporting ? (
          <div className="maker-float__head maker-float__head--end">
            <IconButton icon={{ role: "chevron-right" }} label="Hide the inspector" onClick={() => setPanels({ ...panels, right: false })} />
          </div>
        ) : null}
        {projectsOpen ? (
          <ProjectsPanel workspace={workspace} onClose={onCloseProjects} />
        ) : publishingOpen ? (
          <PublishPanel maker={maker} sync={sync} onClose={() => setPublishingOpen(false)} onPublished={() => void workspace.refresh()} />
        ) : exporting ? (
          <ExportPanel
            maker={maker}
            onClose={() => setExporting(false)}
            importAsProject={workspace.mode.kind === "server" ? (name, site) => workspace.create(name, site) : undefined}
          />
        ) : (
          <Inspector maker={maker} />
        )}
      </aside>
      )}

      <p className="maker__notice" role="status" aria-live="polite" key={maker.notice?.at}>
        {maker.notice?.text}
      </p>
    </div>
  );
}

/** Which floating panels are open: a per-person preference, remembered in this browser. */
function usePanels(): [{ left: boolean; right: boolean }, (next: { left: boolean; right: boolean }) => void] {
  const [panels, setPanels] = useState(() => {
    try {
      return { left: true, right: true, ...(JSON.parse(localStorage.getItem("skryensya-maker:panels") ?? "{}") as object) };
    } catch {
      return { left: true, right: true };
    }
  });
  const update = (next: { left: boolean; right: boolean }) => {
    setPanels(next);
    try {
      localStorage.setItem("skryensya-maker:panels", JSON.stringify(next));
    } catch {
      /* not remembered */
    }
  };
  return [panels, update];
}
