import type { Snippet } from "../snippet.js";
import { badge, band, button, heading, icon, inline, link, main, navbar, skipLink, stack, table, tag, text } from "./kit.js";

/*
 * PATTERN: a code-hosting repository page (the shape GitHub, GitLab and Codeberg share). Not a copy of
 * any of them: the shape that all of them converge on, built from published signatures with invented
 * content.
 */
export const repoOverviewPattern: Snippet = {
  id: "page-repo-overview",
  level: "page",
  intent:
    "A repository page: name and visibility, the actions that matter, a tab bar of sections, the file listing and an About column.",
  notes: [
    "Pattern: the repository page of a code host. What every instance of it agrees on: ONE h1 (the repository name) carrying its visibility as a Badge, the sections as a tab bar rather than a row of links, the file listing as a real table (a name, a message, a time: three columns that compare across rows) and the project metadata in a column apart from the listing, not above it.",
    "Accessibility, kept over style: the page opens with a skip link to `#main`; the h1 is the first heading and nothing skips a level (h1, then h2 for the two regions); the file listing is a `Table` with a caption and a `scope=\"row\"` header per file, so a screen reader announces the file name with each cell instead of reading an unlabelled grid; the tab bar has its own `aria-label`; every icon-only control carries `aria-label`.",
    "What the pattern deliberately does not do: no star/watch counters as bare numbers beside an icon (an icon plus `12` reads as nothing); the counts live inside the button's own label (`Star 1,204`), so the name and the value are one thing.",
  ],
  tree: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      skipLink(),
      navbar("Forge", [iconButton("search", "Search"), button("New repository", { size: "sm", tone: "accent" })]),
      main(
        stack(
          [
            band(
              [
                inline([heading("acme/widgets", "h1", "h1"), badge("Public", "neutral")], { gap: "sm", inlineAlign: "center" }),
                text("A small, fast widget toolkit for building dashboards.", { tone: "secondary" }),
                inline([button("Watch 38", { variant: "soft", size: "sm" }), button("Fork 212", { variant: "soft", size: "sm" }), button("Star 1,204", { variant: "soft", size: "sm" })], { gap: "sm" }),
              ],
              { surface: "sunken" },
            ),
            band([
              {
                contract: "tabs",
                signature: "Tabs",
                options: { value: "code" },
                attrs: { "aria-label": "Repository sections" },
                slots: {
                  items: [
                    {
                      options: { value: "code" },
                      slots: {
                        label: "Code",
                        children: inline(
                          [
                            { ...stack([heading("Files", "h2", "h2"), table("Files in the default branch", ["Name", "Last commit", "Updated"], [
                              ["src", "Add keyboard handling", "2 days ago"],
                              ["docs", "Rewrite the install guide", "last week"],
                              ["package.json", "Release 2.4.0", "3 weeks ago"],
                              ["README.md", "Fix badge links", "last month"],
                            ])], { gap: "sm" }), attrs: { "data-sizing": "fill" } },
                            { ...stack([heading("About", "h2", "h2"), text("MIT license. Written in TypeScript.", { size: "sm", tone: "secondary" }), inline([tag("ui", "accent"), tag("typescript"), tag("accessibility")], { gap: "xs" }), link("Read the documentation", "#docs")], { gap: "sm" }), attrs: { "data-sizing": "fit" } },
                          ],
                          { gap: "xl", inlineAlign: "start" },
                        ),
                      },
                    },
                    { options: { value: "issues" }, slots: { label: "Issues", children: text("No open issues.") } },
                    { options: { value: "pulls" }, slots: { label: "Pull requests", children: text("No open pull requests.") } },
                  ],
                },
              },
            ]),
          ],
          { gap: "none" },
        ),
      ),
    ],
  },
};

function iconButton(name: string, label: string) {
  return {
    contract: "button",
    signature: "Button.action",
    options: { variant: "ghost", iconOnly: true, size: "sm" },
    attrs: { "aria-label": label },
    children: icon(name),
  };
}
