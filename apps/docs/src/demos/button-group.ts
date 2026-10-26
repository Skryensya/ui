import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { currencyItems, mailMoreItems, splitMenuItems } from "./data/button-group";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { annotationDemoCss } from "./annotation";

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
  group(
    [
      button(t("demo.buttonGroup.archive"), { size }),
      button(t("demo.buttonGroup.report"), { size }),
      {
        contract: "menu",
        signature: "Menu",
        options: {
          label: t("demo.buttonGroup.mailLabel"),
          triggerLabel: t("demo.buttonGroup.more"),
          triggerVariant: "soft",
          triggerSize: size,
          triggerIconOnly: true,
        },
        slots: { items: mailMoreItems(t) },
      },
    ],
    { label: t("demo.buttonGroup.mailLabel") },
  );

export const buttonGroupSizeTree = (t: Translate): UsageTree => buttonGroupBySize("md")(t);

export const buttonGroupVerticalTree = (t: Translate): UsageTree => buttonGroupVerticalBySize("sm")(t);

/** A row of groups: the outer group spaces them and welds nothing. */
export const buttonGroupNestedTree = (t: Translate): UsageTree =>
  group(
    [
      group([button("1"), button("2"), button("3")], { separator: "none" }),
      group(
        [
          iconButton(t("demo.buttonGroup.previous"), "chevron-left"),
          iconButton(t("demo.buttonGroup.next"), "chevron-right"),
        ],
        { separator: "none" },
      ),
    ],
    { label: t("demo.buttonGroup.pagesLabel") },
  );

/** `inset` (default) is a short centred line, `full` the whole height, `none` nothing: two solid members then fuse. */
export const buttonGroupSeparatorBy = (separator: "inset" | "full" | "none") => (t: Translate): UsageTree =>
  group(
    [
      button(t("demo.buttonGroup.copyAction"), { variant: "solid" }),
      button(t("demo.buttonGroup.pasteAction"), { variant: "solid" }),
    ],
    { separator },
  );

export const buttonGroupSeparatorTree = (t: Translate): UsageTree => buttonGroupSeparatorBy("inset")(t);

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
    { contract: "input", signature: "Input", options: { appearance: "plain" }, attrs: { id: "demo-button-group-site" } },
  ]);

/** A Select and an Input joined into one amount, and the button that sends it. */
export const buttonGroupSelectTree = (t: Translate): UsageTree =>
  group([
    { contract: "select", signature: "Select", options: { value: "usd" }, attrs: { "aria-label": t("demo.buttonGroup.currency") }, slots: { items: currencyItems } },
    // Text, not `type="number"`: no spinners inside a joined shape, and the decimal keypad on a phone.
    { contract: "input", signature: "Input", options: { placeholder: t("demo.buttonGroup.amountPlaceholder") }, attrs: { "aria-label": t("demo.buttonGroup.amount"), inputmode: "decimal", autocomplete: "off" } },
    button(t("demo.buttonGroup.send"), { variant: "solid", tone: "accent" }),
    // `full`: one border-weight line per seam, which reads as a divider between currency and amount.
  ], { separator: "full" });

/** The one setting inside the Popover: a Segmented of the assistant's tones. */
const toneSetting = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "formal", label: t("demo.buttonGroup.tone") },
  slots: { items: ["formal", "friendly", "brief"].map((v) => ({ options: { value: v }, slots: { label: t(`demo.buttonGroup.tone.${v}` as never) } })) },
});

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
        closeLabel: t("demo.buttonGroup.close"),
      },
      slots: {
        trigger: { contract: "icon", signature: "Icon", options: { name: "chevron-down" } },
        title: t("demo.buttonGroup.assistantSettings"),
        children: { contract: "layout", signature: "Stack", options: { gap: "md" }, children: [toneSetting(t)] },
      },
    },
  ]);

/** The same group under `dir="rtl"`: the weld is logical, so the corners follow. */
export const buttonGroupRtlTree = (_t: Translate): UsageTree =>
  group([button("أرشفة"), button("تقرير"), button("تأجيل")], { label: "البريد" }, { dir: "rtl" });

/** Shared classes get one legend entry across both complete compositions. */
export const buttonGroupAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("buttonGroupPage.anatomyLabel"), inert: true, ringPlacement: "offset", ringDistance: 4 },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "xl", inlineAlign: "center", wrap: false },
      children: [
        group(
          [
            button(t("demo.buttonGroup.save"), { variant: "solid", tone: "accent" }),
            { contract: "button-group", signature: "ButtonGroupSeparator" },
            {
              contract: "menu",
              signature: "Menu",
              options: {
                label: t("demo.buttonGroup.saveMenuLabel"),
                triggerLabel: t("demo.buttonGroup.saveMenuLabel"),
                triggerVariant: "solid",
                triggerTone: "accent",
                triggerIconOnly: true,
              },
              slots: { items: splitMenuItems(t) },
            },
          ],
          { label: t("demo.buttonGroup.saveMenuLabel") },
        ),
        group(
          [
            { contract: "button-group", signature: "ButtonGroupLabel", options: { htmlFor: "demo-button-group-anatomy-site" }, slots: { children: t("demo.buttonGroup.siteLabel") } },
            { contract: "button-group", signature: "ButtonGroupText", slots: { children: "https://" } },
            { contract: "input", signature: "Input", options: { appearance: "plain" }, attrs: { id: "demo-button-group-anatomy-site", value: "example.com" } },
          ],
          { label: t("demo.buttonGroup.siteLabel") },
        ),
      ],
    },
    items: [
      namePart(".sk-button-group", "block-end", { match: "all", ringDistance: 8 }),
      namePart(".sk-button", "block-start", { match: "all", ringDistance: 2 }),
      namePart(".sk-button-group__separator", "block-start", { ringDistance: 2 }),
      namePart(".sk-button-group__text", "block-start", { match: "all", ringDistance: 2 }),
      namePart(".sk-input", "block-end", { ringDistance: 2 }),
    ],
  },
});

export const buttonGroupAnatomyCss = `${annotationDemoCss}

/* Leave breathing room around both specimens without the docs’ full 4:3 board. */
.sk-annotated-figure[class] > .sk-canvas[data-fit-only] > .sk-canvas__viewport {
  aspect-ratio: auto;
  block-size: var(--sk-canvas-fit-block-size, auto);
  min-block-size: 18rem;
}

.sk-annotated__subject .sk-input {
  inline-size: 11rem;
}`;
