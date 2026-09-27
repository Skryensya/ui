import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { siteFooter } from "./shared";

/*
 * NOT FOUND. The smallest page a site ships and the one most often built by hand. Here it is an
 * `EmptyState`, because that is exactly what a 404 is: a region with nothing in it, said on purpose,
 * with the way out right under the explanation.
 *
 *   - the title is the EmptyState's own heading, so "page not found" is the page's heading too;
 *   - the two ways out live in the `actions` slot, the only place the contract lets buttons go. The
 *     home link is a `Button.navigation` (it goes somewhere) with the accent; "Contact" is a `soft`
 *     link, the fallback, not the answer; and
 *   - under it, a short `List` of the destinations people usually meant. A dead end with three real
 *     exits is a detour, not a dead end.
 */

const suggestion = (title: string, description: string, href: string): UsageTree => ({
  contract: "list",
  signature: "ListItemLink",
  options: { href },
  slots: {
    leading: { contract: "icon", signature: "Icon", options: { name: "arrow-right" } },
    title,
    description,
  },
});

export const notFoundTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [{ contract: "navbar", signature: "NavbarBrand", children: "Lumen" }],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { class: "page-shell" },
      children: [
        {
          contract: "layout",
          signature: "Main",
          attrs: { class: "page-shell__main" },
          children: {
            contract: "wrapper",
            signature: "Wrapper",
            options: { wrapperSize: "sm", gutter: "md", gutterExpanded: "lg" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "lg", gapExpanded: "xl" },
              children: [
                {
                  contract: "empty-state",
                  signature: "EmptyState",
                  slots: {
                    icon: { contract: "icon", signature: "Icon", options: { name: "search" } },
                    title: t("demo.notFound.title"),
                    description: t("demo.notFound.body"),
                    actions: [
                      {
                        contract: "button",
                        signature: "Button.navigation",
                        options: { href: "#inicio", tone: "accent" },
                        children: t("demo.notFound.home"),
                      },
                      {
                        contract: "button",
                        signature: "Button.navigation",
                        options: { href: "#contacto", variant: "soft" },
                        children: t("demo.notFound.contact"),
                      },
                    ],
                  },
                },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "sm" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h4", flush: true },
                      children: t("demo.notFound.suggestionsTitle"),
                    },
                    {
                      contract: "list",
                      signature: "List",
                      children: [
                        suggestion(t("demo.notFound.s1"), t("demo.notFound.s1Hint"), "#docs"),
                        suggestion(t("demo.notFound.s2"), t("demo.notFound.s2Hint"), "#precios"),
                        suggestion(t("demo.notFound.s3"), t("demo.notFound.s3Hint"), "#blog"),
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        siteFooter(t),
      ],
    },
  ],
});
