/*
 * PROTOTYPE: one tree, one option, one live control. Not the isolated-iframe machinery `tree.tsx`
 * wraps `renderTree` in (`framed()`) - that exists so a preview's own styles never leak into the
 * parent document, which is the wrong trade for a widget whose whole point IS to react instantly to
 * a click. This mounts straight into the parent document, same realm as the page around it.
 */
import { useEffect, useState } from "react";
import { SegmentedControl } from "@skryensya/react/segmented";
import type { UsageTree } from "@skryensya/core/usage-tree";

export interface PropertyPlaygroundProps {
  tree: UsageTree;
  optionName: string;
  values: readonly string[];
  defaultValue: string;
  controlLabel: string;
}

export function PropertyPlayground({
  tree,
  optionName,
  values,
  defaultValue,
  controlLabel,
}: PropertyPlaygroundProps) {
  const [value, setValue] = useState(defaultValue);
  const [Render, setRender] = useState<
    ((tree: UsageTree, key?: string | number) => import("react").ReactNode) | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    void import("@skryensya/react/render-tree").then(async (mod) => {
      await mod.loadTree(tree);
      if (!cancelled) setRender(() => mod.renderTree);
    });
    return () => {
      cancelled = true;
    };
    // The tree's SHAPE (contract/signature/families) is fixed for this widget's lifetime; only
    // `optionName`'s value changes, and that never touches which bindings need loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveTree: UsageTree = { ...tree, options: { ...tree.options, [optionName]: value } };

  return (
    <div className="sk-property-playground">
      <div className="sk-property-playground__stage">
        {Render ? Render(liveTree) : null}
      </div>
      <div className="sk-property-playground__control">
        <span className="sk-property-playground__control-label">{optionName}</span>
        <SegmentedControl
          label={controlLabel}
          value={value}
          onValueChange={setValue}
          options={values.map((v) => ({ value: v, label: v }))}
        />
      </div>
    </div>
  );
}
