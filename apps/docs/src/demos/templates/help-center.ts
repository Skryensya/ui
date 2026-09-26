import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * HELP CENTER. The "find the one answer" shape: a search up top, topics to browse, then the
 * questions people actually ask. Its appearances are the counterparts of the other templates':
 *
 *   - the header is a `Hero` on the `raised` surface, the opposite end from the article's
 *     `sunken` one: here the search box IS the page's main action, so the band holding it comes
 *     forward;
 *   - topics are `Tabs` with `variant: "underline"`, the lighter of the two. Product detail uses
 *     `hanging` for a spec sheet; here the tabs only filter a grid of links, and a thin rule
 *     is enough to say which filter is on;
 *   - each topic is a `TileLink`: a whole surface that goes somewhere, not a button;
 *   - the FAQ is an `Accordion`. Several answers, each read on its own, and the page stays short
 *     until someone opens one; and
 *   - the closing "contact support" is `variant: "soft"`. Getting a person is the fallback here,
 *     not the goal, so it gets a tinted face rather than the accent.
 */

const topic = (href: string, title: string, description: string): UsageTree => ({
  contract: "tile",
  signature: "TileLink",
  options: { href, padding: "md" },
  children: {
    contract: "tile",
    signature: "TileContent",
    slots: { title, description },
  },
});

const faq = (value: string, question: string, answer: string): UsageTree => ({
  contract: "accordion",
  signature: "Accordion.Item",
  options: { value },
  children: [
    {
      contract: "accordion",
      signature: "Accordion.Trigger",
      children: [
        { contract: "tile", signature: "TileContent", slots: { title: question } },
        { contract: "tile", signature: "TileChevron" },
      ],
    },
    { contract: "accordion", signature: "Accordion.Content", children: answer },
  ],
});

const topicGrid = (children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", multicol: true },
  children,
});

export const helpCenterTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Lumen Help" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost" },
            children: t("demo.help.signIn"),
          },
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { class: "page-shell" },
      children: {
        contract: "layout",
        signature: "Main",
        attrs: { class: "page-shell__main" },
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "xl" },
          children: [
            {
              contract: "hero",
              signature: "Hero",
              options: { surface: "raised", align: "center" },
              children: {
                contract: "wrapper",
                signature: "Wrapper",
                options: { wrapperSize: "sm" },
                children: {
                  contract: "layout",
                  signature: "Stack",
                  /*
                   * No `align: "center"` here, unlike the other centred heroes: a centred Stack
                   * shrinks each child to its content, and the search box would collapse to the
                   * width of its placeholder. The Hero's own `align` already centres the text.
                   */
                  options: { gap: "md" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "display-sm", headingElement: "h1", flush: true },
                      children: t("demo.help.title"),
                    },
                    {
                      contract: "typography",
                      signature: "Text",
                      options: { size: "lg", tone: "secondary" },
                      children: t("demo.help.lede"),
                    },
                    {
                      contract: "form-field",
                      signature: "FormField",
                      slots: {
                        label: t("demo.help.searchLabel"),
                        children: {
                          contract: "input",
                          signature: "Input",
                          options: {
                            type: "search",
                            name: "q",
                            placeholder: t("demo.help.searchPlaceholder"),
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              contract: "wrapper",
              signature: "Wrapper",
              options: { wrapperSize: "lg" },
              children: {
                contract: "layout",
                signature: "Stack",
                options: { gap: "xl" },
                children: [
                  {
                    contract: "tabs",
                    signature: "Tabs",
                    options: { value: "start", variant: "underline" },
                    attrs: { "aria-label": t("demo.help.topicsLabel") },
                    slots: {
                      items: [
                        {
                          options: { value: "start" },
                          slots: {
                            label: t("demo.help.tabStart"),
                            children: topicGrid([
                              topic("#cuenta", t("demo.help.topicAccount"), t("demo.help.topicAccountHint")),
                              topic("#equipo", t("demo.help.topicTeam"), t("demo.help.topicTeamHint")),
                              topic("#proyecto", t("demo.help.topicProject"), t("demo.help.topicProjectHint")),
                            ]),
                          },
                        },
                        {
                          options: { value: "billing" },
                          slots: {
                            label: t("demo.help.tabBilling"),
                            children: topicGrid([
                              topic("#planes", t("demo.help.topicPlans"), t("demo.help.topicPlansHint")),
                              topic("#facturas", t("demo.help.topicInvoices"), t("demo.help.topicInvoicesHint")),
                              topic("#reembolsos", t("demo.help.topicRefunds"), t("demo.help.topicRefundsHint")),
                            ]),
                          },
                        },
                        {
                          options: { value: "security" },
                          slots: {
                            label: t("demo.help.tabSecurity"),
                            children: topicGrid([
                              topic("#sso", t("demo.help.topicSso"), t("demo.help.topicSsoHint")),
                              topic("#2fa", t("demo.help.topic2fa"), t("demo.help.topic2faHint")),
                              topic("#auditoria", t("demo.help.topicAudit"), t("demo.help.topicAuditHint")),
                            ]),
                          },
                        },
                      ],
                    },
                  },
                  {
                    contract: "layout",
                    signature: "Stack",
                    options: { gap: "md" },
                    children: [
                      {
                        contract: "typography",
                        signature: "Heading",
                        options: { headingSize: "h3", flush: true },
                        children: t("demo.help.faqTitle"),
                      },
                      {
                        contract: "accordion",
                        signature: "Accordion",
                        options: { collapsible: true },
                        children: [
                          faq("reset", t("demo.help.faq1"), t("demo.help.faq1Answer")),
                          faq("invite", t("demo.help.faq2"), t("demo.help.faq2Answer")),
                          faq("export", t("demo.help.faq3"), t("demo.help.faq3Answer")),
                        ],
                      },
                    ],
                  },
                  {
                    contract: "box",
                    signature: "Box",
                    options: { surface: "sunken", border: "subtle", padding: "lg" },
                    children: {
                      contract: "layout",
                      signature: "Inline",
                      options: { justify: "between", inlineAlign: "center", wrap: true },
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
                              children: t("demo.help.contactTitle"),
                            },
                            {
                              contract: "typography",
                              signature: "Text",
                              options: { size: "sm", tone: "secondary" },
                              children: t("demo.help.contactBody"),
                            },
                          ],
                        },
                        {
                          contract: "button",
                          signature: "Button.action",
                          options: { variant: "soft" },
                          children: t("demo.help.contact"),
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  ],
});
