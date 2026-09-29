/*
 * THE FIGMA REALIZATION: what a Contract cannot say about becoming Figma structure, and nothing it
 * can. Every field below exists because the answer is a Figma decision, not a fact Core declares.
 * It never names an option VALUE, a default, a token or an import: those are read from Core.
 */

export type Realization = {
  /** The contract, by id. */
  contract: string;
  /**
   * The one signature drawn. Figma draws no host element, so signatures that differ only in their
   * host (a `<button>` and an `<a>` with the same paint) are one drawing.
   */
  signature: string;
  /**
   * The enum option whose values become separate component sets rather than a Figma variant. Absent
   * when the signature has none to split on (BadgeDot has no appearance): then it is one set, named
   * after the signature.
   */
  splitBy?: string;
  /**
   * Boolean options folded into ONE Figma variant, because they are states of the same control and
   * a designer picks one: `rest` is none of them. Combinations are not drawn.
   */
  state: {
    axis: string;
    rest: string;
    options: readonly string[];
    /**
     * Interaction states drawn as more values of the same axis: a CSS pseudo-class the cascade
     * simulates, and the prototype trigger (if any) that shows it from rest.
     */
    interactions: readonly { name: string; pseudo: string; trigger?: "ON_HOVER" | "ON_PRESS" }[];
  };
  /** Layer names for pseudo-elements that paint: `before` is the state layer, not "::before". */
  overlays: Readonly<Partial<Record<"before" | "after", string>>>;
  /** The layer name an outline is drawn as. */
  ring: string;
  /** Options left out of this realization on purpose, with the reason next to the list. */
  exclude: readonly string[];
  /**
   * What each slot holds in Figma. The contract says a slot accepts "node"; which node a designer
   * places there is the realization's choice. `iconWhen` names the boolean option under which the
   * slot holds an icon instead of text. `icon` is the stable name the slot shows by default, so a
   * designer who switches a slot on sees a glyph that fits that side, not a stand-in.
   */
  slots: Readonly<Record<string, { holds: "icon"; icon: string } | { holds: "text"; sample: string; iconWhen?: string; icon?: string }>>;
  /**
   * The icon set that draws the Icon contract in Figma, as a module and export. A set is a brand the
   * consumer picks (decision 15), so Figma draws with the one the docs draw with.
   */
  icons: { module: string; export: string };
  /**
   * Which axes run across the component set's grid and which run down it, outermost first. A row
   * is one button; the columns are what it looks like in each state. The outermost row axis draws
   * as sections. `descending` names the axes drawn in reverse contract order (largest size first).
   */
  grid: { columns: readonly string[]; rows: readonly string[]; descending: readonly string[] };
  /**
   * What the drawing stands on. The background is a contract's styling hook (the docs preview's
   * own), resolved through the cascade like any other; the labels name the tokens they read.
   */
  stage: {
    contract: string;
    hook: string;
    label: { color: string; fontFamily: string; fontSize: string; fontWeight: string };
    /** The token a section's outline is drawn in. */
    divider: string;
  };
};
