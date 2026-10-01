import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * Root plus handle: Vaul's own parts. Children stay free-form composition (no `sk-vaul__content`),
 * so the specimen only needs enough body for the panel to read as a panel. `open` paints it
 * non-modally; anatomy CSS puts the fixed edge panel back in flow so Annotated can measure it.
 */
export const vaulAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("vaulPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "vaul",
      signature: "Vaul",
      options: {
        edge: "block-end",
        open: true,
        label: t("vaulPage.anatomyPanelLabel"),
      },
      children: [
        {
          contract: "typography",
          signature: "Heading",
          options: { headingSize: "h4", flush: true },
          children: t("vaulPage.anatomyTitle"),
        },
        {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("vaulPage.anatomyBodyText"),
        },
      ],
    },
    items: [
      namePart(".sk-vaul", "block-start", { mark: "bracket" }),
      namePart(".sk-vaul__handle", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * Fixed edge panel → static box. Also keep the handle visible past the desktop breakpoint that
 * normally hides it: this drawing is about the handle, and a diagram that omits the part it names
 * is worse than a diagram that forces it on for the specimen.
 */
export const vaulAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-vaul {
  position: static;
  inset: auto;
  translate: none;
  inline-size: min(100%, 20rem);
  block-size: auto;
  max-block-size: none;
  border-radius: var(--radius-surface);
  border: var(--sk-vaul-border-width, 1px) solid var(--sk-vaul-border-color, var(--color-border-subtle));
  padding: var(--space-inset-md);
  display: grid;
  gap: var(--space-stack-sm);
  box-shadow: var(--elevation-modal);
}

.sk-annotated__subject > .sk-vaul > .sk-vaul__handle {
  display: grid;
}
`;

/*
 * THE THREE SHEETS the page opens on a phone-sized stage: each one a `Vaul.Trigger` that opens its
 * panel and a panel whose buttons close it, all from the contract. Opening and closing is the
 * component's own wiring (`opens` names the panel, `Vaul.Close` dismisses it), so no app state is
 * needed to drive them.
 */
const vaulText = (text: string, tone?: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: tone ? { tone } : {},
  children: text,
});

const vaulTitle = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: "h4", flush: true },
  children: text,
});

const vaulTrigger = (panelId: string, label: string): UsageTree => ({
  contract: "vaul",
  signature: "Vaul.Trigger",
  options: { opens: panelId },
  children: label,
});

const vaulClose = (label: string, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "vaul",
  signature: "Vaul.Close",
  options,
  children: label,
});

const vaulIconClose = (label: string): UsageTree => ({
  contract: "vaul",
  signature: "Vaul.Close",
  options: { buttonVariant: "ghost", buttonIconOnly: true, buttonLabel: label },
  children: { contract: "icon", signature: "Icon", options: { name: "close" } },
});

const vaulActions = (children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", justify: "end" },
  children,
});

const vaulSheet = (panelId: string, trigger: string, label: string, children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "start" },
  children: [
    vaulTrigger(panelId, trigger),
    {
      contract: "vaul",
      signature: "Vaul",
      options: { panelId, edge: "block-end", label },
      children: [{ contract: "layout", signature: "Stack", options: { gap: "lg" }, children }],
    },
  ],
});

/** Share a document: who has access, and the two ways out. */
export const vaulShareTree = (t: Translate): UsageTree => {
  const people: [string, string, string, string][] = [
    ["AK", "Ada Kovač", "ada@estudio.cl", t("vaulPage.demoOwner")],
    ["RM", "Renzo Molina", "renzo@estudio.cl", t("vaulPage.demoCanEdit")],
    ["NS", "Nadia Sepúlveda", "nadia@estudio.cl", t("vaulPage.demoCanComment")],
    ["+6", t("vaulPage.demoDesignTeam"), t("vaulPage.demoDesignTeamMeta"), t("vaulPage.demoReadOnly")],
  ];
  return vaulSheet("vaul-share", t("vaulPage.demoOpenLabel"), t("vaulPage.demoTitle"), [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", justify: "between", inlineAlign: "start", wrap: false },
      children: [
        { contract: "layout", signature: "Stack", options: { gap: "xs" }, children: [vaulTitle(t("vaulPage.demoTitle")), vaulText(t("vaulPage.demoMeta"), "secondary")] },
        vaulIconClose(t("vaulPage.demoClose")),
      ],
    },
    {
      contract: "switch",
      signature: "Switch",
      options: { name: "share-link", defaultChecked: true },
      children: t("vaulPage.demoShareToggle"),
    },
    {
      contract: "list",
      signature: "List",
      attrs: { "aria-label": t("vaulPage.demoPeopleLabel") },
      children: people.map(([initials, name, email, access]) => ({
        contract: "list",
        signature: "ListItem",
        slots: {
          leading: { contract: "avatar", signature: "Avatar.initials", options: { size: "sm", name }, children: initials },
          title: name,
          description: email,
          trailing: access,
        },
      })),
    },
    vaulActions([vaulClose(t("vaulPage.demoCancel"), { buttonVariant: "ghost" }), vaulClose(t("vaulPage.demoShare"))]),
  ]);
};

/** A destructive confirmation: the sheet as a phone's own action sheet. */
export const vaulDeleteTree = (t: Translate): UsageTree =>
  vaulSheet("vaul-delete", t("vaulPage.deleteOpenLabel"), t("vaulPage.deleteTitle"), [
    { contract: "layout", signature: "Stack", options: { gap: "xs" }, children: [vaulTitle(t("vaulPage.deleteTitle")), vaulText(t("vaulPage.deleteDesc"), "secondary")] },
    vaulActions([vaulClose(t("vaulPage.deleteCancel"), { buttonVariant: "ghost" }), vaulClose(t("vaulPage.deleteConfirm"), { buttonTone: "danger" })]),
  ]);

/** Filters: one exclusive sort and two sets of checkboxes, then clear or apply. */
export const vaulFiltersTree = (t: Translate): UsageTree => {
  const item = (value: string, label: string, defaultChecked = false) => ({
    options: { value, ...(defaultChecked ? { defaultChecked: true } : {}) },
    slots: { label },
  });
  return vaulSheet("vaul-filters", t("vaulPage.filtersOpenLabel"), t("vaulPage.filtersTitle"), [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", justify: "between", inlineAlign: "center", wrap: false },
      children: [vaulTitle(t("vaulPage.filtersTitle")), vaulIconClose(t("vaulPage.demoClose"))],
    },
    {
      contract: "radio-group",
      signature: "RadioGroup",
      options: { name: "sort", value: "relevance", orientation: "vertical", label: t("vaulPage.filtersSortLabel") },
      slots: {
        items: [
          { options: { value: "relevance" }, slots: { label: t("vaulPage.filtersSortRelevance") } },
          { options: { value: "price-asc" }, slots: { label: t("vaulPage.filtersSortPriceAsc") } },
          { options: { value: "price-desc" }, slots: { label: t("vaulPage.filtersSortPriceDesc") } },
          { options: { value: "recent" }, slots: { label: t("vaulPage.filtersSortRecent") } },
        ],
      },
    },
    {
      contract: "checkbox",
      signature: "CheckboxGroup",
      options: { name: "category" },
      slots: {
        label: t("vaulPage.filtersCategoryLabel"),
        items: [
          item("design", t("vaulPage.filtersCategoryDesign"), true),
          item("dev", t("vaulPage.filtersCategoryDev"), true),
          item("research", t("vaulPage.filtersCategoryResearch")),
          item("strategy", t("vaulPage.filtersCategoryStrategy")),
          item("content", t("vaulPage.filtersCategoryContent")),
          item("illustration", t("vaulPage.filtersCategoryIllustration")),
        ],
      },
    },
    {
      contract: "checkbox",
      signature: "CheckboxGroup",
      options: { name: "availability" },
      slots: {
        label: t("vaulPage.filtersAvailabilityLabel"),
        items: [item("stock", t("vaulPage.filtersAvailabilityStock")), item("shipping", t("vaulPage.filtersAvailabilityShipping"))],
      },
    },
    vaulActions([vaulClose(t("vaulPage.filtersClear"), { buttonVariant: "ghost" }), vaulClose(t("vaulPage.filtersApply"))]),
  ]);
};
