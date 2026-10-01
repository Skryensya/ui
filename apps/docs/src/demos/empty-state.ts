import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { genericIcon } from "./anatomy-subject";

/* Icon, title, description and the action that resolves the state: EmptyState's four slots. */
export const emptyStateTree = (t: Translate): UsageTree => ({
  contract: "empty-state",
  signature: "EmptyState",
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "folder" } },
    title: t("demo.emptyState.title"),
    description: t("demo.emptyState.description"),
    actions: {
      contract: "button",
      signature: "Button.action",
      children: t("demo.emptyState.action"),
    },
  },
});

/*
 * Every optional part filled, so the diagram can name each one.
 *
 * ITS OWN SUBJECT, and not `emptyStateTree` with the labels drawn on top. The demo above is a real
 * empty state: a magnifier, a search that found nothing, a button that clears the filter, and all
 * three have to agree with each other to be worth showing. The diagram wants the opposite, a subject
 * that says nothing at all, so it composes the same four slots out of `anatomy.*` filler and the
 * generic icon. Sharing one tree meant the two were always trading off against each other.
 */
export const emptyStateAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("emptyState.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "empty-state",
      signature: "EmptyState",
      slots: {
        icon: genericIcon(),
        title: t("anatomy.title"),
        description: t("anatomy.description"),
        actions: {
          contract: "button",
          signature: "Button.action",
          children: t("anatomy.action"),
        },
      },
    },
    items: [
      namePart(".sk-empty-state", "block-start", { mark: "bracket" }),
      namePart(".sk-empty-state__icon", "inline-start"),
      namePart(".sk-empty-state__title", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-empty-state__description", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-empty-state__actions", "block-end", { ringPlacement: "offset", ringDistance: 3 }),
    ],
  },
});

/* Don't: a vague title with no way forward. */
const vagueTree = (t: Translate, icon: "search" | "folder"): UsageTree => ({
  contract: "empty-state",
  signature: "EmptyState",
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: icon } },
    title: t("demo.emptyState.dd.vague"),
  },
});

export const emptyStateDontVagueTree = (t: Translate): UsageTree => vagueTree(t, "search");

/*
 * THE GUIDE PANEL: both halves of a Do/Don't share it, so the only thing that differs between them is
 * the state itself. It fills the specimen frame instead of floating in its centre: the context row
 * (a heading, a search field) is pinned to the top and the state is centred in what is left. A
 * centred stack would put the context at a different height on each side as soon as one state is
 * taller than the other, and the reader would compare positions instead of content.
 */
const guidePanel = (context: UsageTree, body: UsageTree): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  attrs: { style: "align-self: stretch; justify-self: stretch; grid-template-rows: auto 1fr;" },
  children: [context, body],
});

const withoutIcon = (tree: UsageTree) => {
  const { icon: _icon, ...slots } = tree.slots ?? {};
  return slots;
};

/* The state compacted for a 4:3 specimen: no padding of its own, a smaller medallion and title. */
const compact = (emptyState: UsageTree, { icon = true } = {}): UsageTree => ({
  ...emptyState,
  ...(!icon && { slots: withoutIcon(emptyState) }),
  attrs: {
    style:
      "--sk-empty-state-padding: 0; --sk-empty-state-gap: var(--space-stack-xs); --sk-empty-state-icon-size: calc(var(--size-icon-lg) * 1.5); --sk-empty-state-title-size: var(--font-size-heading-h4); --sk-empty-state-max-inline-size: 100%; align-content: center;",
  },
});

const projectsHeading = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: "h4", flush: true },
  children: t("demo.emptyState.projectList"),
});

/** Same empty search in both halves: preserve the query as context, then show recovery or no direction. */
const emptySearchGuide = (t: Translate, emptyState: UsageTree): UsageTree =>
  guidePanel(
    {
      contract: "box",
      signature: "Box",
      options: { border: "subtle", padding: "sm", surface: "surface" },
      children: {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", inlineAlign: "center" },
        children: [
          { contract: "icon", signature: "Icon", options: { name: "search", size: "sm" } },
          { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: t("demo.emptyState.searchTerm") },
        ],
      },
    },
    // The search field above already says "search", so a magnifier in the state only repeats it.
    compact(emptyState, { icon: false }),
  );

export const emptyStateSearchDoGuideTree = (t: Translate): UsageTree =>
  emptySearchGuide(t, emptyStateSearchTree(t));

export const emptyStateSearchDontGuideTree = (t: Translate): UsageTree =>
  emptySearchGuide(t, emptyStateDontVagueTree(t));

/** First-run state: keep the same projects context and show how to create the missing first item. */
const projectListGuide = (t: Translate, emptyState: UsageTree): UsageTree =>
  guidePanel(projectsHeading(t), compact(emptyState));

export const emptyStateFirstDoGuideTree = (t: Translate): UsageTree =>
  projectListGuide(t, emptyStateTree(t));

export const emptyStateFirstDontGuideTree = (t: Translate): UsageTree =>
  projectListGuide(t, vagueTree(t, "folder"));

/** Loading is temporary, so show progress rather than declaring the region empty. */
export const emptyStateLoadingDoTree = (t: Translate): UsageTree =>
  guidePanel(projectsHeading(t), {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm", align: "center" },
    attrs: { style: "align-content: center;" },
    children: [
      { contract: "loader", signature: "Loader", options: { size: "md" } },
      { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: t("demo.emptyState.loadingLabel") },
    ],
  });

export const emptyStateLoadingDontTree = (t: Translate): UsageTree =>
  projectListGuide(t, emptyStateTree(t));

/* A search that found nothing: the filter is what emptied the list, so the action undoes it. */
export const emptyStateSearchTree = (t: Translate): UsageTree => ({
  contract: "empty-state",
  signature: "EmptyState",
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "search" } },
    title: t("demo.emptyState.searchTitle"),
    description: t("demo.emptyState.searchDescription"),
    actions: { contract: "button", signature: "Button.action", options: { variant: "soft" }, children: t("demo.emptyState.searchAction") },
  },
});
