import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * The pieces every PAGE template repeats. Kept in one place for the same reason the kit exists: a
 * footer typed out eight times is eight footers that drift apart the first time one of them gets a
 * new link.
 */

/**
 * The phone's stand-in for whatever the Navbar folds away. Icon-only, so it carries its own name;
 * `template-narrow-only` (site.css) shows it only when the template's frame is phone-narrow, and
 * the links it replaces carry `template-wide-only`.
 */
export const menuButton = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "ghost", iconOnly: true },
  attrs: { "aria-label": t("demo.shared.menu"), class: "template-narrow-only" },
  children: { contract: "icon", signature: "Icon", options: { name: "menu" } },
});

/** Marks a node as desktop-width only (site.css `.template-wide-only`). */
export const wideOnly = (node: UsageTree): UsageTree => ({
  ...node,
  attrs: { ...node.attrs, class: "template-wide-only" },
});

const footerLink = (label: string, href: string): UsageTree => ({
  contract: "typography",
  signature: "Link",
  options: { href },
  children: label,
});

/*
 * A site footer with the two things every public page closes on: who runs it, and the legal links.
 * `Inline` with `wrap`, so on a phone the links drop under the credit instead of squeezing it.
 */
export const siteFooter = (t: Translate, brand = "Lumen"): UsageTree => ({
  contract: "footer",
  signature: "Footer",
  options: { padding: "md" },
  children: {
    contract: "wrapper",
    signature: "Wrapper",
    options: { wrapperSize: "lg", gutter: "md", gutterExpanded: "lg" },
    children: {
      contract: "layout",
      signature: "Inline",
      options: { justify: "between", inlineAlign: "center", wrap: true, gap: "md" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "tertiary" },
          children: `© 2026 ${brand}. ${t("demo.shared.rights")}`,
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "md", wrap: true, layoutElement: "nav" },
          attrs: { "aria-label": t("demo.shared.legal") },
          children: [
            footerLink(t("demo.shared.privacy"), "#privacidad"),
            footerLink(t("demo.shared.terms"), "#terminos"),
            footerLink(t("demo.shared.status"), "#estado"),
          ],
        },
      ],
    },
  },
});

/**
 * A page's content in the measure its job needs: a Wrapper with the same gutters the footer uses, so what sits in the work area
 * lines up with the rest of the page and stops growing on a wide screen. A reading column is `md`; a work area with tables and
 * cards is `lg`.
 */
export const measured = (content: UsageTree, size: "sm" | "md" | "lg" = "lg"): UsageTree => ({
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: size, gutter: "md", gutterExpanded: "lg" },
  children: content,
});
