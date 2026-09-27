import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * TEAM DIRECTORY. The "manage a list of people" shape, and the dashboard's quieter sibling: the
 * same `Table`, but its rows are people rather than figures, so the parts change with them.
 *
 *   - the row header is the person (avatar + name), not an id. `scope: "row"` makes the name what a
 *     screen reader announces when it moves along the row;
 *   - department filters are `Tag.link`. Each one is a facet that goes somewhere (a filtered URL),
 *     so it is a link, and the Tag's `link` signature forbids a remove button on it;
 *   - status is a `Badge` with a system tone, because "pending invite" is a state, not an action;
 *     and
 *   - the page has one accent (Invite) and the row action is a ghost `sm` button. A list where every
 *     row shouts is a list nobody can scan.
 */

const person = (
  name: string,
  initials: string,
  email: string,
  role: string,
  status: string,
  tone: "success" | "warning" | "neutral",
  actionLabel: string,
): UsageTree => ({
  contract: "table",
  signature: "TableRow",
  children: [
    {
      contract: "table",
      signature: "TableHeader",
      options: { scope: "row" },
      children: {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", inlineAlign: "center", wrap: false },
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name, size: "sm" },
            children: initials,
          },
          name,
        ],
      },
    },
    /* The column a phone drops first: the name already identifies the row, and a clipped address
     * is worse than none. Its header cell carries the same class, so the columns stay aligned. */
    {
      contract: "table",
      signature: "TableCell",
      attrs: { class: "template-wide-only" },
      children: email,
    },
    { contract: "table", signature: "TableCell", children: role },
    {
      contract: "table",
      signature: "TableCell",
      children: { contract: "badge", signature: "Badge", options: { tone }, children: status },
    },
    {
      contract: "table",
      signature: "TableCell",
      children: {
        contract: "button",
        signature: "Button.action",
        options: { variant: "ghost", size: "sm" },
        attrs: { "aria-label": `${actionLabel}: ${name}` },
        children: actionLabel,
      },
    },
  ],
});

const facet = (label: string, href: string): UsageTree => ({
  contract: "tag",
  signature: "Tag.link",
  options: { href },
  children: label,
});

export const teamTree = (t: Translate): UsageTree => {
  const edit = t("demo.team.edit");
  const active = t("demo.team.active");
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
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
        signature: "Stack",
        options: { gap: "none" },
        attrs: { class: "page-shell" },
        children: {
          contract: "layout",
          signature: "Main",
          attrs: { class: "page-shell__main" },
          children: {
            contract: "wrapper",
            signature: "Wrapper",
            options: { wrapperSize: "lg", gutter: "md", gutterExpanded: "lg" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "md", gapExpanded: "lg" },
              children: [
                {
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
                          signature: "Heading",
                          options: { headingSize: "h2", flush: true },
                          children: t("demo.team.title"),
                        },
                        {
                          contract: "typography",
                          signature: "Text",
                          options: { tone: "secondary" },
                          children: t("demo.team.lede"),
                        },
                      ],
                    },
                    {
                      contract: "button",
                      signature: "Button.action",
                      options: { tone: "accent" },
                      children: [
                        { contract: "icon", signature: "Icon", options: { name: "add", size: "sm" } },
                        t("demo.team.invite"),
                      ],
                    },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Inline",
                  options: { gap: "md", inlineAlign: "end", wrap: true },
                  children: [
                    {
                      contract: "form-field",
                      signature: "FormField",
                      slots: {
                        label: t("demo.team.searchLabel"),
                        children: {
                          contract: "input",
                          signature: "Input",
                          options: {
                            type: "search",
                            name: "q",
                            placeholder: t("demo.team.searchPlaceholder"),
                          },
                        },
                      },
                    },
                    {
                      contract: "layout",
                      signature: "Inline",
                      options: { gap: "xs", wrap: true },
                      attrs: { "aria-label": t("demo.team.filtersLabel") },
                      children: [
                        facet(t("demo.team.deptAll"), "#todos"),
                        facet(t("demo.team.deptDesign"), "#diseno"),
                        facet(t("demo.team.deptEngineering"), "#ingenieria"),
                        facet(t("demo.team.deptSales"), "#ventas"),
                      ],
                    },
                  ],
                },
                {
                  contract: "table",
                  signature: "TableScroll",
                  children: {
                    contract: "table",
                    signature: "Table",
                    children: [
                      {
                        contract: "table",
                        signature: "TableCaption",
                        children: t("demo.team.caption"),
                      },
                      {
                        contract: "table",
                        signature: "TableHead",
                        children: {
                          contract: "table",
                          signature: "TableRow",
                          children: [
                            t("demo.team.colName"),
                            t("demo.team.colEmail"),
                            t("demo.team.colRole"),
                            t("demo.team.colStatus"),
                            t("demo.team.colActions"),
                          ].map((label, index) => ({
                            contract: "table",
                            signature: "TableHeader",
                            // Index 1 is Email, dropped on a phone along with its cells (`person`).
                            ...(index === 1 ? { attrs: { class: "template-wide-only" } } : {}),
                            children: label,
                          })),
                        },
                      },
                      {
                        contract: "table",
                        signature: "TableBody",
                        children: [
                          person(
                            "Helena Park",
                            "HP",
                            "helena@lumen.dev",
                            t("demo.team.roleOwner"),
                            active,
                            "success",
                            edit,
                          ),
                          person(
                            "Diego Fuentes",
                            "DF",
                            "diego@lumen.dev",
                            t("demo.team.roleAdmin"),
                            active,
                            "success",
                            edit,
                          ),
                          person(
                            "Ana Morales",
                            "AM",
                            "ana@lumen.dev",
                            t("demo.team.roleMember"),
                            t("demo.team.pending"),
                            "warning",
                            edit,
                          ),
                          person(
                            "Kenji Sato",
                            "KS",
                            "kenji@lumen.dev",
                            t("demo.team.roleViewer"),
                            t("demo.team.suspended"),
                            "neutral",
                            edit,
                          ),
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    ],
  };
};
