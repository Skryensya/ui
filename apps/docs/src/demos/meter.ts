import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * A Meter takes its width from its parent: its `attrs` land on the TRACK only (the label row would
 * stay full width above a short bar), so a measure is set on a Stack around it, never on the Meter.
 * The wrapper also gives a shrink-wrapped canvas something definite to fill.
 */
const sized = (rem: number, child: UsageTree): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { style: `inline-size: ${rem}rem; max-inline-size: 100%` },
  children: child,
});

/*
 * Header, label, value text, track and bar: one measurement named at rest. The live stack of three
 * tones starts below.
 */
export const meterAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("meterPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: sized(24, {
      contract: "meter",
      signature: "Meter",
      options: {
        value: 68,
        label: t("demo.meter.battery"),
        valueText: t("demo.meter.batteryText"),
      },
    }),
    items: [
      namePart(".sk-meter-group", "block-start", { mark: "bracket" }),
      namePart(".sk-meter-group__header", "inline-start"),
      namePart(".sk-meter-group__label", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-meter-group__value", "inline-end"),
      namePart(".sk-meter", "block-end"),
      namePart(".sk-meter__bar", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * Three measurements, one per tone: a rating (non-zero `min`, unlike Progress), disk usage, and
 * battery level. None of them is a task's completion. That's what tells them apart from `Progress`.
 */
export const meterTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%" },
  children: [
    {
      contract: "meter",
      signature: "Meter",
      options: {
        value: 4,
        min: 1,
        max: 5,
        tone: "success",
        label: t("demo.meter.rating"),
        valueText: t("demo.meter.ratingText"),
      },
    },
    {
      contract: "meter",
      signature: "Meter",
      options: {
        value: -5,
        min: -20,
        max: 40,
        label: t("demo.meter.temperature"),
        valueText: t("demo.meter.temperatureText"),
      },
    },
    {
      contract: "meter",
      signature: "Meter",
      options: {
        value: 92,
        tone: "danger",
        label: t("demo.meter.disk"),
        valueText: t("demo.meter.diskText"),
      },
    },
  ],
});

/* One meter, the specimen the `tone` preview varies. */
export const meterSingleTree = (t: Translate): UsageTree => ({
  contract: "meter",
  signature: "Meter",
  options: { value: 68, label: t("demo.meter.battery"), valueText: t("demo.meter.batteryText") },
});

/* Do/Don't: the tone agrees with what the value means, or contradicts it. */
export const meterDoToneTree = (t: Translate): UsageTree => sized(18, {
  contract: "meter",
  signature: "Meter",
  options: { value: 92, tone: "danger", label: t("demo.meter.disk"), valueText: t("demo.meter.diskText") },
});

export const meterDontToneTree = (t: Translate): UsageTree => sized(18, {
  contract: "meter",
  signature: "Meter",
  options: { value: 92, tone: "success", label: t("demo.meter.disk"), valueText: t("demo.meter.diskText") },
});

/* Don't: a task's progress drawn as a measurement. */
export const meterDontTaskTree = (t: Translate): UsageTree => sized(18, {
  contract: "meter",
  signature: "Meter",
  options: { value: 40, label: t("demo.meter.dd.upload"), valueText: "40%" },
});

/* The measure pair's Do: the single meter at the width a pair uses. */
export const meterDoMeasureTree = (t: Translate): UsageTree => sized(18, meterSingleTree(t));
