import type { UsageTree } from "@skryensya/core/usage-tree";
/*
 * THE FIGMA REALIZATION: what a Contract cannot say about becoming Figma structure, and nothing it
 * can. Every field below exists because the answer is a Figma decision, not a fact Core declares.
 * It never names an option VALUE, a default, a token or an import: those are read from Core.
 */

export type Realization = {
  /** The contract, by id. */
  contract: string;
  /**
   * What its sets are called, when the contract's name is not it: `typography` draws Text, Heading
   * and Link, each its own component in Figma. Absent, the contract's id.
   */
  id?: string;
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
    /**
     * States set by attributes the signature forwards rather than options it declares, drawn as more
     * values of the same axis: an Input's `aria-invalid="true"`, its `readonly`. `on`: a selector for
     * the element that carries them, when not the host (a TileCheckbox's inner input).
     */
    attributes?: readonly { name: string; attrs: Readonly<Record<string, string>>; on?: string }[];
    /** A state option's value on the axis, when its name reads badly there (`defaultChecked` → `checked`). */
    names?: Readonly<Record<string, string>>;
  };
  /**
   * Collection slots, drawn with these items (a Breadcrumb's trail): each item's options, and the
   * text of its `slot`. Every item's text is a text property of its own, `<collection> <n>`.
   */
  /**
   * Slots filled with other signatures (a DescriptionList's DescriptionItems), drawn as they nest.
   * Every text inside is a text property of its own, `<slot> <n>` by the slot it fills, renamed
   * through `names` by slot (`{ children: "details" }`) or by signature and slot
   * (`{ "Accordion.Trigger.children": "heading" }`).
   */
  content?: { trees: Readonly<Record<string, readonly UsageTree[]>>; names?: Readonly<Record<string, string>> };
  collections?: Readonly<
    Record<
      string,
      {
        slot: string;
        /** The items are markup only, never drawn (a Select's closed list): no text properties. */
        undrawn?: true;
        /** `more`: the item's other text slots (a tab's panel), each a property `<slot> <n>`. */
        items: readonly { options?: Readonly<Record<string, string | boolean>>; text: string; more?: Readonly<Record<string, string>> }[];
      }
    >
  >;
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
  slots: Readonly<
    Record<
      string,
      /** `shown`: an optional icon that starts on (a Callout's), where most start off. */
      | { holds: "icon"; icon: string; shown?: true }
      /** `hidden`: the slot is an accessible name only, clipped out of sight (BackToTop's label). No layer, no property. */
      /**
       * `option`: the text is a string option the template prints (a Meter's label and value), not a
       * slot of the signature. Drawn and exposed the same way.
       */
      | {
          holds: "text";
          sample: string;
          iconWhen?: string;
          icon?: string;
          hidden?: true;
          option?: string;
          /**
           * `placeholder`: the option's text is the field's own `::placeholder` (an Input), drawn in it.
           * `value`: it is the field's value (a NumberField's number), in the field's own look.
           */
          pseudo?: "placeholder" | "value";
          /** Set by the compiler: this text is an item of that collection, not a slot of the signature. */
          item?: string;
          /**
           * The text the binding writes into this selector when it mounts (a Select's chosen value), not
           * a slot of the signature. Drawn and exposed the same way.
           */
          mountedIn?: string;
        }
    >
  >;
  /**
   * Parts of the template that paint an icon of their own, not a slot anyone fills (BackToTop's
   * chevron). Drawn as icon layers where the template places them, showing `icon`.
   */
  parts?: Readonly<Record<string, { holds: "icon"; icon: string }>>;
  /**
   * Draw the component as its markup nests (a frame per part that lays out or paints, texts and icons
   * where they sit) instead of one flat row of slot layers. Callout's icon beside its content column.
   */
  nested?: true;
  /**
   * How wide a component that fills its container (`inline-size: 100%`) is drawn: alone on a page it
   * has nothing to fill. Instances are stretched to their container as usual.
   */
  width?: number;
  /**
   * Option values every cell is drawn with, for options that are not axes: a Progress drawn part
   * full (`value: 60`), since at its default it shows an empty track.
   */
  given?: Readonly<Record<string, string | number | boolean>>;
  /**
   * Inline styles the binding writes when it mounts, by part: a Meter's fill, which its template
   * leaves to the script (`{ track: "--sk-meter-fill: 68%" }`).
   */
  mounted?: Readonly<Record<string, string>>;
  /**
   * Attributes the binding writes when it mounts, by selector: a Segmented's chosen option, which the
   * static markup marks by presence (`aria-checked`) and the script as `aria-checked="true"`.
   */
  marks?: Readonly<Record<string, Readonly<Record<string, string>>>>;
  /**
   * Pseudo-classes held on every cell: a SkipLink is drawn focused, the one state anyone sees it in.
   */
  simulate?: readonly string[];
  /**
   * Texts a slot is shown with beside each row, as instances of the row's own variant: the labels a
   * component really carries (a Kbd's ⌘, Esc, Enter), so the set shows how it holds each, not only
   * its one sample. `title` heads those columns.
   */
  samples?: { slot: string; title: string; values: readonly string[] };
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
    /**
     * The page's own text, by token: what a component inherits for a property its sheets never set
     * (Code and Strong take their colour and size from the prose around them).
     */
    inherit?: Readonly<Partial<Record<"font-family" | "color" | "font-size" | "font-weight" | "line-height", string>>>;
    /** The token a section's outline is drawn in. */
    divider: string;
  };
};
