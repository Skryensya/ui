import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { buttonGroupInputTree, buttonGroupSplitAccentTree } from "./button-group";
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

/* ───────────── ButtonGroup: a split button ───────────── */

/** A split ButtonGroup whose action half reads `label`. */
const splitWithAction = (t: Translate, label: string): UsageTree => {
  const tree = buttonGroupSplitAccentTree(t);
  const [action, ...rest] = tree.children as UsageTree[];
  return { ...tree, children: [{ ...action!, slots: { children: label } }, ...rest] };
};

/** The primary half names what a click does. */
export const buttonGroupSplitDoTree = (t: Translate): UsageTree => buttonGroupSplitAccentTree(t);

/** "Actions" tells nobody what the main half does, which is the point of having a main half. */
export const buttonGroupSplitDontTree = (t: Translate): UsageTree => splitWithAction(t, t("demo.buttonGroup.dd.vague"));

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

/* ───────────── ButtonGroup: one action is a Button ───────────── */

export const buttonGroupSingleDoTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "solid", size: "md" },
  children: t("demo.buttonGroup.dd.export"),
});

export const buttonGroupSingleDontTree = (t: Translate): UsageTree => splitWithAction(t, t("demo.buttonGroup.dd.export"));

/* ───────────── ButtonGroup: more of the page's rules ───────────── */

const separator = (): UsageTree => ({ contract: "button-group", signature: "ButtonGroupSeparator" });

/** A ButtonGroup drawn the way the page's own examples are: the compact default, written out so the markup carries it, with its separators. */
const bgroup = (members: UsageTree[], label: string): UsageTree => ({
  contract: "button-group",
  signature: "ButtonGroup",
  options: { label, separator: "inset" },
  children: members.flatMap((member, i) => (i === 0 ? [member] : [separator(), member])),
});

const soft = (label: string, options: Record<string, string> = {}): UsageTree => button(label, { variant: "soft", ...options });

/** The mail actions, as the page's first example has them. */
const mailActions = (t: Translate, sizes: readonly [string, string, string] = ["sm", "sm", "sm"]): UsageTree[] => [
  soft(t("demo.buttonGroup.archive"), { size: sizes[0] }),
  soft(t("demo.buttonGroup.report"), { size: sizes[1] }),
  soft(t("demo.buttonGroup.snooze"), { size: sizes[2] }),
];

/** Each action names what it does, with a verb. */
export const buttonGroupVerbsDoTree = (t: Translate): UsageTree => bgroup(mailActions(t), t("demo.buttonGroup.mailLabel"));

/** Nouns and states say what the thing is, not what pressing it does. */
export const buttonGroupVerbsDontTree = (t: Translate): UsageTree =>
  bgroup([soft(t("demo.buttonGroup.dd.noun1")), soft(t("demo.buttonGroup.dd.noun2")), soft(t("demo.buttonGroup.dd.noun3"))], t("demo.buttonGroup.mailLabel"));

/** Every member at one size. */
export const buttonGroupSizeDoTree = (t: Translate): UsageTree => bgroup(mailActions(t, ["md", "md", "md"]), t("demo.buttonGroup.mailLabel"));

/** One member larger than its neighbours: the shared edge stops lining up. */
export const buttonGroupSizeDontTree = (t: Translate): UsageTree => bgroup(mailActions(t, ["sm", "lg", "sm"]), t("demo.buttonGroup.mailLabel"));

/** A split button whose menu half looks like the action half. */
export const buttonGroupLookDoTree = (t: Translate): UsageTree => buttonGroupSplitAccentTree(t);

/** The menu half in another look: the two halves stop reading as one control. */
export const buttonGroupLookDontTree = (t: Translate): UsageTree => {
  const tree = buttonGroupSplitAccentTree(t);
  const children = (tree.children as UsageTree[]).map((member) => {
    if (member.contract !== "menu") return member;
    const { triggerTone: _tone, ...options } = member.options ?? {};
    return { ...member, options: { ...options, triggerVariant: "ghost" } };
  });
  return { ...tree, children };
};

/** The field and the button that uses it, joined. */
export const buttonGroupFieldDoTree = (t: Translate): UsageTree => buttonGroupInputTree(t);

/** The same two, apart: the field is on its own, and nothing says the button acts on it. */
export const buttonGroupFieldDontTree = (t: Translate): UsageTree => {
  const [field, action] = buttonGroupInputTree(t).children as UsageTree[];
  return {
    contract: "layout",
    signature: "Inline",
    options: { gap: "md" },
    children: [{ contract: "button-group", signature: "ButtonGroup", children: [field!] }, action!],
  };
};

/** Unrelated actions are separate buttons. */
export const buttonGroupUnrelatedDoTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md" },
  children: [soft(t("demo.buttonGroup.dd.print")), soft(t("demo.buttonGroup.dd.delete"), { tone: "danger" })],
});

/** Joined, they read as two takes on one thing, and a destructive one sits against a harmless one. */
export const buttonGroupUnrelatedDontTree = (t: Translate): UsageTree =>
  bgroup([soft(t("demo.buttonGroup.dd.print")), soft(t("demo.buttonGroup.dd.delete"), { tone: "danger" })], t("demo.buttonGroup.dd.range"));

const rangeOptions = (t: Translate) => [
  ["day", t("demo.buttonGroup.dd.day")],
  ["week", t("demo.buttonGroup.dd.week")],
  ["month", t("demo.buttonGroup.dd.month")],
] as const;

/** Choosing one of several options is a Segmented: it holds the choice. */
export const buttonGroupOptionDoTree = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "week", label: t("demo.buttonGroup.dd.range") },
  slots: { items: rangeOptions(t).map(([value, label]) => ({ options: { value }, slots: { label } })) },
});

/** Buttons that pick an option do not remember which one is picked. */
export const buttonGroupOptionDontTree = (t: Translate): UsageTree =>
  bgroup(rangeOptions(t).map(([, label]) => soft(label)), t("demo.buttonGroup.dd.range"));

/** Two solid buttons with a line between them. */
export const buttonGroupFuseDoTree = (t: Translate): UsageTree =>
  bgroup([button(t("demo.buttonGroup.copyAction"), { variant: "solid" }), button(t("demo.buttonGroup.pasteAction"), { variant: "solid" })], t("demo.buttonGroup.mailLabel"));

/** No line: the two fills fuse into one button with two labels. */
export const buttonGroupFuseDontTree = (t: Translate): UsageTree => ({
  contract: "button-group",
  signature: "ButtonGroup",
  options: { label: t("demo.buttonGroup.mailLabel"), separator: "none" },
  children: [button(t("demo.buttonGroup.copyAction"), { variant: "solid" }), button(t("demo.buttonGroup.pasteAction"), { variant: "solid" })],
});

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

