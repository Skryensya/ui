import { useEffect, useState } from "react";
import { Button } from "@skryensya/react/button";
import { SegmentedControl } from "@skryensya/react/segmented";
import { NativeSelect } from "@skryensya/react/select-native";
import { useDrag } from "./drag";
import { ExportPanel } from "./ExportPanel";
import { Inspector } from "./Inspector";
import { Outline } from "./Outline";
import { Palette } from "./Palette";
import { Stage } from "./stage/Stage";
import { useMaker, type StageWidth, type View } from "./state";

/*
 * The Maker's chrome: the page as a tree on the left (outline, and the palette that adds to it),
 * the stage in the middle, the inspector on the right. The toolbar holds only VIEW controls
 * (stage width, edit or interact, theme) and history; none of them changes the page.
 */

const WIDTHS: readonly { value: string; label: string; width: StageWidth }[] = [
  { value: "fit", label: "Fit", width: "fit" },
  { value: "36", label: "36rem", width: 36 },
  { value: "52", label: "52rem", width: 52 },
  { value: "72", label: "72rem", width: 72 },
  { value: "90", label: "90rem", width: 90 },
];

export function App() {
  const maker = useMaker();
  const drag = useDrag(maker.page.root, maker.gesture);
  const [exporting, setExporting] = useState(false);
  const { view, setView } = maker;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        if (event.shiftKey) maker.redo();
        else maker.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maker.undo, maker.redo]);

  const widthValue = typeof view.width === "object" ? "custom" : String(view.width);

  return (
    <div className={`maker${drag.session ? " maker--dragging" : ""}`}>
      <header className="maker__toolbar">
        <h1 className="maker__brand">Maker</h1>
        <div className="maker__group">
          <Button variant="ghost" size="sm" onClick={maker.undo} disabled={!maker.canUndo}>
            Undo
          </Button>
          <Button variant="ghost" size="sm" onClick={maker.redo} disabled={!maker.canRedo}>
            Redo
          </Button>
        </div>
        <SegmentedControl
          label="Stage width"
          value={widthValue === "custom" ? undefined : widthValue}
          onValueChange={(value) => setView({ width: WIDTHS.find((w) => w.value === value)!.width })}
          options={WIDTHS.map(({ value, label }) => ({ value, label }))}
        />
        <SegmentedControl
          label="Mode"
          value={view.mode}
          onValueChange={(value) => setView({ mode: value as View["mode"] })}
          options={[
            { value: "edit", label: "Edit" },
            { value: "interact", label: "Interact" },
          ]}
        />
        <div className="maker__group">
          <NativeSelect aria-label="Color mode" value={view.scheme} onChange={(e) => setView({ scheme: e.currentTarget.value as View["scheme"] })} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
          <NativeSelect aria-label="Density" value={view.density} onChange={(e) => setView({ density: e.currentTarget.value as View["density"] })} options={[{ value: "compact", label: "Compact" }, { value: "default", label: "Default density" }, { value: "comfortable", label: "Comfortable" }]} />
          <NativeSelect aria-label="Radius" value={view.radius} onChange={(e) => setView({ radius: e.currentTarget.value as View["radius"] })} options={["none", "sm", "md", "lg", "xl"].map((r) => ({ value: r, label: `Radius ${r}` }))} />
          <label className="maker__check">
            <input type="checkbox" checked={view.contrast} onChange={(e) => setView({ contrast: e.currentTarget.checked })} /> High contrast
          </label>
        </div>
        <Button variant="solid" size="sm" onClick={() => setExporting(true)}>
          Export
        </Button>
      </header>

      <aside className="maker__left" aria-label="Page">
        <section className="maker__outline" aria-label="Outline">
          <h2 className="maker__panel-title">Outline</h2>
          <Outline maker={maker} drag={drag} />
        </section>
        <section className="maker__palette" aria-label="Insert">
          <h2 className="maker__panel-title">Insert</h2>
          <Palette maker={maker} drag={drag} />
        </section>
      </aside>

      <main className="maker__stage">
        <Stage maker={maker} drag={drag} />
      </main>

      <aside className="maker__right" aria-label={exporting ? "Export" : "Inspector"}>
        {exporting ? <ExportPanel maker={maker} onClose={() => setExporting(false)} /> : <Inspector maker={maker} />}
      </aside>

      <p className="maker__notice" role="status" aria-live="polite" key={maker.notice?.at}>
        {maker.notice?.text}
      </p>
      {drag.session?.target && drag.session.target.surface !== "stage" ? null : null}
    </div>
  );
}
