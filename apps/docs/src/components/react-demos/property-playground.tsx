/*
 * One tree, one option, one live control: `UsagePreview`'s controlled mode. The tree is drawn by
 * `useRenderedTree`, the same as fixed previews, so the two modes differ only in the
 * control and the sentence under the example.
 *
 * The switcher is the kit's own SegmentedControl at `size="lg"`: here the control is the thing being
 * read, not one more control beside a small button, which is exactly what that size is for.
 */
import { useEffect, useState } from "react";
import { Button } from "@skryensya/react/button";
import { SegmentedControl } from "@skryensya/react/segmented";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { useRenderedTree } from "./use-rendered-tree";
import { withOptionAt, type TreePath } from "./usage-tree-path";

export interface PropertyPlaygroundProps {
  tree: UsageTree;
  optionName?: string;
  /** Switch whole trees instead of one option: the tree to draw for each value (`UsagePreview`'s `variants`). */
  trees?: Record<string, UsageTree>;
  /** Where the option lives, when it is not on the root (`usage-tree-path.ts`). */
  target?: TreePath;
  /** The option's values as strings; a boolean option arrives as `["false", "true"]`. */
  values: readonly string[];
  /** Whether the option is a boolean, so the chosen string goes into the tree as `true`/`false`. */
  boolean?: boolean;
  /** For an enum with one value: "true" writes this into the tree and "false" leaves the option out. */
  onValue?: string;
  defaultValue: string;
  /** What each value is called on its segment. */
  labels: Record<string, string>;
  controlLabel: string;
  /** What each value is for, shown under the example for the one that is chosen. Trusted HTML. */
  explain?: Partial<Record<string, string>>;
  /**
   * A button at the top of the stage, ABOVE the specimen, that flips the root's `present` between true and false, for a specimen
   * whose point is its motion (Presence): the control picks HOW it moves, this plays it. Above and not beside the specimen on purpose: the specimen leaves the layout when it hides, and a button next to it would move with it. The label is
   * the button's. Only meaningful with `trees`, whose root is the Presence being toggled.
   */
  toggleLabel?: string;
  /** Whether changing the property should remount the specimen. Disable for continuous animations. */
  remountOnChange?: boolean;
}

export function PropertyPlayground({ tree, optionName, trees, toggleLabel, target = [], values, boolean, onValue, defaultValue, labels, controlLabel, explain, remountOnChange = true }: PropertyPlaygroundProps) {
  const [value, setValue] = useState(defaultValue);
  const [present, setPresent] = useState(true);
  const render = useRenderedTree(trees ? Object.values(trees) : tree);
  /*
   * The control is drawn only once React owns this island, never in the server's HTML. The docs
   * page runs the Vanilla enhancers over the whole document (`initComponents(document)`), and a
   * `[data-sk-segmented]` in an island's server markup got enhanced by them BEFORE React hydrated
   * it: the enhancer stamps `data-sk-segmented-ready` and sizes the indicator, React then finds HTML
   * it did not render and throws the island away with a hydration error. Until then a gap of the
   * control's own height holds its place, so nothing below it moves.
   */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const chosen: UsageTree =
    trees?.[value] ??
    (onValue
      ? withOptionAt(tree, target, optionName!, value === "true" ? onValue : undefined)
      : withOptionAt(tree, target, optionName!, boolean ? value === "true" : value));
  const liveTree: UsageTree = toggleLabel ? withOptionAt(chosen, [], "present", present) : chosen;
  const explanation = explain?.[value];

  return (
    <div className="sk-property-playground">
      {hydrated ? (
        <SegmentedControl
          className="sk-property-playground__control"
          size="lg"
          label={controlLabel}
          value={value}
          onValueChange={setValue}
          options={values.map((entry) => ({ value: entry, label: labels[entry] ?? entry }))}
        />
      ) : (
        <div className="sk-property-playground__control-slot" aria-hidden="true" />
      )}
      <div className="sk-preview-card__stage" onSubmitCapture={(event) => event.preventDefault()} key={remountOnChange ? value : "stable"} data-with-toggle={toggleLabel ? "" : undefined}
        /* Inline, not a stylesheet rule: the stage's own rule is global and this one has to win. The button
           stacks over the specimen and both are pinned to the top, because the specimen leaves the layout
           when it hides and anything centred would move with it. */
        style={toggleLabel ? { flexDirection: "column", justifyContent: "flex-start", gap: "var(--space-stack-md)" } : undefined}
      >
        {hydrated && toggleLabel && (
          <Button type="button" variant="ghost" aria-pressed={present} onClick={() => setPresent((current) => !current)}>
            {toggleLabel}
          </Button>
        )}
        {render ? render(liveTree) : null}
      </div>
      {/*
        * EVERY explanation is rendered, stacked in one grid cell, and only the chosen one shows. Two
        * things follow from that: the cell is always as tall as the longest of them, so the card
        * never jumps when a one-line explanation replaces a two-line one; and changing value is a
        * crossfade, the old sentence leaving while the new one arrives, rather than a swap.
        *
        * Hidden from assistive tech, all of them: toggling `aria-hidden` is not reliably announced.
        * The live region beside them carries the chosen sentence instead.
        */}
      <div className="sk-property-playground__explain" aria-hidden="true">
        {values.map((entry) =>
          explain?.[entry] ? (
            <p key={entry} data-active={entry === value ? "" : undefined} dangerouslySetInnerHTML={{ __html: explain[entry]! }} />
          ) : null,
        )}
      </div>
      <p className="sk-visually-hidden" aria-live="polite" dangerouslySetInnerHTML={{ __html: explanation ?? "" }} />
    </div>
  );
}
