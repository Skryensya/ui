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
  /** The enum option whose values become separate component sets rather than a Figma variant. */
  splitBy: string;
  /**
   * Boolean options folded into ONE Figma variant, because they are states of the same control and
   * a designer picks one: `rest` is none of them. Combinations are not drawn.
   */
  state: { axis: string; rest: string; options: readonly string[] };
  /** Options left out of this realization on purpose, with the reason next to the list. */
  exclude: readonly string[];
  /**
   * What each slot holds in Figma. The contract says a slot accepts "node"; which node a designer
   * places there is the realization's choice. `iconWhen` names the boolean option under which the
   * slot holds an icon instead of text.
   */
  slots: Readonly<Record<string, { holds: "icon" } | { holds: "text"; sample: string; iconWhen?: string }>>;
  /** Which axes run across the component set's grid and which run down it. */
  grid: { columns: readonly string[]; rows: readonly string[] };
  /** The docs previews mirrored on the specimen page, by export name, for the side-by-side check. */
  specimen: { module: string; exports: readonly string[] };
};
