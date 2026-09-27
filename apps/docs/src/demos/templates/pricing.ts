import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { siteFooter } from "./shared";

/*
 * PRICING. The comparison shape: three offers side by side, read ACROSS rather than down. What
 * keeps it honest:
 *
 *   - the billing cycle is a `Segmented`, not `Tabs`. It changes what the prices read, it does not
 *     swap in a different panel of content (the same line `hero-with-pricing-toggle` draws);
 *   - each plan is the same `Box` with the same four parts in the same order (name, price, what is
 *     included, one action), so the eye compares like with like. Only the recommended plan differs:
 *     a `Badge` saying so in words, a firmer `default` border, and the page's only accent button.
 *     `Box` has no accent border on purpose, and the badge is what carries the meaning anyway;
 *   - the price is a `Stat`, the same contract the dashboard's figures use, so it brings tabular
 *     figures for free; and
 *   - the feature rows are `List`, with a `check` in the `leading` slot. That slot only takes an
 *     `Icon` or an avatar, which is exactly the constraint a checklist wants.
 */

const included = (label: string): UsageTree => ({
  contract: "list",
  signature: "ListItem",
  slots: {
    leading: { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
    title: label,
  },
});

interface Plan {
  name: string;
  blurb: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  featured?: string;
}

const plan = ({ name, blurb, price, period, features, cta, featured }: Plan): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: {
    surface: "raised",
    border: featured ? "default" : "subtle",
    padding: "lg",
  },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs", align: "start" },
        children: [
          ...(featured
            ? [
                {
                  contract: "badge",
                  signature: "Badge",
                  options: { tone: "accent" },
                  children: featured,
                } satisfies UsageTree,
              ]
            : []),
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h4", flush: true },
            children: name,
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", tone: "secondary" },
            children: blurb,
          },
        ],
      },
      {
        contract: "stat",
        signature: "Stat",
        slots: { label: period, value: price },
      },
      {
        contract: "list",
        signature: "List",
        options: { density: "compact" },
        children: features.map(included),
      },
      {
        contract: "button",
        signature: "Button.action",
        options: featured ? { tone: "accent" } : {},
        children: cta,
      },
    ],
  },
});

export const pricingTree = (t: Translate, locale: "es" | "en"): UsageTree => {
  const money = (amount: string) => (locale === "es" ? `${amount} €` : `$${amount}`);
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
              contract: "button",
              signature: "Button.action",
              options: { variant: "ghost" },
              children: t("demo.pricing.signIn"),
            },
          },
        ],
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
              options: { wrapperSize: "lg" },
              children: {
                contract: "layout",
                signature: "Stack",
                options: { gap: "xl" },
                children: [
                  {
                    contract: "layout",
                    signature: "Stack",
                    options: { gap: "md", align: "center" },
                    children: [
                      {
                        contract: "typography",
                        signature: "Heading",
                        options: { headingSize: "display-sm", flush: true },
                        children: t("demo.pricing.title"),
                      },
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { size: "lg", tone: "secondary" },
                        children: t("demo.pricing.lede"),
                      },
                      {
                        contract: "segmented",
                        signature: "Segmented",
                        options: { value: "annual", label: t("demo.pricing.cycleLabel") },
                        slots: {
                          items: [
                            {
                              options: { value: "monthly" },
                              slots: { label: t("demo.pricing.monthly") },
                            },
                            {
                              options: { value: "annual" },
                              slots: { label: t("demo.pricing.annual") },
                            },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    contract: "layout",
                    signature: "Grid",
                    options: { columns: "3", gap: "md", responsive: true },
                    children: [
                      plan({
                        name: t("demo.pricing.freeName"),
                        blurb: t("demo.pricing.freeBlurb"),
                        price: money("0"),
                        period: t("demo.pricing.perMonth"),
                        features: [
                          t("demo.pricing.feature1Projects"),
                          t("demo.pricing.featureCommunity"),
                        ],
                        cta: t("demo.pricing.freeCta"),
                      }),
                      plan({
                        name: t("demo.pricing.teamName"),
                        blurb: t("demo.pricing.teamBlurb"),
                        price: money("24"),
                        period: t("demo.pricing.perSeat"),
                        features: [
                          t("demo.pricing.featureUnlimited"),
                          t("demo.pricing.featureReviews"),
                          t("demo.pricing.featureEmail"),
                        ],
                        cta: t("demo.pricing.teamCta"),
                        featured: t("demo.pricing.popular"),
                      }),
                      plan({
                        name: t("demo.pricing.enterpriseName"),
                        blurb: t("demo.pricing.enterpriseBlurb"),
                        price: t("demo.pricing.enterprisePrice"),
                        period: t("demo.pricing.enterprisePeriod"),
                        features: [
                          t("demo.pricing.featureSso"),
                          t("demo.pricing.featureAudit"),
                          t("demo.pricing.featureSla"),
                        ],
                        cta: t("demo.pricing.enterpriseCta"),
                      }),
                    ],
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "sm", tone: "tertiary" },
                    children: t("demo.pricing.footnote"),
                  },
                ],
              },
            },
          },
          siteFooter(t),
        ],
      },
    ],
  };
};
