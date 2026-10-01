import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** The authored upload shell: label, drop target, native input and its explicit trigger. */
/*
 * REAL LIMITS ON THE DEMO, and no `hintLabel`: the line under the instruction is built from these
 * four numbers, so what the page promises and what the control enforces are the same thing. Change
 * `maxFileSize` here and the sentence in the preview changes with it.
 */
export const fileUploadTree = (t: Translate): UsageTree => ({
  contract: "file-upload",
  signature: "FileUpload",
  options: {
    accept: "image/*,.pdf",
    maxFiles: 3,
    maxFileSize: 5_000_000,
    maxTotalSize: 10_000_000,
    multiple: true,
    name: "attachments",
  },
  slots: {
    dropzoneLabel: t("demo.fileUpload.dropzone"),
    label: t("demo.fileUpload.label"),
    triggerLabel: t("demo.fileUpload.trigger"),
  },
});

/*
 * DROPPING ANYWHERE, not only on the dashed box.
 *
 * Live rather than a code block, and the preview frame is not a simplification: the frame IS a
 * document, so `dropScope: "page"` reaches exactly as far as the preview's own edge. Drag a file
 * over it and the overlay appears over the demo, not over the documentation site around it.
 */
export const fileUploadPageDropTree = (t: Translate): UsageTree => ({
  contract: "file-upload",
  signature: "FileUpload",
  options: {
    accept: "image/*,.pdf",
    dropScope: "page",
    maxFileSize: 5_000_000,
    multiple: true,
    name: "attachments",
  },
  slots: {
    label: t("demo.fileUpload.label"),
    dropzoneLabel: t("demo.fileUpload.dropzone"),
    overlayLabel: t("demo.fileUpload.overlay"),
    triggerLabel: t("demo.fileUpload.trigger"),
  },
});

/*
 * Do/Don't specimens: same field and scale, so the comparison is about the limits and their hint,
 * not two differently sized controls. A modest fixed design width lets the fit-only canvas show the
 * whole control without shrinking it to a tiny page-wide example.
 */
const fileUploadLimitsGuide = (tree: UsageTree): UsageTree => ({
  ...tree,
  attrs: {
    style: "inline-size: 24rem; max-inline-size: 100%; --sk-file-upload-dropzone-padding: var(--space-inset-lg);",
  },
});

export const fileUploadDoLimitsTree = (t: Translate): UsageTree =>
  fileUploadLimitsGuide(fileUploadTree(t));

export const fileUploadDontLimitsTree = (t: Translate): UsageTree =>
  fileUploadLimitsGuide({
    ...fileUploadTree(t),
    options: { multiple: true, name: "attachments-unbounded" },
  });

export const fileUploadDoInstructionTree = (t: Translate): UsageTree =>
  fileUploadLimitsGuide(fileUploadTree(t));

export const fileUploadDontInstructionTree = (t: Translate): UsageTree =>
  fileUploadLimitsGuide({
    ...fileUploadTree(t),
    slots: {
      ...fileUploadTree(t).slots,
      dropzoneLabel: t("demo.fileUpload.vagueDropzone"),
    },
  });

export const fileUploadDoTriggerTree = (t: Translate): UsageTree =>
  fileUploadLimitsGuide(fileUploadTree(t));

export const fileUploadDontTriggerTree = (t: Translate): UsageTree =>
  fileUploadLimitsGuide({
    ...fileUploadTree(t),
    slots: {
      ...fileUploadTree(t).slots,
      triggerLabel: t("demo.fileUpload.vagueTrigger"),
    },
  });
