import { Button } from "@skryensya/react/button";
import { Tooltip } from "@skryensya/react/tooltip";
import { MakerIcon, type AnyIcon } from "./icons";

/*
 * An icon-only control the way the kit's own snippet composes one: a ghost Button marked iconOnly,
 * named by `aria-label`, described by a Tooltip that repeats the name and adds the shortcut.
 */
export function IconButton({
  icon,
  label,
  shortcut,
  onClick,
  disabled,
  pressed,
  tone,
}: {
  icon: AnyIcon;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  tone?: "danger";
}) {
  return (
    <Tooltip content={shortcut ? `${label} (${shortcut})` : label}>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={label}
        disabled={disabled}
        {...(pressed !== undefined ? { pressed } : {})}
        {...(tone ? { tone } : {})}
        onClick={onClick}
      >
        <MakerIcon icon={icon} />
      </Button>
    </Tooltip>
  );
}
