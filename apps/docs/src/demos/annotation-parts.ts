import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

export type Side = "block-start" | "block-end" | "inline-start" | "inline-end";

type PartExtras = {
  ringPlacement?: "inset" | "offset";
  ringDistance?: number;
  ringRadius?: number;
  match?: "first" | "all";
  mark?: "ring" | "bracket";
};

export type AnnotationPartItem = {
  options: { for: string; side: Side } & PartExtras;
  slots: { children: string };
};

/*
 * One labelled part for an anatomy diagram. The label text IS the class name: that is what the
 * drawing teaches, and translating it would name nothing.
 */
export const namePart = (
  selector: string,
  side: Side,
  extras: PartExtras = {},
): AnnotationPartItem => ({
  options: { for: selector, side, ...extras },
  slots: { children: selector.replace(/^\./, "") },
});

/*
 * THE CANVAS EVERY ANATOMY DIAGRAM SITS ON speaks the page's locale. The contract's defaults are
 * English, so every diagram spreads these into its options (the zoom bar) and its slots (the two
 * gesture hints).
 */
export const anatomyCanvas = (t: Translate) => ({
  zoomInLabel: t("annotation.zoomInLabel"),
  zoomOutLabel: t("annotation.zoomOutLabel"),
  fitLabel: t("annotation.fitLabel"),
});

export const anatomyHints = (t: Translate) => ({
  touchHint: t("annotation.touchHint"),
  wheelHint: t("annotation.wheelHint"),
});

/**
 * An anatomy diagram as a tree: the subject drawn by its own contract, each part named by its class.
 * Takes the same parts as `anatomyFigureHtml`, so a hand-written anatomy whose specimen a tree CAN
 * express moves over by swapping the specimen for its tree and nothing else.
 */
export const anatomyFigureTree = (
  t: Translate,
  opts: { label: string; subject: UsageTree; parts: readonly AnatomyHtmlPart[] },
): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: opts.label, inert: true },
  slots: {
    ...anatomyHints(t),
    subject: opts.subject,
    items: opts.parts.map(({ for: selector, side, name, ...extras }) => ({
      options: { for: selector, side, ...extras },
      slots: { children: name ?? selector.replace(/^\./, "") },
    })),
  },
});

/** One part of a hand-written anatomy: what `namePart` is for a tree. */
export type AnatomyHtmlPart = {
  for: string;
  side: Side;
  /** The legend entry. Defaults to the selector without its dot. */
  name?: string;
  match?: "first" | "all";
  mark?: "ring" | "bracket";
  ringPlacement?: "inset" | "offset";
  ringDistance?: number;
};
