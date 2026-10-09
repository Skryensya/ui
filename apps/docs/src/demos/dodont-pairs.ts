import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { splitButtonTree } from "./split-button";
import { STICKER_STAR } from "./sticker";

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

/* ───────────── Sticker ───────────── */

/** A status is a word: Badge. */
export const stickerDoTree = (t: Translate): UsageTree => ({
  contract: "badge",
  signature: "Badge",
  options: { tone: "accent" },
  children: t("demo.sticker.dd.status"),
});

/** The same word peeled onto a sticker: a keepsake silhouette doing a label's job. */
export const stickerDontTree = (t: Translate): UsageTree => ({
  contract: "sticker",
  signature: "Sticker",
  options: { state: "applied" },
  children: { contract: "typography", signature: "Text", options: { weight: "emphasis" }, children: t("demo.sticker.dd.status") },
});


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

/* ───────────── Sticker: the silhouette is the point ───────────── */

const SQUARE = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="96" height="96"><rect x="4" y="4" width="92" height="92" fill="#3182ce"/></svg>');

const stickerOf = (src: string, alt: string): UsageTree => ({
  contract: "sticker",
  signature: "Sticker",
  options: { src, alt, state: "applied" },
});

export const stickerShapeDoTree = (t: Translate): UsageTree => stickerOf(STICKER_STAR, t("demo.sticker.starAlt"));
export const stickerShapeDontTree = (t: Translate): UsageTree => stickerOf(SQUARE, t("demo.sticker.dd.squareAlt"));
