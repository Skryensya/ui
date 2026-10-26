import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { segmentedItems } from "./data/segmented";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";


/** Root, sliding indicator and options: the segmented control at rest. */
export const segmentedAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("segmentedPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "segmented",
      signature: "Segmented",
      options: { value: "day", label: t("demo.segmented.label") },
      slots: { items: segmentedItems(t) },
    },
    items: [
      namePart(".sk-segmented", "block-start", { mark: "bracket" }),
      namePart(".sk-segmented__indicator", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-segmented__option", "inline-end"),
    ],
  },
});

/** Three ranges, the first selected. */
export const segmentedTree = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "day", label: t("demo.segmented.label") },
  slots: { items: segmentedItems(t) },
});

/* Don't: so many options that the rail runs out of room, where a Select holds them in one line. */
export const segmentedDontManyTree = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "mon", label: t("demo.segmented.label") },
  slots: {
    items: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => ({
      options: { value: day },
      slots: { label: t(`demo.segmented.dd.${day}` as never) },
    })),
  },
});

/* An icon beside each word: the label is a node, so it can be an Icon followed by the text. */
export const segmentedIconsTree = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "system", label: t("segmentedPage.icons.label"), iconPosition: "inline" },
  slots: {
    items: (["system", "light", "dark"] as const).map((mode) => ({
      options: { value: mode },
      slots: {
        label: [{ contract: "icon", signature: "Icon", options: { name: `mode-${mode}`, size: "sm" } }, t(`segmentedPage.icons.${mode}` as never)],
      },
    })),
  },
});
