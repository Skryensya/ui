import { Toolbar } from "@skryensya/react/toolbar";
import { actions, allowed, shortcutOf } from "./actions";
import { runCanvasCommand, type CanvasCommand } from "./CanvasMenu";
import { IconButton } from "./IconButton";
import type { Maker } from "./state";

/*
 * The structural actions on the selection as a toolbar above the layers: the same gestures the
 * keyboard sends, each disabled exactly when the model would refuse it.
 */
export function SelectionTools({ maker }: { maker: Maker }) {
  return (
    <Toolbar label="Selection" className="maker__selection-tools">
      <SelectionActionButtons maker={maker} appearance="tactile" />
    </Toolbar>
  );
}

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
  return actions.map((action) => {
    const gesture = allowed(root, selected, action);
    const enabled = Boolean(gesture) || (maker.view.selectedIds.length > 1 && ["duplicate", "move-up", "move-down", "remove"].includes(action.id));
    return (
      <IconButton
        key={action.id}
        icon={action.icon}
        label={action.label}
        shortcut={shortcutOf(action)}
        appearance={appearance}
        size={size}
        disabled={!enabled}
        tone={action.id === "remove" ? "danger" : undefined}
        onClick={() => runCanvasCommand(maker, action.id as CanvasCommand)}
      />
    );
  });
}
