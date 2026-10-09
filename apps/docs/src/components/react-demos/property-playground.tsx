/*
 * One tree, one option, one live control: `UsagePreview`'s controlled mode. The tree is drawn by
 * `useRenderedTree`, the same as fixed previews, so the two modes differ only in the
 * control and the sentence under the example.
 *
 * The switcher is the kit's own SegmentedControl at `size="lg"`: here the control is the thing being
 * read, not one more control beside a small button, which is exactly what that size is for.
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@skryensya/react/button";
import { SegmentedControl } from "@skryensya/react/segmented";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { useRenderedTree } from "./use-rendered-tree";
import { TreeDemo } from "./tree";
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
  /**
   * Draw the example in an isolated frame of a fixed screen width, shrunk to fit the card, instead of in the page.
   * For an example that only reads at a width the docs column never has (a layout with a rail). `note` is the
   * sentence that says so, with `{width}` and `{scale}` standing for the screen's width and how far it is shrunk.
   */
  frame?: { screen: "xl"; width: number; flush?: boolean; css?: string; note: string };
}

export function PropertyPlayground({ tree, optionName, trees, toggleLabel, target = [], values, boolean, onValue, defaultValue, labels, controlLabel, explain, remountOnChange = true, frame }: PropertyPlaygroundProps) {
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
  /* A frame that arrives after the page's own stage pass (every variant but the first) is not found by it, so it is started here:
     the doc the frame was built with becomes its `srcdoc`, and the frame's own runtime sizes it. */
  useEffect(() => {
    if (!frame) return;
    for (const stage of stageRef.current?.querySelectorAll<HTMLIFrameElement>("iframe[data-sk-component-preview-doc]") ?? []) {
      if (!stage.srcdoc) stage.srcdoc = stage.getAttribute("data-sk-component-preview-doc") ?? "";
    }
  }, [frame, value, hydrated]);
  /* How far the screen is shrunk to fit this card: the same ratio the preview shell applies as `zoom` (`syncXlZoom`). */
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const shell = stageRef.current?.closest<HTMLElement>("[data-sk-component-preview]");
    if (!frame || !shell) return;
    const measure = () => {
      const next = Math.min(1, shell.clientWidth / frame.width);
      /* The shell's own enhancer sizes this for cards it finds at load; this one hydrates later, so it says so itself. */
      shell.style.setProperty("--sk-component-preview-xl-zoom", String(next));
      setScale(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [frame]);

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
      <div ref={stageRef} className="sk-preview-card__stage" onSubmitCapture={(event) => event.preventDefault()} key={remountOnChange ? value : "stable"} data-with-toggle={toggleLabel ? "" : undefined}
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
        {frame ? (
          /* The shell around the card (`UsagePreview`) is what the enhancer zooms; this is the fixed screen inside it. */
          hydrated && <TreeDemo key={value} tree={liveTree} frameOptions={{ screen: frame.screen, flush: frame.flush, css: frame.css }} />
        ) : render ? (
          render(liveTree)
        ) : null}
      </div>
      {frame && (
        <p className="sk-property-playground__scale-note">
          {frame.note.replace("{width}", String(frame.width)).replace("{scale}", String(Math.round(scale * 100)))}
        </p>
      )}
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
