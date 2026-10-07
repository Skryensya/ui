import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * ACCOUNT SETTINGS. The "long form that is really several small forms" shape. Three decisions carry
 * it and each one is a contract saying no to something:
 *
 *   - every group is its own `Box` with its own heading. A settings page is scanned for the ONE
 *     thing someone came to change, so the groups have to read as separate places, not one form;
 *   - notifications are `Switch`, not `Checkbox`. They apply the moment they flip and submit
 *     nothing, which is exactly the line `Switch.useWhen` draws. Each row is the published
 *     `settings-row-with-switch` snippet: title and description on one side, control on the other,
 *     the switch named by its own `aria-label`; and
 *   - the destructive action lives in its own `danger` Callout, at the bottom, with the only
 *     `danger` button on the page. Deleting an account next to "Save" is how people delete accounts.
 */

const field = (label: string, name: string, placeholder: string, type = "text"): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: {
    label,
    children: {
      contract: "input",
      signature: "Input",
      options: { type, name, placeholder },
    },
  },
});

const section = (title: string, description: string, body: UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "md", paddingExpanded: "lg" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h4", flush: true },
            children: title,
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", tone: "secondary" },
            children: description,
          },
        ],
      },
      ...body,
    ],
  },
});

const switchRow = (title: string, description: string, name: string, on: boolean): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { justify: "between", inlineAlign: "center" },
  children: [
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { weight: "emphasis" },
          children: title,
        },
        {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary", size: "sm" },
          children: description,
        },
      ],
    },
    {
      contract: "switch",
      signature: "Switch",
      options: { name, ...(on ? { defaultChecked: true } : {}) },
      attrs: { "aria-label": title },
    },
  ],
});

const separator: UsageTree = {
  contract: "separator",
  signature: "Separator",
  // Written out: this page emits without `fillDefaults`, and the rule is drawn off this attribute.
  options: { orientation: "horizontal" },
};

export const settingsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "AppShell",
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Lumen" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: "Helena Park", size: "sm" },
            children: "HP",
          },
        },
      ],
    },
    {
      contract: "layout",
      signature: "Main",
      options: { paddingBlock: "lg", paddingBlockExpanded: "xl" },
      children: {
        contract: "wrapper",
        signature: "Wrapper",
        options: { wrapperSize: "md", gutter: "md", gutterExpanded: "lg" },
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md", gapExpanded: "lg" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "xs" },
              children: [
                {
                  contract: "typography",
                  signature: "Heading",
                  options: { headingSize: "h2", flush: true },
                  children: t("demo.settings.title"),
                },
                {
                  contract: "typography",
                  signature: "Text",
                  options: { tone: "secondary" },
                  children: t("demo.settings.lede"),
                },
              ],
            },
            section(t("demo.settings.profileTitle"), t("demo.settings.profileHint"), [
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "md", inlineAlign: "center" },
                children: [
                  {
                    contract: "avatar",
                    signature: "Avatar.initials",
                    options: { name: "Helena Park", size: "lg" },
                    children: "HP",
                  },
                  {
                    contract: "button",
                    signature: "Button.action",
                    options: { size: "sm" },
                    children: [
                      { contract: "icon", signature: "Icon", options: { name: "upload", size: "sm" } },
                      t("demo.settings.changePhoto"),
                    ],
                  },
                ],
              },
              field(t("demo.settings.name"), "name", "Helena Park"),
              field(t("demo.settings.email"), "email", "helena@lumen.dev", "email"),
              {
                contract: "layout",
                signature: "Inline",
                options: { justify: "end" },
                children: {
                  contract: "button",
                  signature: "Button.action",
                  options: { tone: "accent", type: "submit" },
                  children: t("demo.settings.save"),
                },
              },
            ]),
            section(t("demo.settings.notificationsTitle"), t("demo.settings.notificationsHint"), [
              /*
               * `gap: "none"`: the separators carry their own block margin, so a Stack gap on top
               * of it would space these rows twice.
               */
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "none" },
                children: [
                  switchRow(
                    t("demo.settings.notifyDeploys"),
                    t("demo.settings.notifyDeploysHint"),
                    "notify-deploys",
                    true,
                  ),
                  separator,
                  switchRow(
                    t("demo.settings.notifyMentions"),
                    t("demo.settings.notifyMentionsHint"),
                    "notify-mentions",
                    true,
                  ),
                  separator,
                  switchRow(
                    t("demo.settings.notifyDigest"),
                    t("demo.settings.notifyDigestHint"),
                    "notify-digest",
                    false,
                  ),
                ],
              },
            ]),
            {
              contract: "callout",
              signature: "Callout",
              options: { tone: "danger" },
              slots: {
                icon: { contract: "icon", signature: "Icon", options: { name: "danger" } },
                title: t("demo.settings.dangerTitle"),
                children: {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "sm", align: "start" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Text",
                      options: { size: "sm" },
                      children: t("demo.settings.dangerBody"),
                    },
                    {
                      contract: "button",
                      signature: "Button.action",
                      options: { tone: "danger" },
                      children: t("demo.settings.delete"),
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ],
});
