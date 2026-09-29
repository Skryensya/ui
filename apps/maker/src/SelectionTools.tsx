import { Toolbar } from "@skryensya/react/toolbar";
import { actions, allowed, shortcutOf } from "./actions";
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
    return (
      <IconButton
        key={action.id}
        icon={action.icon}
        label={action.label}
        shortcut={shortcutOf(action)}
        appearance={appearance}
        size={size}
        disabled={!gesture}
        tone={action.id === "remove" ? "danger" : undefined}
        onClick={() => gesture && maker.gesture(gesture.operations, gesture.select)}
      />
    );
  });
}
