import type { UsageTree } from "@skryensya/core/usage-tree";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import type { Translate } from "../i18n";

/*
 * Role names and sizes are the same in every language, so these are constants: a `t` argument
 * would only be a parameter nobody uses.
 */

/** Five roles at large size: the vocabulary, not the drawings. */
export const iconSingleTree: UsageTree = {
  contract: "icon",
  signature: "Icon",
  options: { name: "check" },
};

const iconCard = (name: string, label: string, body: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm", align: "start" },
    children: [
      { contract: "icon", signature: "Icon", options: { name, size: "lg" } },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          { contract: "typography", signature: "Code", children: name },
          { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: body || label },
        ],
      },
    ],
  },
});

export const iconTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", responsive: true },
  attrs: { style: "inline-size: 38rem; max-inline-size: 100%;" },
  children: [
    iconCard("search", t("demo.icon.role.search"), t("demo.icon.role.searchBody")),
    iconCard("settings", t("demo.icon.role.settings"), t("demo.icon.role.settingsBody")),
    iconCard("warning", t("demo.icon.role.warning"), t("demo.icon.role.warningBody")),
    iconCard("success", t("demo.icon.role.success"), t("demo.icon.role.successBody")),
    iconCard("download", t("demo.icon.role.download"), t("demo.icon.role.downloadBody")),
    iconCard("chevron-down", t("demo.icon.role.chevron"), t("demo.icon.role.chevronBody")),
  ],
});

/** The three named sizes of one hook. */
export const iconSizeTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
    { contract: "icon", signature: "Icon", options: { name: "check" } },
    { contract: "icon", signature: "Icon", options: { name: "check", size: "lg" } },
  ],
};

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { textElement: "span", ...options },
  children,
});

const iconInline = (children: readonly UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  attrs: { style: "inline-size: 18rem; max-inline-size: 100%;" },
  children: {
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", inlineAlign: "center" },
    children,
  },
});

const iconExampleStack = (children: readonly UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  attrs: { style: "inline-size: 28rem; max-inline-size: 100%;" },
  children,
});

export const iconSizesExampleTree = (t: Translate): UsageTree =>
  iconExampleStack([
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "info", size: "sm" } },
      text(t("demo.icon.sizeSmall"), { size: "sm", tone: "secondary" }),
    ]),
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "info" } },
      text(t("demo.icon.sizeBody")),
    ]),
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "info", size: "lg" } },
      text(t("demo.icon.sizeStandalone"), { weight: "emphasis" }),
    ]),
  ]);

export const iconStatusExampleTree = (t: Translate): UsageTree =>
  iconExampleStack([
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "success" }, attrs: { style: "color: var(--color-text-success)" } },
      { ...text(t("demo.icon.statusSuccess"), { weight: "emphasis" }), attrs: { style: "color: var(--color-text-success)" } },
    ]),
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "warning" }, attrs: { style: "color: var(--color-text-warning)" } },
      { ...text(t("demo.icon.statusWarning"), { weight: "emphasis" }), attrs: { style: "color: var(--color-text-warning)" } },
    ]),
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "danger" }, attrs: { style: "color: var(--color-text-danger)" } },
      text(t("demo.icon.statusDanger"), { tone: "danger", weight: "emphasis" }),
    ]),
  ]);

export const iconDirectionExampleTree = (t: Translate): UsageTree =>
  iconExampleStack([
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "chevron-down" } },
      text(t("demo.icon.chevronMeaning")),
    ]),
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "arrow-right" } },
      text(t("demo.icon.arrowMeaning")),
    ]),
    iconInline([
      { contract: "icon", signature: "Icon", options: { name: "external-link" } },
      text(t("demo.icon.externalMeaning")),
    ]),
  ]);

export const iconDoTextTree = (t: Translate): UsageTree =>
  iconInline([
    { contract: "icon", signature: "Icon", options: { name: "download" } },
    text(t("demo.icon.download")),
  ]);

export const iconDontTextTree: UsageTree =
  iconInline([{ contract: "icon", signature: "Icon", options: { name: "download", size: "lg" } }]);

export const iconDoSizeTree = (t: Translate): UsageTree =>
  iconInline([
    { contract: "icon", signature: "Icon", options: { name: "info" } },
    text(t("demo.icon.helper")),
  ]);

export const iconDontSizeTree = (t: Translate): UsageTree =>
  iconInline([
    { contract: "icon", signature: "Icon", options: { name: "info", size: "lg" } },
    text(t("demo.icon.helper")),
  ]);

export const iconDoStatusTree = (t: Translate): UsageTree =>
  iconInline([
    {
      contract: "icon",
      signature: "Icon",
      options: { name: "warning" },
      attrs: { style: "color: var(--color-text-danger)" },
    },
    text(t("demo.icon.warning"), { tone: "danger", weight: "emphasis" }),
  ]);

export const iconDontStatusTree: UsageTree =
  iconInline([{ contract: "icon", signature: "Icon", options: { name: "warning", size: "lg" } }]);

export const iconDoToneTree = (t: Translate): UsageTree =>
  iconInline([
    { contract: "icon", signature: "Icon", options: { name: "success" } },
    text(t("demo.icon.success")),
  ]);

export const iconDontToneTree = (t: Translate): UsageTree =>
  iconInline([
    {
      contract: "icon",
      signature: "Icon",
      options: { name: "success" },
      attrs: { style: "color: var(--color-text-danger)" },
    },
    text(t("demo.icon.success"), { tone: "danger" }),
  ]);

/*
 * One part per glyph. What is authored is `<span data-sk-icon>`; what gets drawn here, and ringed, is
 * the `<svg class="sk-icon">` it becomes once the icon enhancer mounts.
 */
export const iconAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("iconPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md" },
      children: [
        { contract: "icon", signature: "Icon", options: { name: "search", size: "lg" } },
        { contract: "icon", signature: "Icon", options: { name: "settings", size: "lg" } },
        { contract: "icon", signature: "Icon", options: { name: "check", size: "lg" } },
      ],
    },
    items: [
      namePart(".sk-icon", "block-start", { match: "all", ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});
