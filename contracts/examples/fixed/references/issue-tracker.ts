import type { Snippet } from "../snippet.js";
import { avatar, band, button, field, heading, iconButton, inline, input, itemList, main, navbar, skipLink, table, tag, text } from "./kit.js";

/*
 * PATTERN: an issue tracker's list view (what Linear, Jira and GitHub Issues converge on): a filter row
 * over a dense table of work items.
 */
export const issueTrackerPattern: Snippet = {
  id: "page-issue-tracker",
  level: "page",
  intent: "A work-item list: search and filters on top, a dense table of issues with status, priority and owner, and a pager.",
  notes: [
    "Pattern: the dense list view. The data is a table because the reader compares rows by column (status, priority, owner); the filters are above it, grouped as one labelled toolbar, and the count of results is stated in words so a filter that empties the list is not a silent blank.",
    "Accessibility, kept over style: status and priority are words inside a `Tag`, never a coloured dot alone (colour is a second channel, not the only one); the title cell is the row header, so a screen reader announces the issue name with each cell; the search field has a visible label (hidden labels are allowed only when a visible one would repeat the heading); the filter group is a `Segmented` with a label and the sort control is a labelled `Select`.",
    "What the pattern does not do: no infinite scroll with no end (a pager gives the reader a place and a way back) and no row that is clickable as a whole with a second click target inside it.",
  ],
  tree: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      skipLink(),
      navbar("Tracker", [iconButton("add", "Create issue"), avatar("Helena Park")]),
      main(
        band(
            [
              heading("Issues", "h1", "h1"),
              text("42 open issues in Widgets", { tone: "secondary" }),
              inline(
                [
                  field("Search issues", input({ type: "search", name: "q", placeholder: "Search by title or id" })),
                  {
                    contract: "segmented",
                    signature: "Segmented",
                    options: { value: "open", label: "Filter by state" },
                    slots: { items: itemList([["open", "Open"], ["closed", "Closed"], ["all", "All"]]) },
                  },
                  {
                    contract: "select",
                    signature: "Select",
                    options: { name: "sort", value: "updated" },
                    slots: { label: "Sort by", items: itemList([["updated", "Recently updated"], ["priority", "Priority"], ["created", "Newest"]]) },
                  },
                ],
                { gap: "md", inlineAlign: "end" },
              ),
              table(
                "Open issues",
                ["Issue", "Status", "Priority", "Owner"],
                [
                  ["WID-142 Keyboard focus is lost after closing the dialog", tag("In progress", "accent"), tag("High", "danger"), "Priya Nair"],
                  ["WID-139 Table header overlaps the first row on Safari", tag("To do"), tag("Medium", "warning"), "Marcus Webb"],
                  ["WID-131 Document the theming hooks", tag("In review", "accent"), tag("Low"), "Helena Park"],
                  ["WID-127 Sidebar flickers on first paint", tag("Done", "success"), tag("Medium", "warning"), "Priya Nair"],
                ],
              ),
              {
                contract: "pagination",
                signature: "Pagination",
                options: { page: 1, total: 6, label: "Issue pages", previousLabel: "Previous page", nextLabel: "Next page" },
              },
            ],
            { gap: "lg" },
        ),
      ),
    ],
  },
};
void button;
