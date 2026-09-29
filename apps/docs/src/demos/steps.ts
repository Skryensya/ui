import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { stepsItems, stepsVerticalItems } from "./data/steps";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/** Root, item, marker, label and description: one complete stage named at rest. */
export const stepsAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("stepsPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "steps",
      signature: "Steps",
      slots: { items: stepsItems(t).slice(0, 3) },
    },
    items: [
      namePart(".sk-steps", "block-start", { mark: "bracket" }),
      namePart(".sk-steps__item", "inline-start"),
      namePart(".sk-steps__marker", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-steps__label", "inline-end"),
      namePart(".sk-steps__description", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** Four stages with one current position and an icon as the non-colour completion cue. */
export const stepsTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  slots: { items: stepsItems(t) },
});

/** The same status model pinned to a vertical checkout rail. */
export const stepsVerticalTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  options: { orientation: "vertical" },
  slots: { items: stepsVerticalItems(t) },
});

/* Don't: a flow cut into so many stages that none of them reads. */
export const stepsDontManyTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  slots: {
    items: Array.from({ length: 8 }, (_, i) => ({
      options: { status: i < 3 ? "complete" : i === 3 ? "current" : "upcoming" },
      slots: { marker: String(i + 1), label: `${t("demo.steps.dd.step")} ${i + 1}` },
    })),
  },
});

/* Don't: a finished stage told apart from the rest by colour alone, its number kept. */
export const stepsDontColorTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  slots: {
    items: stepsItems(t).map((item, i) => (i === 0 ? { ...item, slots: { ...item.slots, marker: "1" } } : item)),
  },
});
