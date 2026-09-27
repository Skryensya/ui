import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { siteFooter } from "./shared";
import { blankImage } from "../../examples/card-data";

/*
 * EDITORIAL ARTICLE. The reading shape: one long column, measured tighter than any other template
 * here (`Wrapper` at `sm`), because this page is read line by line rather than scanned. Its
 * appearances all serve that:
 *
 *   - the header is a `Hero` on the `sunken` surface. The marketing landing's hero sells; this one
 *     only frames the title, so it sits BELOW the page's surface instead of on top of it;
 *   - both `Quote` variants appear, each on its own job. `pull` lifts a line the reader has
 *     already met out of the text, in display type with no rule and no caption; `block` (the
 *     default) is somebody else's words, so it keeps its rule and names who said them; and
 *   - the article's own actions are quiet on purpose: "Share" is `variant: "soft"` and "Save" is a
 *     `ghost`. Nothing on a page meant for reading should be louder than the text, so there is no
 *     solid or accent button anywhere on it.
 */

const paragraph = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: text,
});

export const articleTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [{ contract: "navbar", signature: "NavbarBrand", children: "Lumen Journal" }],
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
            contract: "layout",
            signature: "Stack",
            options: { gap: "xl" },
            children: [
              {
                contract: "hero",
                signature: "Hero",
                options: { surface: "sunken" },
                children: {
                  contract: "wrapper",
                  signature: "Wrapper",
                  options: { wrapperSize: "sm" },
                  children: {
                    contract: "layout",
                    signature: "Stack",
                    options: { gap: "md", align: "start" },
                    children: [
                      {
                        contract: "badge",
                        signature: "Badge",
                        options: { tone: "accent" },
                        children: t("demo.article.section"),
                      },
                      {
                        contract: "typography",
                        signature: "Heading",
                        options: { headingSize: "display-sm", headingElement: "h1", flush: true },
                        children: t("demo.article.title"),
                      },
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { size: "lg", tone: "secondary" },
                        children: t("demo.article.dek"),
                      },
                      {
                        contract: "layout",
                        signature: "Inline",
                        options: { gap: "sm", inlineAlign: "center" },
                        children: [
                          {
                            contract: "avatar",
                            signature: "Avatar.initials",
                            options: { name: "Camila Rojas", size: "sm" },
                            children: "CR",
                          },
                          {
                            contract: "typography",
                            signature: "Text",
                            options: { size: "sm", tone: "secondary" },
                            children: t("demo.article.byline"),
                          },
                        ],
                      },
                      {
                        contract: "layout",
                        signature: "Inline",
                        options: { gap: "sm" },
                        children: [
                          {
                            contract: "button",
                            signature: "Button.action",
                            options: { variant: "soft", size: "sm" },
                            children: [
                              {
                                contract: "icon",
                                signature: "Icon",
                                options: { name: "external-link", size: "sm" },
                              },
                              t("demo.article.share"),
                            ],
                          },
                          {
                            contract: "button",
                            signature: "Button.action",
                            options: { variant: "ghost", size: "sm" },
                            children: t("demo.article.save"),
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              {
                contract: "wrapper",
                signature: "Wrapper",
                options: { wrapperSize: "sm" },
                children: {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "lg" },
                  children: [
                    {
                      contract: "image-frame",
                      signature: "ImageFrame",
                      options: {
                        aspect: "16/9",
                        src: blankImage(960, 540, "78716c"),
                        alt: t("demo.article.coverAlt"),
                      },
                    },
                    paragraph(t("demo.article.p1")),
                    paragraph(t("demo.article.p2")),
                    {
                      contract: "quote",
                      signature: "Quote",
                      options: { variant: "pull" },
                      slots: { children: t("demo.article.pull") },
                    },
                    paragraph(t("demo.article.p3")),
                    {
                      contract: "quote",
                      signature: "Quote",
                      slots: {
                        children: t("demo.article.quote"),
                        attribution: t("demo.article.quoteAttribution"),
                        source: t("demo.article.quoteSource"),
                      },
                    },
                    paragraph(t("demo.article.p4")),
                    {
                      contract: "separator",
                      signature: "Separator",
                      // Written out: this page emits without `fillDefaults`, and the rule is drawn off this attribute.
                      options: { orientation: "horizontal" },
                    },
                    {
                      contract: "typography",
                      signature: "Text",
                      options: { size: "sm", tone: "tertiary" },
                      children: t("demo.article.footnote"),
                    },
                  ],
                },
              },
            ],
          },
        },
        siteFooter(t),
      ],
    },
  ],
});
