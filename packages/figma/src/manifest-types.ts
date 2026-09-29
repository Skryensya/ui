/*
 * THE FIGMA MANIFEST, as types. Shared by the compiler that writes it and the plugin that reads it,
 * so this file imports nothing: the plugin bundles it without dragging the compiler in.
 *
 * It describes REPRESENTATION INTENT (this frame's fill is bound to that variable), never Plugin API
 * steps. How a frame gets created or updated is the plugin's business; what it should end up as is
 * this.
 */

export const SCHEMA_VERSION = 1;

export type Mode = "light" | "dark";
export const MODES: readonly Mode[] = ["light", "dark"];

export type Rgba = { r: number; g: number; b: number; a: number };

/** A value Figma can hold directly, or a reference to another variable by its id. */
export type VariableValue =
  | { kind: "literal"; value: number | string | Rgba }
  | { kind: "alias"; variable: string };

/**
 * How the value was obtained. `alias` and `literal` are the token as authored; `evaluated` is a
 * formula computed under the manifest's evaluation context, and carries the formula.
 */
export type ValueSource = "alias" | "literal" | "evaluated";

export type CollectionId = "primitives" | "semantic" | "component";

export type Collection = { id: CollectionId; name: string; modes: readonly Mode[] };

export type Variable = {
  /** The CSS custom property it stands for, or the hook plus its cell discriminator for a derived one. */
  id: string;
  /** Figma's slash-separated name. */
  name: string;
  collection: CollectionId;
  type: "COLOR" | "FLOAT" | "STRING";
  values: Record<Mode, VariableValue>;
  source: Record<Mode, ValueSource>;
  /** The authored CSS it came from, for the description and the report. */
  expression: string;
  /** What a developer writes: `var(--color-action-neutral)`. */
  codeSyntax: string;
};

/** A field either bound to a variable or set to a value that has no variable (with its formula). */
export type Bound<T> = { variable: string } | { value: T; expression: string };

export type Paint =
  | { type: "SOLID"; color: Bound<Rgba> }
  | {
      type: "GRADIENT_LINEAR";
      /** CSS angle: 180 is `to bottom`. */
      angle: number;
      stops: { position: number; color: Rgba }[];
      expression: string;
    };

export type Effect =
  | {
      type: "DROP_SHADOW" | "INNER_SHADOW";
      x: Bound<number>;
      y: Bound<number>;
      blur: Bound<number>;
      spread: Bound<number>;
      color: Bound<Rgba>;
    }
  | { type: "BACKGROUND_BLUR"; radius: Bound<number> };

/** An auto-layout frame's geometry. */
export type Box = {
  direction: "HORIZONTAL" | "VERTICAL";
  mainAlign: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  crossAlign: "MIN" | "CENTER" | "MAX";
  /** Fixed when bound; hugging its content otherwise. */
  width?: Bound<number>;
  height?: Bound<number>;
  minHeight?: Bound<number>;
  /** `min-inline-size`: a Kbd's floor, so a one-glyph key stays square. */
  minWidth?: Bound<number>;
  /** Inside its parent's auto layout: `flex-grow` fills the main axis, `align-self: stretch` the cross one. */
  grow?: true;
  stretch?: true;
  padding: { top: Bound<number>; right: Bound<number>; bottom: Bound<number>; left: Bound<number> };
  gap?: Bound<number>;
  radius?: Bound<number>;
  /** Corners that differ (a tab rounded on top only), in place of `radius`. */
  corners?: { topLeft: Bound<number>; topRight: Bound<number>; bottomRight: Bound<number>; bottomLeft: Bound<number> };
  strokeWeight?: Bound<number>;
  /** A border on some sides only: each side's weight, 0 where it draws none (a Separator's rule). */
  strokeSides?: { top: Bound<number>; right: Bound<number>; bottom: Bound<number>; left: Bound<number> };
  clipsContent: boolean;
};

/** What is drawn on and around the frame. */
export type Surface = {
  strokes: Paint[];
  fills: Paint[];
  effects: Effect[];
};

/** An auto-layout frame, described by what it looks like. */
export type Frame = Box & Surface;

export type Text = {
  fontFamily: Bound<string>;
  fontWeight: Bound<number>;
  fontSize: Bound<number>;
  /** Percent of the font size; CSS `line-height: 1` is 100. `auto` is CSS `normal`: the font's own. */
  lineHeight: number | "auto";
  fill: Paint;
  /** `text-decoration-line: underline` (a Link's permanent affordance). Absent, none. */
  underline?: true;
  /** `text-align` other than start: an EmptyState's centred lines. */
  align?: "CENTER" | "RIGHT" | "JUSTIFIED";
};

/** A square slot that holds an instance of the icon component. */
export type IconSlot = { size: Bound<number>; color: Paint };

/**
 * One layer inside a cell, in order. `property` names the component property that drives it. An
 * icon layer is an exposed instance of the Icon set, so its `name` is picked from the host's panel.
 */
export type Layer =
  | { kind: "icon"; slot: string; visibleProperty?: string; default: string; icon: IconSlot }
  /**
   * `visibleProperty`: an optional text slot's boolean (Stat's change), shown by default. `fill`: it
   * spans its parent and wraps (a Quote's quotation), instead of running on one line.
   */
  | { kind: "text"; slot: string; textProperty: string; visibleProperty?: string; fill?: true; characters?: string; text: Text }
  /** A pseudo-element with paint (the state layer): covers the host, under its content, same corners. */
  | { kind: "overlay"; slot: string; fills: Paint[] }
  /** An outline: a stroke `width` wide drawn `offset` outside the host, following its corners. */
  | { kind: "ring"; slot: string; width: Bound<number>; offset: Bound<number>; radius: Bound<number>; color: Paint }
  /**
   * A part of the component that lays out or paints on its own (Callout's content column, a
   * separator's rule): a frame with its own box and surface, by id in `styles`, holding its layers.
   */
  | { kind: "frame"; slot: string; box: string; surface: string; layers: Layer[] }
  /**
   * A bar along one edge of its frame, outside auto layout (a tab's indicator): `size` thick, the full
   * length of that edge, `offset` from it outward as CSS's negative inset puts it.
   */
  | { kind: "edge"; slot: string; side: "top" | "right" | "bottom" | "left"; size: Bound<number>; offset: Bound<number>; fills: Paint[] };

export type ComponentProperty =
  | { name: string; type: "TEXT"; default: string }
  | { name: string; type: "BOOLEAN"; default: boolean };

/**
 * One Figma variant. Its geometry, surface and layers are shared by many cells, so they live once
 * in the manifest's `styles` and a cell points at them by content hash.
 */
export type Cell = {
  /**
   * The cell's identity: `<set id>/<axis>=<value>,…` with the axes in alphabetical order, so it does
   * not move when the grid is regrouped, the axes are reordered or the variant's name is spelled
   * differently. The plugin finds the Figma component by this id and updates it in place; it is also
   * what a script or an agent uses to address one variant from outside.
   */
  id: string;
  /** `variant=soft, tone=danger, …`: Figma's own variant name, what a designer reads in the panel. */
  key: string;
  props: Record<string, string>;
  box: string;
  surface: string;
  layers: string;
  hash: string;
};

export type Styles = {
  boxes: Record<string, Box>;
  surfaces: Record<string, Surface>;
  layers: Record<string, Layer[]>;
};

export type Page = { id: string; name: string };

/** What every drawing stands on, and how its labels are set. */
export type Stage = {
  background: Bound<Rgba>;
  label: { color: Bound<Rgba>; fontFamily: Bound<string>; fontSize: Bound<number>; fontWeight: Bound<number> };
  divider: Bound<Rgba>;
};

export type ComponentSet = {
  kind: "component-set";
  id: string;
  name: string;
  page: string;
  axes: { name: string; values: string[] }[];
  /**
   * Which axes run across the grid and which run down it, outermost first, each with its values in
   * drawing order. The outermost row axis draws as sections.
   */
  grid: { columns: { name: string; values: string[] }[]; rows: { name: string; values: string[] }[] };
  /** The cell every default lands on: the set's first child, which Figma offers first. */
  defaultCell: string;
  /**
   * Prototype reactions: from each cell at rest to its sibling in `state`, on `trigger`. What makes
   * hovering a Button in presentation show its state layer.
   */
  interactions: { axis: string; from: string; to: string; trigger: "ON_HOVER" | "ON_PRESS" }[];
  /**
   * Instances drawn beside each row: the row's button at `base` with one optional slot switched
   * on. A slot's icon is a component property, not a Figma variant, so only an instance shows it.
   */
  showcase: {
    base: Record<string, string>;
    /** The heading over the columns; absent, they switch icons on ("with icon"). */
    title?: string;
    /**
     * One instance per column: `properties` set on it (an icon slot switched on, or a text slot given
     * a sample). `slot` keys the instance; `label` heads the column, absent `<slot>: on`.
     */
    columns: { slot: string; label?: string; properties: Record<string, boolean | string> }[];
  };
  properties: ComponentProperty[];
  cells: Cell[];
  contractHash: string;
  visualHash: string;
};

/**
 * The Icon contract as a component set: one Figma variant per stable icon name, each drawn by the
 * chosen icon set. The geometry is the set's; the colour is the host's (`currentColor`), so a host
 * overrides the paint of the one flattened `glyph` layer every variant shares.
 */
export type IconSet = {
  kind: "icon-set";
  id: string;
  name: string;
  page: string;
  /** The contract option the variants run along. */
  axis: string;
  /** The icon set that draws them, by package. */
  source: string;
  /** The name a slot shows until a designer picks one. */
  default: string;
  /** Whether the set draws with strokes (an outline set) or fills (a solid one). */
  paint: "stroke" | "fill";
  /** The drawing's own stroke width in viewBox units, so a host can keep it proportional. */
  strokeWidth: number;
  /** The viewBox width, the size a variant is drawn at. */
  size: number;
  /** `id` is `<set id>/<name>`: how the plugin, and anything outside it, finds one icon's component. */
  icons: { id: string; name: string; svg: string; hash: string }[];
  hash: string;
};

export type Diagnostic = {
  severity: "info" | "warning";
  code: string;
  subject: string;
  message: string;
};

export type FigmaManifest = {
  schemaVersion: number;
  sourceHash: string;
  evaluationContext: Record<string, string>;
  collections: Collection[];
  variables: Variable[];
  pages: Page[];
  stage: Stage;
  components: (IconSet | ComponentSet)[];
  styles: Styles;
  diagnostics: Diagnostic[];
  report: Record<string, unknown>;
};
