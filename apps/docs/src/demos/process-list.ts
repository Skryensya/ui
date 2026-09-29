import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";


/** Ordered list, step, content and title: two steps without nested chrome. */
export const processListAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("processListPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "process-list",
      signature: "ProcessList",
      attrs: { "aria-label": t("demo.processList.label") },
      children: [
        {
          contract: "process-list",
          signature: "ProcessListItem",
          slots: {
            title: t("demo.processList.install.title"),
            children: {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.processList.install.body"),
            },
          },
        },
        {
          contract: "process-list",
          signature: "ProcessListItem",
          slots: {
            title: t("demo.processList.import.title"),
            children: {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.processList.import.body"),
            },
          },
        },
      ],
    },
    items: [
      namePart(".sk-process-list", "block-start", { mark: "bracket" }),
      namePart(".sk-process-list__item", "inline-start"),
      namePart(".sk-process-list__content", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-process-list__title", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * The three steps of installing the library, as instructions rather than as prose.
 *
 * A tree was written for this page once and deleted, because one step embeds a CODE BLOCK and
 * `code-preview` had no contract then: emitting the list would have dropped it. It has one now, so
 * the whole demo composes: an ordered list of steps, each with a title and a body that can hold
 * anything the system publishes.
 *
 * The third step ends with a Badge and a Link side by side, which is the point of the example: a
 * step is not a paragraph, it is a place where the outcome of the step can be shown.
 */
export const processListTree = (t: Translate): UsageTree => ({
  contract: "process-list",
  signature: "ProcessList",
  attrs: { "aria-label": t("demo.processList.label") },
  children: [
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.install.title"),
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.processList.install.body"),
            },
            {
              contract: "code-preview",
              signature: "CodePreview",
              slots: {
                label: "terminal",
                children: "pnpm add @skryensya/core @skryensya/react",
              },
            },
          ],
        },
      },
    },
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.import.title"),
        children: {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("demo.processList.import.body"),
        },
      },
    },
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.render.title"),
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.processList.render.body"),
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm" },
              children: [
                {
                  contract: "badge",
                  signature: "Badge",
                  options: { tone: "success" },
                  children: t("demo.processList.done"),
                },
                {
                  contract: "typography",
                  signature: "Link",
                  options: { href: "/components/process-list" },
                  children: t("demo.processList.docs"),
                },
              ],
            },
          ],
        },
      },
    },
  ],
});

const processItem = (title: string, body: string): UsageTree => ({
  contract: "process-list",
  signature: "ProcessListItem",
  slots: { title, children: { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: body } },
});

/* Do: an order the reader follows, short titles. */
export const processListDoShortTree = (t: Translate): UsageTree => ({
  contract: "process-list",
  signature: "ProcessList",
  attrs: { "aria-label": t("demo.processList.label") },
  children: [
    processItem(t("demo.processList.install.title"), t("demo.processList.install.body")),
    processItem(t("demo.processList.import.title"), t("demo.processList.import.body")),
    processItem(t("demo.processList.render.title"), t("demo.processList.render.body")),
  ],
});

/* Don't: features with no order, numbered as if there were one. */
export const processListDontUnorderedTree = (t: Translate): UsageTree => ({
  contract: "process-list",
  signature: "ProcessList",
  attrs: { "aria-label": t("demo.processList.label") },
  children: [
    processItem(t("demo.processList.dd.fast"), t("demo.processList.dd.fastBody")),
    processItem(t("demo.processList.dd.accessible"), t("demo.processList.dd.accessibleBody")),
    processItem(t("demo.processList.dd.themable"), t("demo.processList.dd.themableBody")),
  ],
});

/* Don't: the whole instruction in the title. */
export const processListDontLongTree = (t: Translate): UsageTree => ({
  contract: "process-list",
  signature: "ProcessList",
  attrs: { "aria-label": t("demo.processList.label") },
  children: [
    processItem(t("demo.processList.dd.longTitle"), t("demo.processList.install.body")),
    processItem(t("demo.processList.import.title"), t("demo.processList.import.body")),
  ],
});
