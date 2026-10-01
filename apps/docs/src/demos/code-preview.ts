import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureTree } from "./annotation-parts";

/*
 * THE ANATOMY SPECIMEN: density switch AND expand toggle in one drawing. `CodePreview.density` with
 * `collapsible` draws both, so every part the diagram names comes from the contract itself.
 */
export const codePreviewAnatomyTree = (t: Translate): UsageTree => anatomyFigureTree(t, {
  label: t("codePreview.anatomyLabel"),
  subject: {
    contract: "code-preview",
    signature: "CodePreview.density",
    options: { collapsible: true, lines: 12, previewLines: 3, moreLabel: t("code.expand"), lessLabel: t("kit.collapse") },
    slots: {
      label: t("demo.codePreview.label"),
      condensed: t("demo.codePreview.condensed"),
      full: t("demo.codePreview.full"),
      condensedLabel: t("code.condensed"),
      fullLabel: t("code.full"),
    },
  },
  parts: [
    { for: ".sk-code-preview", side: "block-start", mark: "bracket", ringPlacement: "offset", ringDistance: 8 },
    { for: ".sk-code-preview__label", side: "inline-start" },
    { for: ".sk-code-preview__meta", side: "inline-start", ringPlacement: "offset", ringDistance: 4 },
    { for: ".sk-code-preview__density", side: "inline-end" },
    { for: ".sk-code-preview__preview", side: "inline-start" },
    { for: ".sk-code-preview__viewport", side: "inline-end", ringPlacement: "offset", ringDistance: 3 },
    { for: ".sk-code-preview__toggle", side: "block-end" },
  ],
});

export const codePreviewAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-code-preview {
  inline-size: min(100%, 28rem);
  text-align: start;
}

.sk-annotated__subject {
  text-align: center;
}`;

/** A short snippet the page can show live when a UsageTree stage is needed. */
export const codePreviewTree = (t: Translate): UsageTree => ({
  contract: "code-preview",
  signature: "CodePreview",
  options: { collapsible: true, lines: 6, previewLines: 3, moreLabel: t("kit.expand"), lessLabel: t("kit.collapse") },
  slots: {
    label: t("demo.codePreview.label"),
    note: t("demo.codePreview.note"),
    children: t("demo.codePreview.full"),
  },
});

/* Usage guide: the same block labelled with a word that says nothing about what it is. */
export const codePreviewDontLabelTree = (t: Translate): UsageTree => ({
  ...codePreviewTree(t),
  slots: { label: t("demo.codePreview.genericLabel"), children: t("demo.codePreview.full") },
});
