import { kbdParts, type KbdTone, kbdContract } from "@skryensya/core/kbd";
import { useEffect, type HTMLAttributes } from "react";
import { a11yWarnRef, dev, devTicket } from "../dev-warning.js";

/* Derived, never restated: the default lives in the contract. */
const { appearance: appearanceOption, tone: toneOption } = kbdContract.options;

/*
 * Same posture as Tag's own `warnEmptyTag`: `children` is the WHOLE accessible content here too,
 * with no icon slot or `aria-label` escape hatch to fall back on - a key legend computed from the
 * platform (an OS-specific shortcut that has no key on this one) can come up empty and render a
 * blank keycap with nothing to announce.
 */
function isEmptyKbd(children: string): boolean {
  return children.trim().length === 0;
}

function warnEmptyKbd(empty: boolean): void {
  if (!dev || !empty) return;
  console.error(
    ...devTicket("<Kbd>", {
      issue: "renders nothing: children is empty.",
      why: "The keycap still takes its square minimum size and nothing is announced - there is no `aria-label` to fall back on, the legend IS the accessible content.",
      fix: "Give it a key, or do not render it.",
    }),
  );
}

export type { KbdTone };

export type KbdProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Matches the contract slot: the key legend as plain text. */
  children: string;
  /** `neutral` is a physical keycap. `accent` is the brand-toned label. */
  tone?: KbdTone;
  /** How the key is drawn: `plain` (a keycap), or `brutalist`'s black edge and small hard offset. */
  appearance?: (typeof appearanceOption.values)[number];
};

/**
 * A single keyboard key, drawn, the ⌘ in a ⌘K hint, the Esc in a palette footer. Renders the native
 * <kbd> element (its semantics are the platform's; the component only adds the look). Static: no state,
 * no machine, so there is no vanilla enhancer, only this wrapper and the core hooks.
 */
const keyIcon = (label: string): string | undefined => {
  const key = label.trim().toLowerCase();
  if (["arrowup", "up", "↑"].includes(key)) return "arrowup";
  if (["arrowdown", "down", "↓"].includes(key)) return "arrowdown";
  if (["arrowleft", "left", "←"].includes(key)) return "arrowleft";
  if (["arrowright", "right", "→"].includes(key)) return "arrowright";
  if (["enter", "return", "↵", "⏎"].includes(key)) return "enter";
  return undefined;
};

export function Kbd({ appearance = appearanceOption.default, children, className, tone = toneOption.default, ...props }: KbdProps) {
  const classes = className ? `${kbdParts.root} ${className}` : kbdParts.root;
  const dataKey = (props as { "data-key"?: string })["data-key"] ?? keyIcon(children);
  const empty = isEmptyKbd(children);
  // Effect, not a direct render-body call: guarantees this only ever runs client-side, after
  // mount, straight into the browser's own console - no SSR pass involved, so there is no SSR-
  // vs-client environment to disagree about in the first place.
  useEffect(() => warnEmptyKbd(empty), [empty]);

  return (
    <kbd
      {...props}
      className={classes}
      data-appearance={appearance}
      data-tone={tone}
      data-key={dataKey}
      ref={a11yWarnRef(empty)}
    >
      {children}
    </kbd>
  );
}
