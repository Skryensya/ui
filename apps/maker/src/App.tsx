import { useState } from "react";
import { detectMac, formatHotkey, isTypingContext } from "@skryensya/core/hotkey";
import { useHotkey } from "@skryensya/react/hotkey";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { NativeSelect } from "@skryensya/react/select-native";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@skryensya/react/toolbar";
import { useDrag } from "./drag";
import { useProjectSync } from "./sync";
import { ProjectsPanel } from "./ProjectsPanel";
import { useWorkspace, type Workspace } from "./workspace";
import { ExportPanel } from "./ExportPanel";
import { IconButton } from "./IconButton";
import { MakerIcon, type AnyIcon } from "./icons";
import { Inspector } from "./Inspector";
import { Outline } from "./Outline";
import { Pages } from "./Pages";
import { Palette } from "./Palette";
import { SelectionTools } from "./SelectionTools";
import { Stage } from "./stage/Stage";
import { LOCAL_PROJECT, useMaker, type StageWidth, type View } from "./state";

/*
 * The Maker's chrome: one toolbar on top for everything about VIEWING the page (history, stage
 * width, edit or interact, theme) and exporting it; the page as a tree on the left with the tools
 * that act on the selection; the stage in the middle; the inspector on the right. Nothing in the
 * top toolbar changes the page except undo and redo.
 */

const WIDTHS: readonly { width: StageWidth; label: string; icon: AnyIcon }[] = [
  { width: "fit", label: "Fit the space available", icon: { role: "fit" } },
  { width: 36, label: "36rem, compact (phone)", icon: { role: "screen-mobile" } },
  { width: 52, label: "52rem, where expanded begins (tablet)", icon: { role: "screen-tablet" } },
  { width: 72, label: "72rem (desktop)", icon: { role: "screen-desktop" } },
  { width: 90, label: "90rem, the widest page column", icon: { role: "maximize" } },
];

const same = (a: StageWidth, b: StageWidth) => a === b;

/*
 * THE SHELL: the open projects as tabs, and the one that shows. With nothing open, the list of
 * projects is the whole screen.
 */
export function App() {
  const workspace = useWorkspace();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const server = workspace.mode.kind === "server";

  return (
    <div className="maker-shell">
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
        <span className="maker-tabs__store">
          {workspace.mode.kind === "server"
            ? workspace.mode.store === "postgres"
              ? "PostgreSQL"
              : "Server memory"
            : workspace.mode.kind === "local"
              ? "This browser only"
              : "…"}
        </span>
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

  return (
    <div className={`maker${drag.session ? " maker--dragging" : ""}`}>
      {/* Not a <header>: the shell's tab row is the page's one banner. A named region instead. */}
      <section className="maker__top" aria-label="View and export">
        <Toolbar label="Maker" className="maker__toolbar">
          <ToolbarGroup label="History">
            <IconButton icon={{ glyph: "undo" }} label="Undo" shortcut={formatHotkey("mod+z", mac)} onClick={maker.undo} disabled={!maker.canUndo} />
            <IconButton icon={{ glyph: "redo" }} label="Redo" shortcut={formatHotkey("mod+shift+z", mac)} onClick={maker.redo} disabled={!maker.canRedo} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup label="Stage width">
            {WIDTHS.map(({ width, label, icon }) => (
              <IconButton key={String(width)} icon={icon} label={`Stage width: ${label}`} pressed={same(view.width, width)} onClick={() => setView({ width })} />
            ))}
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup label="Mode">
            <IconButton icon={{ glyph: "edit" }} label="Edit: a click selects" pressed={view.mode === "edit"} onClick={() => setView({ mode: "edit" })} />
            <IconButton icon={{ glyph: "interact" }} label="Interact: the page responds" pressed={view.mode === "interact"} onClick={() => setView({ mode: "interact" })} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup label="Theme of the stage">
            <IconButton
              icon={{ role: view.scheme === "dark" ? "mode-dark" : "mode-light" }}
              label="Dark stage"
              pressed={view.scheme === "dark"}
              onClick={() => setView({ scheme: view.scheme === "dark" ? "light" : "dark" })}
            />
            <IconButton icon={{ glyph: "contrast" }} label="High contrast stage" pressed={view.contrast} onClick={() => setView({ contrast: !view.contrast })} />
            <NativeSelect
              className="maker__select"
              aria-label="Density"
              value={view.density}
              onChange={(e) => setView({ density: e.currentTarget.value as View["density"] })}
              options={[
                { value: "compact", label: "Density: compact" },
                { value: "default", label: "Density: default" },
                { value: "comfortable", label: "Density: comfortable" },
              ]}
            />
            <NativeSelect
              className="maker__select"
              aria-label="Radius"
              value={view.radius}
              onChange={(e) => setView({ radius: e.currentTarget.value as View["radius"] })}
              options={["none", "sm", "md", "lg", "xl"].map((r) => ({ value: r, label: `Radius ${r}` }))}
            />
          </ToolbarGroup>
        </Toolbar>
        {projectId !== LOCAL_PROJECT ? (
          <span className={`maker__sync maker__sync--${sync}`} role="status">
            {sync === "saved" ? "Saved" : sync === "syncing" ? "Saving…" : "Offline: changes wait here"}
          </span>
        ) : null}
        <Button variant="solid" size="sm" pre={<Icon name="download" />} onClick={() => setExporting(true)}>
          Export
        </Button>
      </section>

      <aside className="maker__left" aria-label="Site">
        <section className="maker__panel maker__pages" aria-labelledby="maker-pages">
          <header className="maker__panel-header">
            <h2 className="maker__panel-title" id="maker-pages">
              <MakerIcon icon={{ glyph: "pages" }} />
              Pages
            </h2>
          </header>
          <Pages maker={maker} />
        </section>
        <section className="maker__panel maker__outline" aria-labelledby="maker-layers">
          <header className="maker__panel-header">
            <h2 className="maker__panel-title" id="maker-layers">
              <MakerIcon icon={{ glyph: "layers" }} />
              Layers of {maker.page.name}
            </h2>
          </header>
          <SelectionTools maker={maker} />
          <Outline maker={maker} drag={drag} />
        </section>
        <section className="maker__panel maker__palette" aria-labelledby="maker-insert">
          <header className="maker__panel-header">
            <h2 className="maker__panel-title" id="maker-insert">
              <MakerIcon icon={{ role: "add" }} />
              Insert
            </h2>
          </header>
          <Palette maker={maker} drag={drag} />
        </section>
      </aside>

      <main className="maker__stage">
        <Stage maker={maker} drag={drag} />
      </main>

      <aside className="maker__right" aria-label={projectsOpen ? "Projects" : exporting ? "Export" : "Inspector"}>
        {projectsOpen ? (
          <ProjectsPanel workspace={workspace} onClose={onCloseProjects} />
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

      <p className="maker__notice" role="status" aria-live="polite" key={maker.notice?.at}>
        {maker.notice?.text}
      </p>
    </div>
  );
}
