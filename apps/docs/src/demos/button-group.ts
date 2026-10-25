import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { currencyItems, splitMenuItems } from "./data/button-group";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * One tree per case the page teaches (shadcn's list: orientation, size, nested, separator, split,
 * input, input with text, select, popover, RTL). Members never carry a weld: the group squares
 * their corners by position. Members of one group share one variant and size, or the joined
 * shape reads as two controls that happen to touch.
 */

type Size = "xs" | "sm" | "md" | "lg";

const group = (children: UsageTree[], options: Record<string, string> = {}, attrs?: Record<string, string>): UsageTree => ({
  contract: "button-group",
  signature: "ButtonGroup",
  options,
  ...(attrs ? { attrs } : {}),
  children,
});

const button = (label: string, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "soft", ...options },
  slots: { children: label },
});

const iconButton = (label: string, icon: string, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "soft", iconOnly: true, ...options },
  attrs: { "aria-label": label },
  slots: { children: { contract: "icon", signature: "Icon", options: { name: icon } } },
});

/** The plain case: three related actions joined into one control. */
export const buttonGroupTree = (t: Translate): UsageTree =>
  group(
    [button(t("demo.buttonGroup.archive")), button(t("demo.buttonGroup.report")), button(t("demo.buttonGroup.snooze"))],
    { label: t("demo.buttonGroup.mailLabel") },
  );

/** The stacked pair at a given size. CURRIED on purpose: the stories and the tree test call every export with `(t, hrefs)`, so a second parameter would receive the hrefs, while a function that returns a function is not a tree and is left alone. */
export const buttonGroupVerticalBySize = (size: Size) => (t: Translate): UsageTree =>
  group(
    [
      iconButton(t("demo.buttonGroup.zoomIn"), "zoom-in", { variant: "solid", size }),
      iconButton(t("demo.buttonGroup.zoomOut"), "zoom-out", { variant: "solid", size }),
    ],
    { label: t("demo.buttonGroup.zoomLabel"), orientation: "vertical" },
  );

/** Every member at the same size: the size lives on each Button, never on the group. */
export const buttonGroupBySize = (size: Exclude<Size, "xs">) => (t: Translate): UsageTree =>
  group([button(t("demo.buttonGroup.archive"), { size }), button(t("demo.buttonGroup.report"), { size }), iconButton(t("demo.buttonGroup.more"), "more", { size })], {
    label: t("demo.buttonGroup.mailLabel"),
  });

export const buttonGroupSizeTree = (t: Translate): UsageTree => buttonGroupBySize("md")(t);

export const buttonGroupVerticalTree = (t: Translate): UsageTree => buttonGroupVerticalBySize("sm")(t);

/** A row of groups: the outer group spaces them and welds nothing. */
export const buttonGroupNestedTree = (t: Translate): UsageTree =>
  group(
    [
      group([button("1"), button("2"), button("3")]),
      group([
        iconButton(t("demo.buttonGroup.previous"), "chevron-left"),
        iconButton(t("demo.buttonGroup.next"), "chevron-right"),
      ]),
    ],
    { label: t("demo.buttonGroup.pagesLabel") },
  );

/** Two solid members paint no border, so the separator is the only seam between them. */
export const buttonGroupSeparatorTree = (t: Translate): UsageTree =>
  group([
    button(t("demo.buttonGroup.copyAction"), { variant: "solid" }),
    { contract: "button-group", signature: "ButtonGroupSeparator" },
    button(t("demo.buttonGroup.pasteAction"), { variant: "solid" }),
  ]);

type Tone = { variant: "solid" | "soft" | "ghost"; tone?: "accent" | "danger" };

/** The split button: the usual action and an icon-only Menu of its variants. */
export const buttonGroupSplitTree = ({ variant, tone }: Tone = { variant: "solid", tone: "accent" }) => (t: Translate): UsageTree =>
  group([
    {
      contract: "button",
      signature: "Button.action",
      options: { variant, ...(tone ? { tone } : {}) },
      slots: { children: t("demo.buttonGroup.save") },
    },
    {
      contract: "menu",
      signature: "Menu",
      options: {
        label: t("demo.buttonGroup.saveMenuLabel"),
        triggerLabel: t("demo.buttonGroup.saveMenuLabel"),
        triggerVariant: variant,
        ...(tone ? { triggerTone: tone } : {}),
        triggerIconOnly: true,
      },
      slots: { items: splitMenuItems(t) },
    },
  ]);

export const buttonGroupSplitAccentTree = (t: Translate): UsageTree => buttonGroupSplitTree()(t);

/** An input joined to the button that acts on it. */
export const buttonGroupInputTree = (t: Translate): UsageTree =>
  group([
    { contract: "input", signature: "Input", options: { placeholder: t("demo.buttonGroup.searchPlaceholder") }, attrs: { "aria-label": t("demo.buttonGroup.search") } },
    iconButton(t("demo.buttonGroup.search"), "search"),
  ]);

/** Fixed text joined to the field: the prefix is part of the value's shape, not a label. */
export const buttonGroupTextTree = (t: Translate): UsageTree =>
  group([
    { contract: "button-group", signature: "ButtonGroupLabel", options: { htmlFor: "demo-button-group-site" }, slots: { children: t("demo.buttonGroup.siteLabel") } },
    { contract: "button-group", signature: "ButtonGroupText", slots: { children: "https://" } },
    { contract: "input", signature: "Input", attrs: { id: "demo-button-group-site" } },
  ]);

/** A Select and an Input joined into one amount, and the button that sends it. */
export const buttonGroupSelectTree = (t: Translate): UsageTree =>
  group([
    { contract: "select", signature: "Select", options: { value: "usd" }, attrs: { "aria-label": t("demo.buttonGroup.currency") }, slots: { items: currencyItems } },
    { contract: "input", signature: "Input", options: { placeholder: "10.00" }, attrs: { "aria-label": t("demo.buttonGroup.amount") } },
    button(t("demo.buttonGroup.send"), { variant: "solid", tone: "accent" }),
  ]);

/** A Popover as the second member: the action, and its settings one click away. */
export const buttonGroupPopoverTree = (t: Translate): UsageTree =>
  group([
    button(t("demo.buttonGroup.assistant")),
    {
      contract: "popover",
      signature: "Popover",
      options: {
        panelId: "demo-button-group-popover",
        triggerLabel: t("demo.buttonGroup.assistantSettings"),
        triggerVariant: "soft",
        triggerIconOnly: true,
      },
      slots: {
        trigger: { contract: "icon", signature: "Icon", options: { name: "chevron-down" } },
        title: t("demo.buttonGroup.assistantSettings"),
        children: t("demo.buttonGroup.assistantBody"),
      },
    },
  ]);

/** The same group under `dir="rtl"`: the weld is logical, so the corners follow. */
export const buttonGroupRtlTree = (_t: Translate): UsageTree =>
  group([button("أرشفة"), button("تقرير"), button("تأجيل")], { label: "البريد" }, { dir: "rtl" });

export const buttonGroupAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("buttonGroupPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: buttonGroupSplitTree()(t),
    items: [
      namePart(".sk-button-group", "block-start", { mark: "bracket", ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-button", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-menu__trigger", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});
