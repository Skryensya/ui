import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";


/** Track and fill: the two painted parts of a determinate Progress. */
export const progressAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("progressPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    /* A fixed measure on a Stack around the bar: the canvas shrink-wraps its subject, and a Progress
       takes its width from its parent, so on its own it collapsed to a dot. */
    subject: {
      contract: "layout",
      signature: "Stack",
      attrs: { style: "inline-size: 24rem; max-inline-size: 100%" },
      children: { contract: "progress", signature: "Progress", options: { value: 68, label: t("demo.progress.upload") } },
    },
    items: [
      namePart(".sk-progress", "block-start", { mark: "bracket", ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-progress__bar", "block-end", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});

/*
 * A TASK ROW: what a person reads is the name of the task and where it is, on one line, with the bar
 * under it. The bar alone only says "some amount"; the row says what and how much, in words.
 */
const taskRow = (label: string, valueText: string, bar: { value: number; max?: number; tone?: string }): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { justify: "between", gap: "sm" },
      children: [
        { contract: "typography", signature: "Text", options: { size: "sm" }, children: label },
        { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: valueText },
      ],
    },
    { contract: "progress", signature: "Progress", options: { ...bar, label } },
  ],
});

/* A fixed measure: the stage's flex row would otherwise shrink a Stack of bars to nothing. */
const column = (rem: number, children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: `inline-size: ${rem}rem; max-inline-size: 100%` },
  children,
});

/** Three tasks: running, done and stopped, each saying in words what the bar says in colour. */
export const progressTree = (t: Translate): UsageTree =>
  column(24, [
    taskRow(t("demo.progress.running"), "68%", { value: 68 }),
    taskRow(t("demo.progress.done"), t("demo.progress.doneValue"), { value: 100, tone: "success" }),
    taskRow(t("demo.progress.failed"), t("demo.progress.failedValue"), { value: 40, tone: "danger" }),
  ]);

/** A different maximum: five steps, three done. The bar fills by value over max, not over 100. */
export const progressStepsTree = (t: Translate): UsageTree =>
  column(24, [taskRow(t("demo.progress.steps"), t("demo.progress.stepsValue"), { value: 3, max: 5 })]);

/* The value card: the same task at four points of its run. */
const at = (t: Translate, value: number): UsageTree =>
  column(24, [taskRow(t("demo.progress.running"), `${value}%`, { value })]);
export const progressEmptyTree = (t: Translate): UsageTree => at(t, 0);
export const progressQuarterTree = (t: Translate): UsageTree => at(t, 25);
export const progressMostTree = (t: Translate): UsageTree => at(t, 68);
export const progressFullTree = (t: Translate): UsageTree => at(t, 100);

/* One bar, the specimen the `tone` preview varies. */
export const progressSingleTree = (t: Translate): UsageTree => ({
  contract: "progress",
  signature: "Progress",
  options: { value: 68, label: t("demo.progress.upload") },
  attrs: { style: "inline-size: min(100%, 20rem)" },
});

/* Do/Don't: a task still running, in the neutral accent, or already painted as done. */
export const progressDoRunningTree = (t: Translate): UsageTree => ({
  contract: "progress",
  signature: "Progress",
  options: { value: 30, label: t("demo.progress.upload") },
  attrs: { style: "inline-size: min(100%, 16rem)" },
});

export const progressDontRunningTree = (t: Translate): UsageTree => ({
  contract: "progress",
  signature: "Progress",
  options: { value: 30, tone: "success", label: t("demo.progress.upload") },
  attrs: { style: "inline-size: min(100%, 16rem)" },
});

/* Don't: a measurement (a battery) drawn as a task. */
export const progressDontMeasureTree = (t: Translate): UsageTree => ({
  contract: "progress",
  signature: "Progress",
  options: { value: 68, label: t("demo.progress.dd.battery") },
  attrs: { style: "inline-size: min(100%, 16rem)" },
});

export const progressDoTaskTree = (t: Translate): UsageTree => ({
  contract: "progress",
  signature: "Progress",
  options: { value: 68, label: t("demo.progress.upload") },
  attrs: { style: "inline-size: min(100%, 16rem)" },
});

/* Do: the bar with its task and its value in words. */
export const progressDoValueTree = (t: Translate): UsageTree =>
  column(15, [taskRow(t("demo.progress.running"), "68%", { value: 68 })]);

/* Don't: the bare bar, which says some amount of something. */
export const progressDontBareTree = (t: Translate): UsageTree => ({
  contract: "progress",
  signature: "Progress",
  options: { value: 68, label: t("demo.progress.running") },
  attrs: { style: "inline-size: 15rem; max-inline-size: 100%" },
});

/*
 * THE SEGMENTED PROGRESS: the same journey as `progressStepsTree`, drawn as one bar per step instead of
 * one bar for all of them. It is Steps in its segments look (what Questionnaire uses for its own
 * progress), so every step keeps its name and its place, and where you are reads as a count of bars.
 */
export const progressSegmentsTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  options: { appearance: "segments" },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%" },
  slots: {
    items: (["account", "profile", "team", "plan", "done"] as const).map((step, index) => ({
      options: { status: index < 2 ? "complete" : index === 2 ? "current" : "upcoming" },
      slots: { marker: String(index + 1), label: t(`demo.progress.seg.${step}` as Parameters<Translate>[0]) },
    })),
  },
});

/* The two drawings of "three steps out of five", for the card that sets them side by side. */
export const progressAsBarTree = (t: Translate): UsageTree => progressStepsTree(t);
export const progressAsSegmentsTree = (t: Translate): UsageTree => progressSegmentsTree(t);
