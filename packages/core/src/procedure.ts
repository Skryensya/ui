import type { ComponentContract } from "./contract.js";

/*
 * PROCEDURE, a static ordered sequence of instructions with rich step content.
 *
 * Order is the only state: the native `<ol>` carries the sequence while the visual marker and
 * connector make it scannable. Procedure never models progress; complete / current / upcoming
 * belong to Steps.
 */
export const procedureParts = {
  root: "sk-procedure",
  step: "sk-procedure__step",
  content: "sk-procedure__content",
  title: "sk-procedure__title",
} as const;

export type ProcedurePart = keyof typeof procedureParts;
export type ProcedurePartClass = (typeof procedureParts)[ProcedurePart];

/*
 * A numbered set of instructions. The numbers come from `<ol>` and express ORDER, never progress:
 * there is no complete, current or upcoming here, and that absence is the whole difference from
 * Steps. A procedure whose steps had status would be a Steps with the content in the wrong place.
 */
export const procedureContract = {
  id: "procedure",
  category: "content",
  css: "@skryensya/core/components/procedure.css",
  parts: procedureParts,
  hooks: [
    "--sk-procedure-connector-color",
    "--sk-procedure-connector-size",
    "--sk-procedure-content-gap",
    "--sk-procedure-fg",
    "--sk-procedure-step-gap",
    "--sk-procedure-step-padding-x",
    "--sk-procedure-step-padding-y",
    "--sk-procedure-marker-bg",
    "--sk-procedure-marker-border-color",
    "--sk-procedure-marker-fg",
    "--sk-procedure-marker-ring-color",
    "--sk-procedure-marker-size",
    "--sk-procedure-title-fg",
    "--sk-procedure-title-font-size",
    "--sk-procedure-title-font-weight",
  ],
  options: {},

  signatures: {
    Procedure: {
      intent: ["instructions", "how-to", "ordered-steps-to-follow"],
      host: { element: "ol" },
      options: [],
      slots: { children: { accepts: "signature", required: true, of: ["ProcedureStep"] } },
      /* `role="list"`: `list-style: none` (procedure.css) drops the implicit list role in
       * Safari/VoiceOver. */
      template: { element: "ol", part: "root", host: true, attrs: { role: "list" }, slot: "children" },
      react: { from: "@skryensya/react/procedure", name: "Procedure" },
    },

    ProcedureStep: {
      intent: ["one-instruction", "one-step-of-a-how-to"],
      host: { element: "li" },
      options: [],
      parents: ["Procedure"],
      slots: {
        title: { accepts: "text", required: true },
        children: { accepts: "node" },
      },
      template: {
        element: "li",
        part: "step",
        host: true,
        children: [
          {
            element: "div",
            part: "content",
            children: [
              { element: "span", part: "title", slot: "title" },
              { slot: "children" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/procedure", name: "ProcedureStep" },
    },
  },
} as const satisfies ComponentContract;
