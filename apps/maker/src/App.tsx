import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { isTypingContext } from "@skryensya/core/hotkey";
import { trapModalDialogs } from "@skryensya/core/focus-trap";
import { useHotkey } from "@skryensya/react/hotkey";
import { useDrag } from "./drag";
import { useProjectSync } from "./sync";
import { ProjectsPanel } from "./ProjectsPanel";
import { PublishPanel } from "./PublishPanel";
import { useWorkspace, type Workspace } from "./workspace";
import { ExportPanel } from "./ExportPanel";
import { IconButton } from "./IconButton";
import { Inspector } from "./Inspector";
import type { MakerSite } from "@skryensya/maker-model";
import { Outline } from "./Outline";
import { Pages } from "./Pages";
import { Palette } from "./Palette";
import { MakerBar } from "./MakerBar";
import { CanvasMenu } from "./CanvasMenu";
import { QuickToolbar } from "./QuickToolbar";
import { Canvas, type CanvasControls } from "./stage/Canvas";
import { Button } from "@skryensya/react/button";
import { Select } from "@skryensya/react/select";
import { SegmentedControl } from "@skryensya/react/segmented";
import { MakerIcon } from "./icons";
import { LOCAL_PROJECT, selectParent, stageTree, useMaker, type Maker } from "./state";
import type { StageApi } from "./stage/entry";

const AIPanel = lazy(() => import("./ai/Panel").then(module => ({ default: module.AIPanel })));

/*
 * The Maker's chrome: the bar across the top holds every command as words in menus (MakerBar.tsx);
 * the open projects are tabs under it; over the canvas float only the two panels, pages, layers and
 * the palette on the left, the inspector on the right.
 */

/*
 * THE SHELL: the open projects as tabs, and the one that shows. With nothing open, the list of
 * projects is the whole screen.
 */
export function App() {
  const workspace = useWorkspace();
  const [uiScheme, setUiScheme] = useUiScheme();
  const [projectsOpen, setProjectsOpen] = useState(false);
  /* The bar's place at the top of the shell. An open project renders its own bar into it (its menus
     need that project's state); with none open, the shell draws the bar with what needs no project. */
  const [barSlot, setBarSlot] = useState<HTMLElement | null>(null);
  const server = workspace.mode.kind === "server";
  const toggleProjects = () => setProjectsOpen((value) => !value);

  return (
    <div className="maker-shell" data-sk-density-scope="">
      {/* The page's one banner: the application's bar. */}
      <header ref={setBarSlot} className="maker-shell__bar">
        {workspace.active ? null : <MakerBar workspace={workspace} onProjects={toggleProjects} />}
      </header>
      {workspace.mode.kind === "local" ? (
        <p className="maker-shell__local" role="status">
          This browser only. {workspace.mode.reason}
        </p>
      ) : null}
      {workspace.active ? (
        <Editor
          key={workspace.active}
          projectId={workspace.active}
          workspace={workspace}
          projectsOpen={projectsOpen}
          onProjects={toggleProjects}
          onCloseProjects={() => setProjectsOpen(false)}
          barSlot={barSlot}
          uiScheme={uiScheme}
          toggleUiScheme={() => setUiScheme(uiScheme === "light" ? "dark" : "light")}
        />
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
  onProjects,
  onCloseProjects,
  barSlot,
  uiScheme,
  toggleUiScheme,
}: {
  projectId: string;
  workspace: Workspace;
  projectsOpen: boolean;
  onProjects: () => void;
  onCloseProjects: () => void;
  barSlot: HTMLElement | null;
  uiScheme: "light" | "dark";
  toggleUiScheme: () => void;
}) {
  const maker = useMaker(projectId);
  const drag = useDrag(maker.page.root, maker.gesture);
  const sync = useProjectSync(maker, projectId !== LOCAL_PROJECT);
  const [exporting, setExporting] = useState(false);
  const [publishingOpen, setPublishingOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStarted, setAiStarted] = useState(false);
  const [aiPreview, setAiPreview] = useState<MakerSite>();
  const [panels, setPanels] = usePanels();
  const [panelWidths, setPanelWidths] = usePanelWidths();
  const [leftTab, setLeftTab] = useState<"layers" | "insert">("layers");
  const rightPanel = projectsOpen ? "Projects" : publishingOpen ? "Publish" : exporting ? "Export" : "Inspector";
  const rightDocked = panels.right || projectsOpen || publishingOpen || exporting;
  const canvas = useRef<CanvasControls | null>(null);
  const [zoom, setZoom] = useState(1);

  /* Undo and redo page-wide, through the kit's hotkeys; inside a text field they stay the field's. */
  const history = (step: () => void) => (event: KeyboardEvent) => {
    if (isTypingContext(event.target)) return;
    event.preventDefault();
    step();
  };
  useHotkey("mod+z", history(maker.undo), { preventDefault: false });
  useHotkey("mod+shift+z", history(maker.redo), { preventDefault: false });

  /* Escape walks up the tree, as in a design tool: from a node to its container, from Main to
     nothing. Not while typing, and not while a menu or a dialog is taking the key for itself. */
  useHotkey(
    "escape",
    (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTypingContext(event.target)) return;
      if ((event.target as Element | null)?.closest?.('[role="menu"], [role="menuitem"], dialog, [popover]')) return;
      selectParent(maker);
    },
    { preventDefault: false },
  );

  /* Mod+\\ hides both panels for a clear canvas, and brings them back. */
  useHotkey("mod+\\", () => setPanels(panels.left || panels.right ? { left: false, right: false } : { left: true, right: true }));

  return (
    <div className={`maker${drag.session ? " maker--dragging" : ""}`}>
      {barSlot
        ? createPortal(
            <MakerBar
              workspace={workspace}
              onProjects={onProjects}
              editor={{
                maker,
                sync,
                local: projectId === LOCAL_PROJECT,
                panels,
                setPanels,
                canvas,
                zoom,
                openExport: () => {
                  setPublishingOpen(false);
                  setExporting(true);
                },
                openPublish: () => {
                  setExporting(false);
                  setPublishingOpen(true);
                },
                openInsertPanel: () => {
                  setPanels({ ...panels, left: true });
                  setLeftTab("insert");
                },
              }}
            />,
            barSlot,
          )
        : null}

      {panels.left ? (
        <aside className="maker__left maker-float" aria-label="Site" style={{ inlineSize: panelWidths.left }}> 
          <div className="maker-float__head">
            <SegmentedControl
              appearance="frosted"
              className="maker-left-tabs"
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
                <header className="maker__panel-header maker__panel-header--stacked">
                  <h2 className="maker__panel-title" id="maker-layers">
                    Layers
                  </h2>
                  <p className="maker__panel-help">Select, drag, or use shortcuts to reorganize.</p>
                </header>
                <Outline maker={maker} drag={drag} />
              </section>
            </>
          ) : (
            <section className="maker__panel maker__palette" aria-label="Insert">
              <Palette maker={maker} drag={drag} />
            </section>
          )}
          <PanelResizeHandle side="left" width={panelWidths.left} onWidth={(left) => setPanelWidths({ ...panelWidths, left })} />
        </aside>
      ) : (
        <span className="maker-float-toggle maker-float-toggle--left">
          <IconButton icon={{ glyph: "layers" }} label="Show the left panel" onClick={() => setPanels({ ...panels, left: true })} />
        </span>
      )}

      {workspace.mode.kind === "server" ? <ProjectTabs workspace={workspace} projectsOpen={projectsOpen} onProjects={onProjects} panels={panels} rightDocked={rightDocked} panelWidths={panelWidths} uiScheme={uiScheme} toggleUiScheme={toggleUiScheme} setPanels={setPanels} /> : null}

      <main className="maker__stage">
        <Canvas maker={maker} drag={drag} insets={{ left: panels.left ? panelWidths.left + 16 : 16, right: rightDocked ? panelWidths.right + 16 : 16, top: workspace.mode.kind === "server" ? 144 : 96 }} controls={canvas} onZoom={setZoom} />
      </main>

      <QuickToolbar
        maker={maker}
        panels={panels}
        panelWidths={panelWidths}
        top={workspace.mode.kind === "server" ? "60px" : "10px"}
        rightDocked={rightDocked}
        openInsertPanel={() => {
          setPanels({ ...panels, left: true });
          setLeftTab("insert");
        }}
        onPlay={() => setPlaying(true)}
      />

      {playing ? createPortal(<PlayPreview maker={maker} onClose={() => setPlaying(false)} />, document.body) : null}
      {aiPreview ? createPortal(<PlayPreview maker={{ ...maker, site: aiPreview, page: aiPreview.pages.find(p => p.id === maker.page.id) ?? aiPreview.pages[0]! }} label="AI proposal preview" onClose={() => setAiPreview(undefined)} />, document.body) : null}

      {!panels.right && !projectsOpen && !publishingOpen && !exporting ? (
        <span className="maker-float-toggle maker-float-toggle--right">
          <IconButton icon={{ glyph: "inspect" }} label="Show the inspector" onClick={() => setPanels({ ...panels, right: true })} />
        </span>
      ) : (
      <aside className="maker__right maker-float" aria-label={rightPanel === "Inspector" && aiOpen ? "AI" : rightPanel} style={{ inlineSize: panelWidths.right }}>
        <PanelResizeHandle side="right" width={panelWidths.right} onWidth={(right) => setPanelWidths({ ...panelWidths, right })} />
        {rightPanel === "Inspector" && <SegmentedControl label="Editing mode" value={aiOpen ? "ai" : "inspector"} onValueChange={v => { setAiOpen(v === "ai"); if (v === "ai") setAiStarted(true); }} options={[{ value: "inspector", label: "Inspector" }, { value: "ai", label: "AI" }]} />}
        <div key={rightPanel} className="maker-panel-swap" hidden={rightPanel === "Inspector" && aiOpen}>
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
        </div>
        <div hidden={rightPanel !== "Inspector" || !aiOpen}>{aiStarted && <Suspense fallback={<p role="status">Loading Maker AI…</p>}><AIPanel maker={maker} onPreview={setAiPreview} /></Suspense>}</div>
      </aside>
      )}

      {/* The right-click menu and the canvas's keys (Delete, ⌘C/⌘X/⌘V/⌘D). */}
      <CanvasMenu maker={maker} />

      <p className="maker__notice" role="status" aria-live="polite" key={maker.notice?.at}>
        {maker.notice?.text}
      </p>
    </div>
  );
}

function PlayPreview({ maker, onClose, label = "Play site" }: { maker: Maker; onClose: () => void; label?: string }) {
  const modal = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = modal.current!;
    dialog.showModal();
    const release = trapModalDialogs(document);
    return () => { dialog.close(); release(); };
  }, []);
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [pageId, setPageId] = useState(maker.page.id);
  const page = maker.site.pages.find((entry) => entry.id === pageId) ?? maker.page;

  const checkReady = () => {
    if ((frame.current?.contentWindow as (Window & { makerStage?: StageApi }) | undefined)?.makerStage) setReady(true);
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === "maker-stage-ready") setReady(true);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKey);
    checkReady();
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const win = frame.current?.contentWindow as (Window & { makerStage?: StageApi }) | undefined;
    const stage = win?.makerStage;
    const doc = frame.current?.contentDocument;
    if (!ready || !stage || !doc) return;
    doc.documentElement.setAttribute("data-scheme", maker.view.scheme);
    doc.documentElement.style.colorScheme = maker.view.scheme;
    if (maker.view.contrast) doc.documentElement.setAttribute("data-contrast", "high");
    else doc.documentElement.removeAttribute("data-contrast");
    doc.documentElement.style.setProperty("--sk-density", maker.view.density === "compact" ? "0.75" : maker.view.density === "comfortable" ? "1.25" : "1");
    doc.documentElement.setAttribute("data-radius", maker.view.radius);
    doc.documentElement.setAttribute("data-maker-mode", "interact");
    void stage.render(stageTree(page.root, undefined));
  }, [ready, page.root, maker.view.scheme, maker.view.contrast, maker.view.density, maker.view.radius]);

  return (
    <dialog ref={modal} className="maker-play" aria-label={label} onCancel={e => { e.preventDefault(); onClose(); }}>
      <header className="maker-play__bar">
        <div className="maker-play__identity">
          <span className="maker-play__eyebrow">{label}</span>
          <strong>{page.name}</strong>
        </div>
        <span className="maker-play__page">
          <Select
            label="Page"
            value={page.id}
            onValueChange={({ value }) => value[0] && setPageId(value[0])}
            options={maker.site.pages.map((entry) => ({ value: entry.id, label: `${entry.name} · ${entry.path}` }))}
          />
        </span>
        <Button variant="ghost" appearance="tactile" size="sm" onClick={onClose}>
          Close play
        </Button>
      </header>
      <div className="maker-play__body">
        <iframe ref={frame} src="/stage.html" title={page.name} className="maker-play__frame" onLoad={checkReady} />
      </div>
    </dialog>
  );
}

function ProjectTabs({
  workspace,
  projectsOpen,
  onProjects,
  panels,
  rightDocked,
  panelWidths,
  uiScheme,
  toggleUiScheme,
  setPanels,
}: {
  workspace: Workspace;
  projectsOpen: boolean;
  onProjects: () => void;
  panels: { left: boolean; right: boolean };
  rightDocked: boolean;
  panelWidths: { left: number; right: number };
  uiScheme: "light" | "dark";
  toggleUiScheme: () => void;
  setPanels: (next: { left: boolean; right: boolean }) => void;
}) {
  const style = {
    "--maker-tabs-left": panels.left ? `${panelWidths.left}px` : "0px",
    "--maker-tabs-right": rightDocked ? `${panelWidths.right}px` : "0px",
  } as CSSProperties;
  return (
    <nav className="maker-tabs sk-tabs" data-size="md" data-variant="underline" aria-label="Open projects" style={style}>
      <span className="maker-tabs__projects-button">
        <IconButton icon={{ role: "folder" }} label="All projects" appearance="tactile" pressed={projectsOpen} onClick={onProjects} />
      </span>
      <div className="maker-tabs__list sk-tabs__list" role="list">
        {workspace.open.map((id) => (
          <span key={id} className="maker-tabs__tab" data-active={id === workspace.active ? "" : undefined} role="listitem">
            <button
              type="button"
              className="maker-tabs__name sk-tabs__trigger sk-interactive"
              data-selected={id === workspace.active ? "" : undefined}
              aria-current={id === workspace.active ? "page" : undefined}
              onClick={() => workspace.setActive(id)}
            >
              {workspace.nameOf(id)}
            </button>
            <Button className="maker-tabs__close" variant="ghost" size="sm" iconOnly aria-label={`Close ${workspace.nameOf(id)}`} onClick={() => workspace.close(id)}>
              <MakerIcon icon={{ role: "close" }} />
            </Button>
          </span>
        ))}
      </div>
      <span className="maker-tabs__ui-button">
        <IconButton
          icon={{ glyph: "scheme" }}
          label={uiScheme === "dark" ? "Use light UI" : "Use dark UI"}
          appearance="tactile"
          pressed={uiScheme === "dark"}
          onClick={toggleUiScheme}
        />
      </span>
      <span className="maker-tabs__inspector-button">
        <IconButton
          icon={{ glyph: "inspect" }}
          label={panels.right ? "Hide inspector" : "Show inspector"}
          appearance="tactile"
          pressed={panels.right}
          onClick={() => setPanels({ ...panels, right: !panels.right })}
        />
      </span>
    </nav>
  );
}

function PanelResizeHandle({ side, width, onWidth }: { side: "left" | "right"; width: number; onWidth: (width: number) => void }) {
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = { x: event.clientX, width };
    const move = (next: PointerEvent) => {
      const delta = next.clientX - start.x;
      onWidth(clampPanel(side === "left" ? start.width + delta : start.width - delta));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return <div className={`maker-panel-resize maker-panel-resize--${side}`} role="separator" aria-orientation="vertical" aria-label={`Resize ${side} panel`} onPointerDown={onPointerDown} />;
}

const clampPanel = (width: number) => Math.max(240, Math.min(460, Math.round(width)));

function useUiScheme(): ["light" | "dark", (next: "light" | "dark") => void] {
  const [scheme, setScheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("skryensya-maker:ui-scheme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-scheme", scheme);
    document.documentElement.style.colorScheme = scheme;
    try {
      localStorage.setItem("skryensya-maker:ui-scheme", scheme);
    } catch {
      /* not remembered */
    }
  }, [scheme]);
  return [scheme, setScheme];
}

/** The docked panel widths, remembered in this browser. */
function usePanelWidths(): [{ left: number; right: number }, (next: { left: number; right: number }) => void] {
  const [widths, setWidths] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("skryensya-maker:panel-widths") ?? "{}") as Partial<{ left: number; right: number }>;
      return { left: clampPanel(saved.left ?? 272), right: clampPanel(saved.right ?? 320) };
    } catch {
      return { left: 272, right: 320 };
    }
  });
  const update = (next: { left: number; right: number }) => {
    const clamped = { left: clampPanel(next.left), right: clampPanel(next.right) };
    setWidths(clamped);
    try {
      localStorage.setItem("skryensya-maker:panel-widths", JSON.stringify(clamped));
    } catch {
      /* not remembered */
    }
  };
  return [widths, update];
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
