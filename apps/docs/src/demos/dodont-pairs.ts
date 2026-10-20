import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { splitButtonTree } from "./split-button";
import { tileRadioGroupItems } from "./data/radio-group";

type UIKey = Parameters<Translate>[0];

/*
 * DO / DON'T PAIRS for the component pages that taught their rules in prose only.
 *
 * One pair per rule the page already states: the "do" is the rule followed, the "don't" is the same specimen with the
 * one thing the rule is about changed, so the difference on screen is the lesson and nothing else. They are stills
 * (the DoDont frame is inert), so a rule about motion or focus order cannot be one: those pages say why in prose.
 */

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  children,
});

/* ───────────── Toast ───────────── */

/* The region is `position: fixed` to a screen corner; in a frame it is laid in flow at the width a region gives it. */
const toastInFlow = "position: static; inset: auto; translate: none; inline-size: 24rem;";

const button = (children: string, options: Record<string, string> = {}): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { size: "sm", ...options },
  children,
});

/** One line with the result, one action with a verb. */
export const toastDoTree = (t: Translate): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  attrs: { "data-stack": "off", style: toastInFlow },
  children: {
    contract: "content",
    signature: "Toast",
    options: { dismissible: true, dismissLabel: t("demo.toast.dismiss") },
    slots: { actions: button(t("demo.toast.undo"), { variant: "solid" }) },
    children: t("demo.toast.dd.short"),
  },
});

/** A sentence that restates the obvious, and three actions competing for one tap. */
export const toastDontTree = (t: Translate): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  attrs: { "data-stack": "off", style: toastInFlow },
  children: {
    contract: "content",
    signature: "Toast",
    options: { dismissible: true, dismissLabel: t("demo.toast.dismiss") },
    slots: {
      actions: [
        button(t("demo.toast.dd.view"), { variant: "solid" }),
        button(t("demo.toast.dd.share"), { variant: "ghost" }),
        button(t("demo.toast.undo"), { variant: "ghost" }),
      ],
    },
    children: t("demo.toast.dd.long"),
  },
});

/* ───────────── SplitButton ───────────── */

/** The primary half names what a click does. */
export const splitButtonDoTree = (t: Translate): UsageTree => splitButtonTree(t);

/** "Actions" tells nobody what the main half does, which is the point of having a main half. */
export const splitButtonDontTree = (t: Translate): UsageTree => {
  const tree = splitButtonTree(t);
  const slots = tree.slots as Record<string, UsageTree>;
  return {
    ...tree,
    slots: { ...slots, action: { ...slots.action!, slots: { children: t("demo.splitButton.dd.vague") } } },
  };
};

/* ───────────── StateButton ───────────── */

const stateButton = (id: string, label: string, current: string, faces: readonly (readonly [string, string])[]): UsageTree => ({
  contract: "state-button",
  signature: "StateButton",
  options: { current },
  attrs: { id, "aria-label": label, "data-variant": "ghost", "data-size": "sm" },
  slots: { faces: faces.map(([name, icon]) => ({ options: { name, icon }, slots: {} })) },
});

const row = (...children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "center" },
  children,
});

const THEME_FACES = [["light", "mode-light"], ["dark", "mode-dark"], ["system", "mode-system"]] as const;
const SAME_FACES = [["light", "menu"], ["dark", "menu"], ["system", "menu"]] as const;

/** The three faces of one control, each stopped on its own state: they read apart without any label. */
export const stateButtonDoTree = (t: Translate): UsageTree =>
  row(...THEME_FACES.map(([name], i) => stateButton(`dd-state-do-${i}`, t("demo.state-button.themeToggle.title"), name, THEME_FACES)));

/** The same control with one icon for every state: only its accessible name changes, so the eye learns nothing. */
export const stateButtonDontTree = (t: Translate): UsageTree =>
  row(...SAME_FACES.map(([name], i) => stateButton(`dd-state-dont-${i}`, t("demo.state-button.themeToggle.title"), name, SAME_FACES)));

/* ───────────── Tile ───────────── */

const tile = (title: UIKey, description: UIKey, t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileLink",
  options: { href: "#" },
  children: { contract: "tile", signature: "TileContent", slots: { title: t(title), description: t(description) } },
});

/** Title says where it leads, description says what helps decide: price, limit. */
export const tileDoTree = (t: Translate): UsageTree => tile("demo.tile.dd.doTitle", "demo.tile.dd.doBody", t);

/** A title that could belong to any tile and a description that adds nothing to decide with. */
export const tileDontTree = (t: Translate): UsageTree => tile("demo.tile.dd.dontTitle", "demo.tile.dd.dontBody", t);

/* ───────────── SkipLink ───────────── */

/*
 * A skip link is invisible until it takes focus, so a still of one has to show it focused. The inline style is the
 * component's own focus rule (`a.sk-skip-link:focus`) written out, which is what `skipLinkAnatomyCss` does for the
 * anatomy too: out of the clip, back to its natural box.
 */
const skipRevealed =
  "position: static; inline-size: auto; block-size: auto; overflow: visible; clip-path: none; padding: var(--sk-skip-link-padding-block) var(--sk-skip-link-padding-inline); border: 1px solid var(--sk-skip-link-border-color); box-shadow: var(--sk-skip-link-shadow);";

const skipLink = (label: string): UsageTree => ({
  contract: "skip-link",
  signature: "SkipLink",
  options: { href: "#main-content" },
  attrs: { style: skipRevealed },
  children: label,
});

/** Named by where it goes. */
export const skipLinkDoTree = (t: Translate): UsageTree => skipLink(t("skipLink.demoContentLabel"));

/** Named by nothing: "Skip" what, to where? */
export const skipLinkDontTree = (t: Translate): UsageTree => skipLink(t("demo.skipLink.dd.vague"));

/* ───────────── Sidebar ───────────── */

const railLink = (icon: string, label: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href: "#", current },
  slots: { icon: { contract: "icon", signature: "Icon", options: { name: icon } }, children: label },
});

/* Collapsed to the rail: the icon is the only thing left to tell one destination from the next. */
const rail = (t: Translate, links: readonly UsageTree[]): UsageTree => ({
  contract: "sidebar",
  signature: "Sidebar",
  options: { defaultCollapsed: true },
  attrs: { style: "min-block-size: 14rem;" },
  children: [
    /* The enhancer refuses a sidebar with neither a trigger nor a resize handle, and an inert still is mounted like any other. */
    {
      contract: "sidebar",
      signature: "SidebarHeader",
      children: {
        contract: "sidebar",
        signature: "SidebarTrigger",
        options: { label: t("demo.sidebar.collapse") },
        slots: { icon: { contract: "icon", signature: "Icon", options: { name: "menu" } } },
      },
    },
    {
      contract: "sidebar",
      signature: "SidebarContent",
      children: {
        contract: "nav-list",
        signature: "NavList",
        attrs: { "aria-label": t("demo.sidebar.nav") },
        children: { contract: "nav-list", signature: "NavListGroup", slots: { children: links } },
      },
    },
  ],
});

/** Three destinations, three icons that look like what they are. */
export const sidebarDoTree = (t: Translate): UsageTree =>
  rail(t, [
    railLink("info", t("demo.sidebar.home"), true),
    railLink("calendar", t("demo.sidebar.reports")),
    railLink("settings", t("demo.sidebar.dd.settings")),
  ]);

/** One icon for all of them: collapsed, the rail is three identical marks. */
export const sidebarDontTree = (t: Translate): UsageTree =>
  rail(t, [
    railLink("info", t("demo.sidebar.home"), true),
    railLink("info", t("demo.sidebar.reports")),
    railLink("info", t("demo.sidebar.dd.settings")),
  ]);


/* ═════════════ SECOND PAIRS ═════════════ */

/* ───────────── Toast: a failure says what to do ───────────── */

const failure = (t: Translate, message: UIKey, withRetry: boolean): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  attrs: { "data-stack": "off", style: toastInFlow },
  children: {
    contract: "content",
    signature: "Toast",
    options: { tone: "danger", dismissible: true, dismissLabel: t("demo.toast.dismiss") },
    ...(withRetry ? { slots: { actions: button(t("demo.toast.dd.retry"), { variant: "solid" }) } } : {}),
    children: t(message),
  },
});

export const toastFailDoTree = (t: Translate): UsageTree => failure(t, "demo.toast.dd.failDo", true);
export const toastFailDontTree = (t: Translate): UsageTree => failure(t, "demo.toast.dd.failDont", false);

/* ───────────── SplitButton: one action is a Button ───────────── */

export const splitButtonSingleDoTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "solid", size: "md" },
  children: t("demo.splitButton.dd.export"),
});

export const splitButtonSingleDontTree = (t: Translate): UsageTree => {
  const tree = splitButtonTree(t);
  const slots = tree.slots as Record<string, UsageTree>;
  return { ...tree, slots: { ...slots, action: { ...slots.action!, slots: { children: t("demo.splitButton.dd.export") } } } };
};

/* ───────────── StateButton: on or off is a Switch ───────────── */

export const stateButtonSwitchDoTree = (t: Translate): UsageTree => ({
  contract: "switch",
  signature: "Switch",
  options: { name: "dd-notifications" },
  children: t("demo.state-button.dd.notifications"),
});

export const stateButtonSwitchDontTree = (t: Translate): UsageTree =>
  row(
    stateButton("dd-state-onoff", t("demo.state-button.dd.notifications"), "off", [["off", "close"], ["on", "check"]]),
    text(t("demo.state-button.dd.notifications")),
  );

/* ───────────── Tile: a disabled tile says why ───────────── */

const disabledTile = (t: Translate, description: UIKey): UsageTree => ({
  contract: "tile",
  signature: "TileButton",
  options: { disabled: true },
  children: { contract: "tile", signature: "TileContent", slots: { title: t("demo.tile.dd.archive"), description: t(description) } },
});

export const tileDisabledDoTree = (t: Translate): UsageTree => disabledTile(t, "demo.tile.dd.archiveWhy");
export const tileDisabledDontTree = (t: Translate): UsageTree => disabledTile(t, "demo.tile.dd.archiveNoWhy");

/* ───────────── Tile family: switch, checkbox, radio group, expandable ───────────── */

const tileCopy = (t: Translate, title: UIKey, description: UIKey): UsageTree => ({
  contract: "tile",
  signature: "TileContent",
  slots: { title: t(title), description: t(description) },
});

const tileSwitch = (t: Translate, title: UIKey, description: UIKey): UsageTree => ({
  contract: "tile",
  signature: "TileSwitch",
  options: { name: "dd-tile-switch", defaultChecked: true },
  children: tileCopy(t, title, description),
});

/** The title names the preference; the switch already says whether it is on. */
export const tileSwitchDoTree = (t: Translate): UsageTree => tileSwitch(t, "demo.tile.dd.switchDoTitle", "demo.tile.dd.switchDoBody");
export const tileSwitchDontTree = (t: Translate): UsageTree => tileSwitch(t, "demo.tile.dd.switchDontTitle", "demo.tile.dd.switchDontBody");

const tileCheckbox = (t: Translate, title: UIKey, description: UIKey): UsageTree => ({
  contract: "tile",
  signature: "TileCheckbox",
  options: { name: "dd-tile-checkbox", value: "digest" },
  children: tileCopy(t, title, description),
});

/** Each option explains itself: what it is and what it costs or changes. */
export const tileCheckboxDoTree = (t: Translate): UsageTree => tileCheckbox(t, "demo.tile.dd.checkDoTitle", "demo.tile.dd.checkDoBody");
export const tileCheckboxDontTree = (t: Translate): UsageTree => tileCheckbox(t, "demo.tile.dd.checkDontTitle", "demo.tile.dd.checkDontBody");

const tileRadios = (t: Translate, defaultValue?: string): UsageTree => ({
  contract: "tile",
  signature: "TileRadioGroup",
  options: { name: "dd-tile-radio", ...(defaultValue ? { defaultValue } : {}) },
  attrs: { "aria-label": t("demo.radioGroup.label"), class: "sk-tile-grid", style: "max-inline-size: 22rem;" },
  slots: { items: tileRadioGroupItems(t).slice(0, 2) },
});

/** A group opens with one option chosen; with none, "required" has nothing to start from. */
export const tileRadioGroupDoTree = (t: Translate): UsageTree => tileRadios(t, "starter");
export const tileRadioGroupDontTree = (t: Translate): UsageTree => tileRadios(t);

const expandable = (t: Translate, title: UIKey, description: UIKey): UsageTree => ({
  contract: "tile",
  signature: "ExpandableTile",
  attrs: { style: "max-inline-size: 22rem;" },
  children: [
    {
      contract: "tile",
      signature: "ExpandableTileTrigger",
      children: [tileCopy(t, title, description), { contract: "tile", signature: "TileChevron" }],
    },
    { contract: "tile", signature: "ExpandableTileContent", children: t("demo.tile.dd.expandBody") },
  ],
});

/** The closed title says what is inside, so nobody opens it to find out. */
export const expandableTileDoTree = (t: Translate): UsageTree => expandable(t, "demo.tile.dd.expandDoTitle", "demo.tile.dd.expandDoBody");
export const expandableTileDontTree = (t: Translate): UsageTree => expandable(t, "demo.tile.dd.expandDontTitle", "demo.tile.dd.expandDontBody");

/* ───────────── TileButton: the title names the action ───────────── */

const tileButton = (t: Translate, title: UIKey, description: UIKey): UsageTree => ({
  contract: "tile",
  signature: "TileButton",
  children: tileCopy(t, title, description),
});

/** The title is the verb; the description adds what helps decide. */
export const tileButtonVerbDoTree = (t: Translate): UsageTree => tileButton(t, "demo.tile.buttonList.export.title", "demo.tile.buttonList.export.description");

/** A title that could belong to any card; the real action is buried in the description. */
export const tileButtonVerbDontTree = (t: Translate): UsageTree => tileButton(t, "demo.tile.dd.vagueTitle", "demo.tile.dd.vagueBody");

/* ───────────── TileButton: the destructive action, last and named plainly ───────────── */

const tileButtonStack = (...items: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  attrs: { style: "max-inline-size: 22rem;" },
  children: items,
});

/** Share first, delete last and called by what it does. */
export const tileButtonOrderDoTree = (t: Translate): UsageTree =>
  tileButtonStack(
    tileButton(t, "demo.tile.buttonList.share.title", "demo.tile.buttonList.share.description"),
    tileButton(t, "demo.tile.buttonList.delete.title", "demo.tile.buttonList.delete.description"),
  );

/** Delete first, called "Remove": a softer word that hides what it does. */
export const tileButtonOrderDontTree = (t: Translate): UsageTree =>
  tileButtonStack(
    tileButton(t, "demo.tile.dd.vagueDeleteTitle", "demo.tile.dd.vagueDeleteBody"),
    tileButton(t, "demo.tile.buttonList.share.title", "demo.tile.buttonList.share.description"),
  );

/* ───────────── SkipLink: content first ───────────── */

const skipPair = (first: UsageTree, second: UsageTree): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [first, second],
});

const skipTo = (href: string, label: string): UsageTree => ({
  contract: "skip-link",
  signature: "SkipLink",
  options: { href },
  attrs: { style: skipRevealed },
  children: label,
});

export const skipLinkOrderDoTree = (t: Translate): UsageTree =>
  skipPair(skipTo("#main-content", t("skipLink.demoContentLabel")), skipTo("#main-nav", t("skipLink.demoNavLabel")));

export const skipLinkOrderDontTree = (t: Translate): UsageTree =>
  skipPair(skipTo("#main-nav", t("skipLink.demoNavLabel")), skipTo("#main-content", t("skipLink.demoContentLabel")));

/* ───────────── Sidebar: short names ───────────── */

const expandedRail = (t: Translate, links: readonly UsageTree[]): UsageTree => {
  const tree = rail(t, links);
  return { ...tree, options: { defaultCollapsed: false }, attrs: { style: "min-block-size: 14rem; inline-size: 14rem;" } };
};

export const sidebarNamesDoTree = (t: Translate): UsageTree =>
  expandedRail(t, [
    railLink("info", t("demo.sidebar.home"), true),
    railLink("calendar", t("demo.sidebar.reports")),
    railLink("settings", t("demo.sidebar.dd.settings")),
  ]);

export const sidebarNamesDontTree = (t: Translate): UsageTree =>
  expandedRail(t, [
    railLink("info", t("demo.sidebar.dd.longHome"), true),
    railLink("calendar", t("demo.sidebar.dd.longReports")),
    railLink("settings", t("demo.sidebar.dd.longSettings")),
  ]);

