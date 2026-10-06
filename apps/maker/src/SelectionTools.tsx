import { actions, canDo, shortcutOf } from "./actions";
import { runCanvasCommand, type CanvasCommand } from "./CanvasMenu";
import { IconButton } from "./IconButton";
import type { Maker } from "./state";

/** Where a gap opens in the row: structure moves, then the things you make or remove. */
const GROUP_STARTS = new Set(["wrap", "remove"]);

/*
 * THE STRUCTURAL ACTIONS ON THE SELECTION, as buttons: the same gestures the keyboard sends, each disabled
 * exactly when the model would refuse it. They live in ONE place on screen, the toolbar over the canvas
 * (QuickToolbar), plus the Edit menu and the context menu for people who look for words. The Inspector used
 * to repeat the whole row in its header; a second copy of eight icons was something to scan past, not
 * something that helped.
 */
export function SelectionActionButtons({
  maker,
  appearance,
  size,
}: {
  maker: Maker;
  appearance?: "plain" | "tactile" | "brutalist" | "frosted";
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const root = maker.page.root;
  const selected = maker.view.selected;
  return actions.flatMap((action) => {
    const enabled = canDo(root, selected, action) || (maker.view.selectedIds.length > 1 && ["duplicate", "move-up", "move-down", "remove"].includes(action.id));
    return [
      ...(GROUP_STARTS.has(action.id) ? [<span key={`${action.id}-gap`} className="maker-quick-toolbar__separator" aria-hidden="true" />] : []),
      <IconButton
        key={action.id}
        text={action.text}
        icon={action.icon}
        label={action.label}
        shortcut={shortcutOf(action)}
        appearance={appearance}
        size={size}
        disabled={!enabled}
        tone={action.id === "remove" ? "danger" : undefined}
        onClick={() => runCanvasCommand(maker, action.id as CanvasCommand)}
      />,
    ];
  });
}
