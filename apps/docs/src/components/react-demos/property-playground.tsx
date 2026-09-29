/*
 * One tree, one option, one live control: `UsagePreview`'s controlled mode. The tree is drawn by
 * `useRenderedTree`, the same as fixed previews, so the two modes differ only in the
 * control and the sentence under the example.
 *
 * The switcher is the kit's own SegmentedControl at `size="lg"`: here the control is the thing being
 * read, not one more control beside a small button, which is exactly what that size is for.
 */
import { useEffect, useState } from "react";
import { SegmentedControl } from "@skryensya/react/segmented";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { useRenderedTree } from "./use-rendered-tree";

export interface PropertyPlaygroundProps {
  tree: UsageTree;
  optionName: string;
  /** The option's values as strings; a boolean option arrives as `["false", "true"]`. */
  values: readonly string[];
  /** Whether the option is a boolean, so the chosen string goes into the tree as `true`/`false`. */
  boolean?: boolean;
  defaultValue: string;
  /** What each value is called on its segment. */
  labels: Record<string, string>;
  controlLabel: string;
  /** What each value is for, shown under the example for the one that is chosen. Trusted HTML. */
  explain?: Partial<Record<string, string>>;
}

export function PropertyPlayground({ tree, optionName, values, boolean, defaultValue, labels, controlLabel, explain }: PropertyPlaygroundProps) {
  const [value, setValue] = useState(defaultValue);
  const render = useRenderedTree(tree);
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

  const liveTree: UsageTree = { ...tree, options: { ...tree.options, [optionName]: boolean ? value === "true" : value } };
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
      <div className="sk-preview-card__stage">{render ? render(liveTree) : null}</div>
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
