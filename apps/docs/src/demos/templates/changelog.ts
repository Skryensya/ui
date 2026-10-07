import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { siteFooter } from "./shared";

/*
 * CHANGELOG. The "what changed, newest first" shape. It could be built from Timeline or from
 * headings and lists, and it is neither, because `Changelog` already names the three things a
 * release note is made of:
 *
 *   - a `ChangelogRelease` per version, carrying its date as a real `<time>`;
 *   - a `ChangelogEntry` per change, whose `kind` (feature, bugfix, breaking...) drives its tone
 *     inside the contract. The author says WHAT kind of change it is and never picks a colour, so
 *     a breaking change cannot end up painted like a fix; and
 *   - a visible `kind` label on every entry, so the kind survives without colour.
 *
 * Above it, the subscribe row: a single field and a `soft` button. Following a changelog is a
 * nice-to-have, never the reason someone came to this page, so it stays quieter than the notes.
 */

const entry = (
  kind: "feature" | "bugfix" | "breaking" | "rework",
  kindLabel: string,
  title: string,
  body: string,
): UsageTree => ({
  contract: "changelog",
  signature: "ChangelogEntry",
  options: { kind },
  slots: { kind: kindLabel, title, children: body },
});

export const changelogTree = (t: Translate): UsageTree => {
  const kinds = {
    feature: t("demo.changelog.kindFeature"),
    bugfix: t("demo.changelog.kindBugfix"),
    breaking: t("demo.changelog.kindBreaking"),
    rework: t("demo.changelog.kindRework"),
  };
  return {
    contract: "layout",
    signature: "AppShell",
    children: [
      {
        contract: "navbar",
        signature: "Navbar",
        children: [{ contract: "navbar", signature: "NavbarBrand", children: "Lumen" }],
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
            options: { gap: "lg", gapExpanded: "xl" },
            children: [
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "md" },
                children: [
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: { headingSize: "display-sm", headingElement: "h1", flush: true },
                    children: t("demo.changelog.title"),
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "lg", tone: "secondary" },
                    children: t("demo.changelog.lede"),
                  },
                  {
                    contract: "layout",
                    signature: "Inline",
                    options: { gap: "sm", inlineAlign: "end", wrap: true },
                    children: [
                      {
                        contract: "form-field",
                        signature: "FormField",
                        slots: {
                          label: t("demo.changelog.subscribeLabel"),
                          children: {
                            contract: "input",
                            signature: "Input",
                            options: {
                              type: "email",
                              name: "email",
                              placeholder: t("demo.changelog.subscribePlaceholder"),
                            },
                          },
                        },
                      },
                      {
                        contract: "button",
                        signature: "Button.action",
                        options: { variant: "soft", type: "submit" },
                        children: t("demo.changelog.subscribe"),
                      },
                    ],
                  },
                ],
              },
              {
                contract: "changelog",
                signature: "Changelog",
                children: [
                  {
                    contract: "changelog",
                    signature: "ChangelogRelease",
                    options: { date: "2026-09-18" },
                    slots: {
                      version: "3.2.0",
                      date: t("demo.changelog.date1"),
                      children: [
                        entry(
                          "feature",
                          kinds.feature,
                          t("demo.changelog.r1e1"),
                          t("demo.changelog.r1e1Body"),
                        ),
                        entry(
                          "feature",
                          kinds.feature,
                          t("demo.changelog.r1e2"),
                          t("demo.changelog.r1e2Body"),
                        ),
                        entry(
                          "bugfix",
                          kinds.bugfix,
                          t("demo.changelog.r1e3"),
                          t("demo.changelog.r1e3Body"),
                        ),
                      ],
                    },
                  },
                  {
                    contract: "changelog",
                    signature: "ChangelogRelease",
                    options: { date: "2026-08-02" },
                    slots: {
                      version: "3.0.0",
                      date: t("demo.changelog.date2"),
                      children: [
                        entry(
                          "breaking",
                          kinds.breaking,
                          t("demo.changelog.r2e1"),
                          t("demo.changelog.r2e1Body"),
                        ),
                        entry(
                          "rework",
                          kinds.rework,
                          t("demo.changelog.r2e2"),
                          t("demo.changelog.r2e2Body"),
                        ),
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      },
      siteFooter(t),
    ],
  };
};
