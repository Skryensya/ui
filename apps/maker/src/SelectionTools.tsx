import { Toolbar } from "@skryensya/react/toolbar";
import { actions, allowed } from "./actions";
import { IconButton } from "./IconButton";
import type { Maker } from "./state";

/*
 * The structural actions on the selection as a toolbar above the layers: the same gestures the
 * keyboard sends, each disabled exactly when the model would refuse it.
 */
export function SelectionTools({ maker }: { maker: Maker }) {
  const root = maker.page.root;
  const selected = maker.view.selected;
  return (
    <Toolbar label="Selection" className="maker__selection-tools">
      {actions.map((action) => {
        const gesture = allowed(root, selected, action);
        return (
          <IconButton
            key={action.id}
            icon={action.icon}
            label={action.label}
            shortcut={action.shortcut}
            disabled={!gesture}
            tone={action.id === "remove" ? "danger" : undefined}
            onClick={() => gesture && maker.gesture(gesture.operations, gesture.select)}
          />
        );
      })}
    </Toolbar>
  );
}
