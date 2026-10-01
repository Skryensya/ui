import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * A small project list with the four things a first visit needs pointed out: search, the status
 * filter, "New project" and the way back to the tour itself. Real system components, each given the
 * id a step names; the tour holds no markup of its own for them.
 *
 * The ids are per demo: every preview is its own document (a srcdoc frame per binding), but two demos
 * on one page share nothing, so each picks its own prefix and a selector never finds the wrong one.
 */

const labels = (t: Translate) => ({
  progressLabel: t("tour.progressLabel"),
  nextLabel: t("tour.nextLabel"),
  finishLabel: t("tour.finishLabel"),
  previousLabel: t("tour.previousLabel"),
  skipLabel: t("tour.skipLabel"),
  closeLabel: t("tour.closeLabel"),
});

const toolbar = (t: Translate, prefix: string, tourId: string, withFilters = true): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "end" },
  children: [
    /* The field, label included, is the target: the ring goes around what the step names. */
    {
      contract: "form-field",
      signature: "FormField",
      attrs: { id: `${prefix}-search` },
      slots: {
        label: t("tour.demo.searchLabel"),
        children: {
          contract: "input",
          signature: "Input",
          options: { type: "search", placeholder: t("tour.demo.searchPlaceholder") },
        },
      },
    },
    ...(withFilters
      ? [
          {
            contract: "layout",
            signature: "Stack",
            attrs: { id: `${prefix}-filters` },
            children: [
              {
                contract: "segmented",
                signature: "Segmented",
                options: { value: "active", label: t("tour.demo.filterLabel") },
                slots: {
                  items: [
                    { options: { value: "active" }, slots: { label: t("tour.demo.filterActive") } },
                    { options: { value: "archived" }, slots: { label: t("tour.demo.filterArchived") } },
                  ],
                },
              },
            ],
          } satisfies UsageTree,
        ]
      : []),
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      attrs: { id: `${prefix}-new` },
      children: t("tour.demo.newProject"),
    },
    {
      contract: "tour",
      signature: "Tour.Trigger",
      options: { opens: tourId, triggerLabel: t("tour.demo.start"), restartLabel: t("tour.demo.repeat") },
      attrs: { id: `${prefix}-help` },
    },
  ],
});

/* The four-step tour: one element and one idea per step, in the order a reader's eye meets them. */
export const tourBasicTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    toolbar(t, "tour-basic", "demo-tour-basic"),
    {
      contract: "tour",
      signature: "Tour",
      options: { tourId: "demo-tour-basic", ...labels(t) },
      slots: {
        items: [
          {
            options: { target: "#tour-basic-search" },
            slots: { title: t("tour.demo.step1Title"), description: t("tour.demo.step1Body") },
          },
          {
            options: { target: "#tour-basic-filters" },
            slots: { title: t("tour.demo.step2Title"), description: t("tour.demo.step2Body") },
          },
          {
            options: { target: "#tour-basic-new", placement: "block-end" },
            slots: { title: t("tour.demo.step3Title"), description: t("tour.demo.step3Body") },
          },
          {
            options: { target: "#tour-basic-help", placement: "block-end" },
            slots: { title: t("tour.demo.step4Title"), description: t("tour.demo.step4Body") },
          },
        ],
      },
    },
  ],
});

/*
 * The same tour on a page without the filter. Its step is skipped: the progress counts three, and
 * nothing points at a place where something used to be.
 */
export const tourMissingTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    toolbar(t, "tour-missing", "demo-tour-missing", false),
    {
      contract: "tour",
      signature: "Tour",
      options: { tourId: "demo-tour-missing", ...labels(t), remember: false },
      slots: {
        items: [
          {
            options: { target: "#tour-missing-search" },
            slots: { title: t("tour.demo.step1Title"), description: t("tour.demo.step1Body") },
          },
          {
            options: { target: "#tour-missing-filters" },
            slots: { title: t("tour.demo.step2Title"), description: t("tour.demo.step2Body") },
          },
          {
            options: { target: "#tour-missing-new" },
            slots: { title: t("tour.demo.step3Title"), description: t("tour.demo.step3Body") },
          },
          {
            options: { target: "#tour-missing-help" },
            slots: { title: t("tour.demo.step4Title"), description: t("tour.demo.step4Body") },
          },
        ],
      },
    },
  ],
});

/* The trigger needs its restart label shown by the tour's sheet; the input needs a width to be a search. */
export const tourDemoCss = `[id$="-search"] {
  inline-size: min(16rem, 100%);
}`;
