import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { radioGroupItems, tileRadioGroupItems } from "./data/radio-group";
import {
  anatomyCanvas,
  anatomyHints,
  namePart,
  type AnnotationPartItem,
  type Side,
} from "./annotation-parts";

/* Native and tile radio groups share one authored choice model: see `data/radio-group.ts`. */

/*
 * A part in the legend is named by its CLASS, never by the selector that finds it in the specimen: the
 * diagram points at one option of several (`:nth-child`), but what it teaches is "this is `sk-radio`".
 */
const part = (
  selector: string,
  name: string,
  side: Side,
  extras: Partial<AnnotationPartItem["options"]> = {},
): AnnotationPartItem => ({
  options: { for: selector, side, ...extras },
  slots: { children: name },
});

/*
 * THE RADIOGROUP, PART BY PART. Three options with the middle one chosen, so the dot is drawn and can be
 * pointed at. Each part is named on a row of its own (option, control and dot on the second, the label
 * on the third), because the leaders of parts that sit on the same row cross. The real `<input>` is
 * hidden inside each option and is not named here: there is nothing of it to see.
 */
export const radioGroupAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("radioGroupPage.anatomyLabel"),
    inert: true,
  },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "radio-group",
      signature: "RadioGroup",
      options: {
        name: "plan-anatomy",
        value: "pro",
        orientation: "vertical",
        label: t("demo.radioGroup.label"),
      },
      attrs: { style: "inline-size: 14rem;" },
      slots: { items: radioGroupItems },
    },
    items: [
      namePart(".sk-radio-group", "block-start", { mark: "bracket" }),
      part(".sk-radio:nth-child(1)", "sk-radio", "inline-start", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
      part(
        ".sk-radio:nth-child(2) .sk-radio__control",
        "sk-radio__control",
        "inline-start",
        {
          ringPlacement: "offset",
          ringDistance: 2,
        },
      ),
      part(
        ".sk-radio:nth-child(2) .sk-radio__indicator",
        "sk-radio__indicator",
        "inline-start",
      ),
      part(
        ".sk-radio:nth-child(3) .sk-radio__label",
        "sk-radio__label",
        "inline-end",
        {
          ringPlacement: "offset",
          ringDistance: 2,
        },
      ),
    ],
  },
});

/*
 * THE TILE RADIO, PART BY PART. The same exclusive choice with the whole rectangle as the target: the
 * option is a tile, its words are a title and a description, and the selection shows as an indicator in
 * the corner instead of a circle beside a label. Two tiles, the first chosen.
 */
export const tileRadioGroupAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("radioGroupPage.tileAnatomyLabel"),
    inert: true,
  },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "tile",
      signature: "TileRadioGroup",
      options: {
        name: "plan-tile-anatomy",
        defaultValue: "pro",
        orientation: "horizontal",
      },
      attrs: {
        "aria-label": t("demo.radioGroup.label"),
        class: "sk-tile-grid",
        style: "inline-size: 30rem;",
      },
      slots: { items: tileRadioGroupItems(t).slice(0, 2) },
    },
    items: [
      namePart(".sk-tile-grid", "block-start", { mark: "bracket" }),
      part(".sk-tile:nth-child(1)", "sk-tile", "inline-start", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
      part(
        ".sk-tile:nth-child(1) .sk-tile__title",
        "sk-tile__title",
        "inline-start",
        {
          ringPlacement: "offset",
          ringDistance: 2,
        },
      ),
      part(
        ".sk-tile:nth-child(1) .sk-tile__description",
        "sk-tile__description",
        "inline-end",
        {
          ringPlacement: "offset",
          ringDistance: 2,
        },
      ),
      part(
        ".sk-tile:nth-child(2) .sk-tile__selection-indicator",
        "sk-tile__selection-indicator",
        "inline-end",
        { ringPlacement: "offset", ringDistance: 2 },
      ),
    ],
  },
});

/** An exclusive choice between three plans. */
export const radioGroupTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: {
    name: "plan",
    value: "pro",
    orientation: "vertical",
    label: t("demo.radioGroup.label"),
  },
  slots: { items: radioGroupItems },
});

export const tileRadioGroupTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileRadioGroup",
  options: {
    name: "plan-tile",
    defaultValue: "pro",
    orientation: "horizontal",
  },
  /*
   * `class` rides through to the root untouched by the contract (see `attrs`'s own doc). Without
   * it the root is a bare, unstyled `div`: its items are `label`s with no layout declared for
   * their PARENT, so they stack as plain blocks flush against each other. `sk-inline` (flex row)
   * looks like the fix but is not: `.sk-tile--interactive:where(label){inline-size:100%}` makes
   * every item claim the FULL flex line, so a row of them still stacks one per line. `sk-tile-grid`
   * is tile.css's own gutter utility for exactly this. A grid track bounds each item's 100% to its
   * own column instead of the whole row, which is what actually puts them side by side with a gap.
   */
  attrs: { "aria-label": t("demo.radioGroup.label"), class: "sk-tile-grid" },
  slots: { items: tileRadioGroupItems(t) },
});

/*
 * A LIKERT SCALE IS A COMPOSITION, NOT A COMPONENT. There is no `sk-likert`: a scale is this
 * contract's own radio group laid across a Box under the statement it rates, with the two ends named
 * beneath. Four points on purpose, so a reader with an opinion has to lean instead of parking on a
 * middle; three, five or seven work the same way. `likert-scale` (examples/likert.css) only centres each
 * number under its circle.
 */
const likertPoint = (value: string, label: string) => ({
  options: { value },
  slots: { label },
});

const caption = (children: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "caption", tone: "secondary" },
  children,
});

export const radioGroupLikertTree = (t: Translate): UsageTree => ({
  /* A Wrapper, so the scale has a width to spread across: the preview stage sizes a demo to its content. */
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: "sm" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { border: "subtle", padding: "lg", surface: "surface" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { weight: "label" },
              children: t("demo.likert.statement"),
            },
            {
              contract: "radio-group",
              signature: "RadioGroup",
              options: {
                name: "likert-clarity",
                value: "3",
                orientation: "horizontal",
                /* Equal steps, whatever each label weighs: what makes it read as a scale. */
                spread: true,
                label: t("demo.likert.statement"),
              },
              attrs: { class: "likert-scale" },
              slots: {
                items: [
                  likertPoint("1", t("demo.likert.one")),
                  likertPoint("2", t("demo.likert.two")),
                  likertPoint("3", t("demo.likert.three")),
                  likertPoint("4", t("demo.likert.four")),
                ],
              },
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { justify: "between", gap: "md" },
              children: [
                caption(t("demo.likert.min")),
                caption(t("demo.likert.max")),
              ],
            },
          ],
        },
      ],
    },
  ],
});

/*
 * THE MATRIX: SEVERAL QUESTIONS, ONE SCALE. Every row is a question and every column a point, so the
 * scale is named once, in the caption, instead of repeated under every row. Each cell holds a single
 * `Radio` whose `name` is its ROW: radios sharing a name are one group to the browser wherever they sit
 * in the DOM, which is what makes a table of them behave like one question per row. The radio carries no
 * visible label, because the row header and the column header already name it. Two rows are answered, so
 * the page shows what a filled matrix looks like and not only an empty one.
 *
 * Four points, again on purpose: no middle to park on. Any count works, the head just grows.
 */
const matrixPoints = (t: Translate) => [
  { value: "1", label: t("demo.likert.one") },
  { value: "2", label: t("demo.likert.two") },
  { value: "3", label: t("demo.likert.three") },
  { value: "4", label: t("demo.likert.four") },
];

const matrixRow = (
  t: Translate,
  name: string,
  statement: string,
  answer?: string,
): UsageTree => ({
  contract: "table",
  signature: "TableRow",
  children: [
    {
      contract: "table",
      signature: "TableHeader",
      options: { scope: "row" },
      children: statement,
    },
    ...matrixPoints(t).map((point) => ({
      contract: "table",
      signature: "TableCell",
      children: [
        {
          contract: "radio-group",
          signature: "Radio",
          options: {
            name,
            value: point.value,
            ...(answer === point.value ? { radioDefaultChecked: true } : {}),
          },
          /* Named by its row and its column: the statement plus the point, so a screen reader hears
             "Es fácil de usar, 3" instead of a bare radio in a grid of them. */
          attrs: { "aria-label": `${statement}: ${point.label}` },
        },
      ],
    })),
  ],
});

export const radioGroupMatrixTree = (t: Translate): UsageTree => ({
  contract: "table",
  signature: "Table",
  attrs: { class: "likert-matrix" },
  children: [
    {
      contract: "table",
      signature: "TableCaption",
      children: t("radioGroupPage.matrixCaption"),
    },
    {
      contract: "table",
      signature: "TableHead",
      children: [
        {
          contract: "table",
          signature: "TableRow",
          children: [
            {
              contract: "table",
              signature: "TableHeader",
              children: t("radioGroupPage.matrixStatement"),
            },
            ...matrixPoints(t).map((point) => ({
              contract: "table",
              signature: "TableHeader",
              children: point.label,
            })),
          ],
        },
      ],
    },
    {
      contract: "table",
      signature: "TableBody",
      children: [
        matrixRow(t, "matrix-easy", t("demo.matrix.easy"), "3"),
        matrixRow(t, "matrix-fast", t("demo.matrix.fast"), "4"),
        matrixRow(t, "matrix-clear", t("demo.matrix.clear")),
        matrixRow(t, "matrix-recommend", t("demo.matrix.recommend")),
      ],
    },
  ],
});

/* Usage guide: ten countries as radios, a list long enough that it belongs in a Select. The names
   are the same in both locales, so only the label is translated. */
export const radioGroupDontManyTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: {
    name: "country",
    value: "Chile",
    orientation: "vertical",
    label: t("demo.radioGroup.country"),
  },
  slots: {
    items: [
      "Argentina",
      "Bolivia",
      "Chile",
      "Colombia",
      "Ecuador",
      "Guatemala",
      "Honduras",
      "Paraguay",
      "Uruguay",
      "Venezuela",
    ].map((country) => ({
      options: { value: country },
      slots: { label: country },
    })),
  },
});

/*
 * THE SPREAD CARD'S SPECIMEN. `spread` gives each option an equal share of the row, so it only means
 * anything when the group is horizontal AND has a width to share: a Wrapper, like the Likert scale. In a
 * vertical or shrink-wrapped group the option changed nothing and the card showed no difference.
 */
export const radioGroupSpreadTree = (t: Translate): UsageTree => ({
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: "sm" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { border: "subtle", padding: "sm" },
      children: [
        {
          contract: "radio-group",
          signature: "RadioGroup",
          options: {
            name: "plan-spread",
            value: "pro",
            orientation: "horizontal",
            label: t("demo.radioGroup.label"),
          },
          slots: { items: radioGroupItems },
        },
      ],
    },
  ],
});
/** Where `radioGroupSpreadTree` keeps the group, for `UsagePreview`'s `target`. */
export const radioGroupSpreadTarget = ["children", 0, "children", 0] as const;

/** The group a person is choosing from, with one option chosen: what the `disabled` playground varies. */
export const radioGroupDisabledTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: {
    name: "plan-state",
    value: "pro",
    orientation: "vertical",
    label: t("demo.radioGroup.label"),
  },
  slots: { items: radioGroupItems },
});

/** One option that cannot be chosen, in a group that still can: the other half of "unavailable". */
export const radioGroupOptionStateTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: {
    name: "plan-option-state",
    value: "pro",
    orientation: "vertical",
    label: t("demo.radioGroup.label"),
  },
  slots: {
    items: [
      radioGroupItems[0]!,
      radioGroupItems[1]!,
      {
        options: { value: "enterprise", disabled: true },
        slots: { label: "Enterprise" },
      },
    ],
  },
});

/** Don't: labels that are sentences. A radio is read in a glance, and these have to be read one by one. */
export const radioGroupDontLongTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: {
    name: "plan-long",
    value: "b",
    orientation: "vertical",
    label: t("demo.radioGroup.label"),
  },
  slots: {
    items: [
      {
        options: { value: "a" },
        slots: { label: t("demo.radioGroup.long.a") },
      },
      {
        options: { value: "b" },
        slots: { label: t("demo.radioGroup.long.b") },
      },
      {
        options: { value: "c" },
        slots: { label: t("demo.radioGroup.long.c") },
      },
    ],
  },
});
