import type { Snippet } from "../snippet.js";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { band, button, field, heading, inline, input, itemList, link, main, navbar, skipLink, stack, text } from "./kit.js";

/*
 * PATTERN: a search results page (what Google, Bing and DuckDuckGo converge on): the query stays in the box,
 * the results are a list of titled links with an address and a snippet, and a pager ends the list.
 */
const result = (title: string, address: string, snippet: string): UsageTree => ({
  contract: "list",
  signature: "ListItemPlain",
  children: stack([heading(link(title, `https://${address}`), "h3", "h2"), text(address, { size: "sm", tone: "secondary" }), text(snippet)], { gap: "xs" }),
});

export const searchResultsPattern: Snippet = {
  id: "page-search-results",
  level: "page",
  intent: "A results page: the search box with the query still in it, the count in words, a filter, a list of results and a pager.",
  notes: [
    "Pattern: query, count, results. The box keeps what was asked, so it can be refined without retyping; the count says how many results there are in words; each result is the same three lines (a title that is the link, the address it goes to, a snippet that says why it matched) so the list can be scanned by title alone.",
    "Accessibility, kept over style: the search is a named `search` landmark with a visible label and a button that says Search; the page h1 states the query, and each result's title is an h2 and the only link in it, so a screen reader can list the results by heading and every link says where it goes; the results are a real list, so the count is announced on entering it; the filter is a labelled group, and the pager names its own pages.",
    "Compared with Google: the same anatomy, but the title link is the whole of a result's interaction. There is no 'more options' menu that appears only on hover, and no result card that is clickable as a whole with a second link inside it, because both are invisible to a keyboard or a touch screen. Instant suggestions are left out on purpose: a suggestion list is a combobox with its own keyboard contract (see `combobox`), and this page is the results, not the box.",
    "What the pattern does not do: no infinite scroll (the pager gives a place and a way back), no autoplaying media in the list and no ads styled to look like results. 'Results for' carries the query in the heading, and when there are none the page says so and offers a way out instead of showing an empty list.",
  ],
  tree: stack(
    [
      skipLink("Skip to the results"),
      navbar("Searchly", [link("Settings", "#settings")]),
      main(
        band(
          [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm" },
              attrs: { role: "search", "aria-label": "Search the site" },
              children: [inline([field("Search", input({ type: "search", name: "q" })), button("Search", { variant: "solid", tone: "accent", type: "submit" })], { gap: "sm", inlineAlign: "end" })],
            },
            heading("Results for “accessible dropdown”", "h1", "h1"),
            text("4 results", { tone: "secondary" }),
            {
              contract: "segmented",
              signature: "Segmented",
              options: { value: "all", label: "Filter by type" },
              slots: { items: itemList([["all", "All"], ["docs", "Docs"], ["articles", "Articles"]]) },
            },
            {
              contract: "list",
              signature: "List",
              options: { dividers: true },
              children: [
                result("Building an accessible dropdown", "docs.widgets.dev/dropdown", "A dropdown is a button that opens a list of options. This guide covers the keyboard contract, focus handling and the names a screen reader needs."),
                result("Combobox or select?", "widgets.dev/blog/combobox-or-select", "When the options are few, a native select is enough. When people must type to filter, you need a combobox with the right roles."),
                result("Menus are not dropdown selects", "docs.widgets.dev/menu", "A menu runs commands; a select chooses a value. The two have different roles and different keyboard behaviour."),
                result("Testing keyboard support in a dropdown", "widgets.dev/blog/testing-dropdowns", "A checklist for tabbing, arrow keys, typeahead and escape, with the failures people hit most often."),
              ],
            },
            { contract: "pagination", signature: "Pagination", options: { page: 1, total: 5, label: "Result pages", previousLabel: "Previous page", nextLabel: "Next page" } },
          ],
          { gap: "lg" },
        ),
      ),
    ],
    { gap: "none" },
  ),
};
