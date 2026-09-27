import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The Appearance foundation page's specimen: ONE small composition that carries the axis on every
 * kind of surface it reaches (a control, a card, a choice, a framed stack), so switching the page's
 * appearance shows the same decision landing on four shapes at once. It is one example on purpose,
 * not a grid of four copies: the page's appearance switch is what changes it.
 */

const button = (children: string, options: Record<string, string>): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options,
  children,
});

const tileContent = (title: string, description: string): UsageTree => ({
  contract: "tile",
  signature: "TileContent",
  slots: { title, description },
});

const section = (value: string, title: string, description: string, body: string): UsageTree => ({
  contract: "accordion",
  signature: "Accordion.Item",
  options: { value },
  children: [
    {
      contract: "accordion",
      signature: "Accordion.Trigger",
      children: [tileContent(title, description), { contract: "tile", signature: "TileChevron" }],
    },
    {
      contract: "accordion",
      signature: "Accordion.Content",
      children: { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: body },
    },
  ],
});

export const appearanceSpecimenTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md" },
      children: [
        button(t("appearancePage.demo.save"), { tone: "accent" }),
        button(t("appearancePage.demo.preview"), { variant: "soft" }),
        button(t("appearancePage.demo.cancel"), { variant: "ghost" }),
      ],
    },
    {
      contract: "layout",
      signature: "Grid",
      options: { columns: "2", gap: "md", responsive: true },
      children: [
        {
          contract: "tile",
          signature: "TileButton",
          children: tileContent(t("appearancePage.demo.exportTitle"), t("appearancePage.demo.exportBody")),
        },
        {
          contract: "tile",
          signature: "TileCheckbox",
          options: { name: "appearance-alerts", value: "alerts", defaultChecked: true },
          children: tileContent(t("appearancePage.demo.alertsTitle"), t("appearancePage.demo.alertsBody")),
        },
      ],
    },
    {
      contract: "accordion",
      signature: "Accordion",
      options: { type: "single", collapsible: true, defaultValue: "runtime" },
      children: [
        section(
          "runtime",
          t("appearancePage.demo.runtimeTitle"),
          t("appearancePage.demo.runtimeDescription"),
          t("appearancePage.demo.runtimeBody"),
        ),
        section(
          "rollout",
          t("appearancePage.demo.rolloutTitle"),
          t("appearancePage.demo.rolloutDescription"),
          t("appearancePage.demo.rolloutBody"),
        ),
      ],
    },
  ],
});
