import type { CSSProperties } from "react";
import { Toolbar } from "@skryensya/react/toolbar";
import { IconButton } from "./IconButton";
import { SelectionActionButtons } from "./SelectionTools";
import { selectParent, type Maker } from "./state";

/*
 * The app bar keeps every command discoverable as words. This toolbar repeats the commands people
 * reach for constantly while composing on the canvas, so important actions are one click away.
 */
export function QuickToolbar({
  maker,
  panels,
  panelWidths = { left: 272, right: 320 },
  openInsertPanel,
  onPlay,
  top = "10px",
  rightDocked = panels.right,
}: {
  maker: Maker;
  panels: { left: boolean; right: boolean };
  panelWidths?: { left: number; right: number };
  openInsertPanel: () => void;
  onPlay: () => void;
  top?: string;
  rightDocked?: boolean;
}) {
  const selected = maker.view.selected;
  const style = {
    "--maker-tools-top": top,
    "--maker-tools-left": panels.left ? `${panelWidths.left + 16}px` : "16px",
    "--maker-tools-right": rightDocked ? `${panelWidths.right + 16}px` : "16px",
  } as CSSProperties;
  return (
    <div className="maker-quick-tools" style={style}>
      {maker.view.mode === "edit" ? (
        <Toolbar label="Edit actions" className="maker-mode-toolbar">
          <IconButton icon={{ glyph: "insert" }} label="Insert blocks and sections" appearance="tactile" onClick={openInsertPanel} />
          <IconButton icon={{ glyph: "outdent" }} label="Select parent" appearance="tactile" disabled={!selected} onClick={() => selectParent(maker)} />
          <span className="maker-quick-toolbar__separator" aria-hidden="true" />
          <SelectionActionButtons maker={maker} appearance="tactile" />
        </Toolbar>
      ) : null}
      <Toolbar label="Canvas actions" className="maker-quick-toolbar">
        <IconButton icon={{ glyph: "undo" }} label="Undo" appearance="tactile" disabled={!maker.canUndo} onClick={maker.undo} />
        <IconButton icon={{ glyph: "redo" }} label="Redo" appearance="tactile" disabled={!maker.canRedo} onClick={maker.redo} />
        <IconButton icon={{ glyph: "play" }} label="Play site" appearance="tactile" onClick={onPlay} />
        <span className="maker-quick-toolbar__separator" aria-hidden="true" />
        <IconButton
          icon={{ glyph: "edit" }}
          label="Edit mode"
          appearance="tactile"
          pressed={maker.view.mode === "edit"}
          onClick={() => maker.setView({ mode: "edit" })}
        />
        <IconButton
          icon={{ glyph: "interact" }}
          label="Interact mode"
          appearance="tactile"
          pressed={maker.view.mode === "interact"}
          onClick={() => maker.setView({ mode: "interact", selected: undefined })}
        />
        <span className="maker-quick-toolbar__separator" aria-hidden="true" />
        <IconButton
          icon={{ glyph: "scheme" }}
          label={maker.view.scheme === "dark" ? "Use light canvas" : "Use dark canvas"}
          appearance="tactile"
          pressed={maker.view.scheme === "dark"}
          onClick={() => maker.setView({ scheme: maker.view.scheme === "dark" ? "light" : "dark" })}
        />
      </Toolbar>
    </div>
  );
}
