import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * A Canvas around one Box: the viewport that clips and takes the gestures, the content layer that
 * gets transformed, and the zoom controls. The two gesture hints only surface on first interaction
 * with a device that needs them, so the page names them in words.
 *
 * The diagram frame is itself a Canvas (Annotated sits on one), which is why every selector here is
 * read inside the subject: the rings land on the specimen's canvas, not on the frame's.
 */
export const canvasAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("canvas.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "canvas",
      signature: "Canvas",
      options: {
        label: t("canvas.demoLabel"),
        zoomInLabel: t("canvas.zoomInLabel"),
        zoomOutLabel: t("canvas.zoomOutLabel"),
        fitLabel: t("canvas.fitLabel"),
      },
      attrs: { style: "inline-size: 22rem; block-size: 12rem;" },
      slots: {
        touchHint: t("canvas.touchHint"),
        wheelHint: t("canvas.wheelHint"),
        children: {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("canvas.nodeDraft"),
        },
      },
    },
    items: [
      namePart(".sk-canvas", "inline-start", { mark: "bracket" }),
      namePart(".sk-canvas__viewport", "block-start", { mark: "bracket" }),
      namePart(".sk-canvas__content", "inline-end"),
      namePart(".sk-canvas__controls", "block-end"),
      namePart(".sk-canvas__control", "inline-end", { match: "first" }),
    ],
  },
});

/*
 * A publishing flow drawn at its own width (30rem, `canvasDiagramCss`), wider than a phone column: the
 * shape a Canvas exists for, a drawing that means something only in its composed geometry.
 */
export const canvasDiagramTree = (t: Translate): UsageTree => ({
  contract: "canvas",
  signature: "Canvas",
  attrs: { style: "--sk-canvas-content-inline-size: 30rem;" },
  options: {
    label: t("canvas.demoLabel"),
    zoomInLabel: t("canvas.zoomInLabel"),
    zoomOutLabel: t("canvas.zoomOutLabel"),
    fitLabel: t("canvas.fitLabel"),
  },
  slots: {
    touchHint: t("canvas.touchHint"),
    wheelHint: t("canvas.wheelHint"),
    children: {
      contract: "diagram",
      signature: "Diagram",
      options: { label: t("canvas.demoLabel") },
      slots: {
        nodes: [
          { options: { node: "draft", shape: "terminal" }, slots: { children: t("canvas.nodeDraft") } },
          { options: { node: "review" }, slots: { children: t("canvas.nodeReview") } },
          { options: { node: "publish" }, slots: { children: t("canvas.nodePublish") } },
          { options: { node: "live", shape: "terminal" }, slots: { children: t("canvas.nodeLive") } },
        ],
        edges: [
          { options: { from: "draft", to: "review" }, slots: {} },
          { options: { from: "review", to: "publish" }, slots: { children: t("canvas.edgeApproved") } },
          { options: { from: "publish", to: "live" }, slots: {} },
        ],
      },
    },
  },
});

export const canvasDiagramCss = `.sk-canvas {
  --sk-canvas-content-inline-size: 30rem;
}`;

/* Usage guide: a linear sequence should reflow as content instead of becoming a zoomable drawing. */
export const canvasDontFitsTree = (t: Translate): UsageTree => ({
  contract: "procedure",
  signature: "Procedure",
  attrs: { "aria-label": t("canvas.demoLabel") },
  children: [
    {
      contract: "procedure",
      signature: "ProcedureStep",
      slots: {
        title: t("canvas.nodeDraft"),
        children: t("canvas.stepDraft"),
      },
    },
    {
      contract: "procedure",
      signature: "ProcedureStep",
      slots: {
        title: t("canvas.nodeReview"),
        children: t("canvas.stepReview"),
      },
    },
    {
      contract: "procedure",
      signature: "ProcedureStep",
      slots: {
        title: t("canvas.nodePublish"),
        children: t("canvas.stepPublish"),
      },
    },
  ],
});
