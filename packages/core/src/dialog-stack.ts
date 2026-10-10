import type { ComponentContract, OptionsOf } from "./contract.js";

/** One native modal dialog, with ordered panels that leave their surfaces behind as navigation advances. */
export const dialogStackParts = {
  root: "sk-dialog-stack",
  trigger: "sk-dialog-stack__trigger",
  overlay: "sk-dialog-stack__overlay",
  body: "sk-dialog-stack__body",
  content: "sk-dialog-stack__content",
  header: "sk-dialog-stack__header",
  title: "sk-dialog-stack__title",
  description: "sk-dialog-stack__description",
  footer: "sk-dialog-stack__footer",
  next: "sk-dialog-stack__next",
  previous: "sk-dialog-stack__previous",
  close: "sk-dialog-stack__close",
} as const;

export const dialogStackContract = {
  id: "dialog-stack",
  category: "overlays",
  css: "@skryensya/core/components/dialog-stack.css",
  parts: dialogStackParts,
  hooks: ["--sk-dialog-stack-gap", "--sk-dialog-stack-inline-size", "--sk-dialog-stack-bg", "--sk-dialog-stack-border-color", "--sk-dialog-stack-radius", "--sk-dialog-stack-padding", "--sk-dialog-stack-elevation", "--sk-dialog-stack-backdrop-bg"],
  options: {
    defaultOpen: { type: "boolean", default: false, attr: "data-default-open", trueValue: "", machineInput: true },
  },
  signatures: {
    DialogStack: {
      intent: ["dialog-stack", "multi-step-dialog", "onboarding-dialog"],
      host: { element: "div" },
      options: ["defaultOpen"],
      notInside: ["DialogStack"],
      descendants: [{ of: ["DialogStackBody"], min: 1, because: "One native dialog owns modality for the stack." }],
      slots: { children: { accepts: "signature", of: ["DialogStackTrigger", "DialogStackOverlay", "DialogStackBody"], required: true } },
      template: { element: "div", part: "root", host: true, attrs: { "data-sk-dialog-stack": "" }, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStack" },
    },
    DialogStackTrigger: {
      intent: ["open-dialog-stack"], host: { element: "button" }, options: [],
      compose: [{ of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true }],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "button", part: "trigger", also: ["sk-button", "sk-interactive"], host: true, attrs: { type: "button" }, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackTrigger" },
    },
    DialogStackOverlay: {
      intent: ["dialog-stack-backdrop"], host: { element: "span" }, options: [], slots: {},
      template: { element: "span", part: "overlay", host: true, attrs: { hidden: "", "aria-hidden": "true" } },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackOverlay" },
    },
    DialogStackBody: {
      intent: ["dialog-stack-panels"], host: { element: "dialog" }, options: [],
      parents: ["DialogStack"],
      descendants: [{ of: ["DialogStackContent"], min: 1, because: "A stack needs at least one step to open." }],
      slots: { children: { accepts: "signature", of: ["DialogStackContent"], required: true } },
      template: { element: "dialog", part: "body", host: true, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackBody" },
    },
    DialogStackContent: {
      intent: ["dialog-stack-step"], host: { element: "section" }, options: [],
      parents: ["DialogStackBody"],
      descendants: [{ of: ["DialogStackTitle"], min: 1, because: "The active step supplies the dialog's accessible name." }],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "section", part: "content", host: true, attrs: { tabindex: "-1" }, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackContent" },
    },
    DialogStackHeader: {
      intent: ["dialog-stack-heading-group"], host: { element: "header" }, options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "header", part: "header", host: true, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackHeader" },
    },
    DialogStackTitle: {
      intent: ["dialog-stack-step-title"], host: { element: "h2" }, options: [],
      slots: { children: { accepts: "text", required: true } },
      template: { element: "h2", part: "title", host: true, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackTitle" },
    },
    DialogStackDescription: {
      intent: ["dialog-stack-step-description"], host: { element: "p" }, options: [],
      slots: { children: { accepts: "text", required: true } },
      template: { element: "p", part: "description", host: true, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackDescription" },
    },
    DialogStackFooter: {
      intent: ["dialog-stack-actions"], host: { element: "footer" }, options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "footer", part: "footer", host: true, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackFooter" },
    },
    DialogStackNext: {
      intent: ["dialog-stack-next-step"], host: { element: "button" }, options: [],
      compose: [{ of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true }],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "button", part: "next", also: ["sk-button", "sk-interactive"], host: true, attrs: { type: "button" }, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackNext" },
    },
    DialogStackPrevious: {
      intent: ["dialog-stack-previous-step"], host: { element: "button" }, options: [],
      compose: [{ of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true }],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "button", part: "previous", also: ["sk-button", "sk-interactive"], host: true, attrs: { type: "button" }, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackPrevious" },
    },
    DialogStackClose: {
      intent: ["close-dialog-stack"], host: { element: "button" }, options: [],
      compose: [{ of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true }],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "button", part: "close", also: ["sk-button", "sk-interactive"], host: true, attrs: { type: "button" }, slot: "children" },
      react: { from: "@skryensya/react/dialog-stack", name: "DialogStackClose" },
    },
  },
} as const satisfies ComponentContract;

export type DialogStackOptions = OptionsOf<typeof dialogStackContract>;
