import type { UsageTree } from "@skryensya/core/usage-tree";
import type { CatalogVariant } from "./catalog-view";

/*
 * THE CATALOG PAGE'S OWN PIECES, written as usage trees. The page is a browser of the kit, so what it is made
 * of is the kit: the advanced search is a FormField around an Input and a Details of Checkbox facets, the applied
 * filters removable Tags, the results a List of ListItemLinks, the record of an example a DescriptionList. The
 * rail is the site's own `SidebarNav`, the one every other catalogue page uses. `catalog-chrome.test.ts` holds
 * these trees to their contracts the way the library's gate holds an example.
 *
 * What the script finds them by is only what the contracts forward: a control's `name` and `value`, a link's
 * `href`, an element's `id`.
 */

type Node = UsageTree | string;
type Opts = Record<string, string | boolean>;

export interface ChromeWords {
  search: string;
  searchPlaceholder: string;
  advanced: string;
  facetSubject: string;
  facetScale: string;
  facetDomain: string;
  facetComponent: string;
  remove: string;
  clearAll: string;
  results: string;
  back: string;
  metaIntent: string;
  metaLayout: string;
  metaComponents: string;
  previous: string;
  next: string;
  pagerLabel: string;
}

const stack = (children: Node[], options: Opts = {}): UsageTree => ({ contract: "layout", signature: "Stack", options, children });
const inline = (children: Node[], options: Opts = {}): UsageTree => ({ contract: "layout", signature: "Inline", options, children });
const text = (children: Node, options: Opts = {}): UsageTree => ({ contract: "typography", signature: "Text", options, children });
const tag = (label: string): UsageTree => ({ contract: "tag", signature: "Tag", options: { tone: "neutral" }, children: label });
const link = (href: string, label: string): UsageTree => ({ contract: "typography", signature: "Link", options: { href }, children: label });
const icon = (name: string): UsageTree => ({ contract: "icon", signature: "Icon", options: { name, size: "sm" } });

export function introTree(title: string, description: string): UsageTree {
  return stack(
    [
      { contract: "typography", signature: "Heading", options: { headingElement: "h1", headingSize: "h1", flush: true }, children: title },
      text(description, { tone: "secondary" }),
    ],
    { gap: "xs" },
  );
}

export interface Caption {
  id: string;
  title: string;
  purpose: string;
  subjectLabel: string;
  scaleLabel: string;
  intentLabel: string;
  layoutLabel: string;
  components: string[];
  relations: CatalogVariant["relations"];
}

/** What sits above the specimen: where it is filed, its name and what it is for. */
export function headerTree(caption: Caption): UsageTree {
  return stack(
    [
      text(`${caption.subjectLabel} · ${caption.scaleLabel}`, { textRole: "eyebrow" }),
      { contract: "typography", signature: "Heading", options: { headingElement: "h2", headingSize: "h2", flush: true }, attrs: { id: `${caption.id}-title` }, children: caption.title },
      text(caption.purpose, { size: "lg", tone: "secondary" }),
    ],
    { gap: "xs" },
  );
}

/** The record under the specimen: its filing, the components it touches and where else to look. */
export function metaTree(words: ChromeWords, caption: Caption): UsageTree {
  const item = (term: string, details: Node): UsageTree => ({ contract: "description-list", signature: "DescriptionItem", slots: { term, children: details } });
  return {
    contract: "description-list",
    signature: "DescriptionList",
    options: { layout: "columns", dividers: true },
    children: [
      item(words.metaIntent, text(caption.intentLabel, { size: "sm" })),
      item(words.metaLayout, text(caption.layoutLabel, { size: "sm" })),
      item(words.metaComponents, inline(caption.components.map(tag), { gap: "xs", wrap: true })),
      ...caption.relations.map((relation) =>
        item(relation.label, inline(relation.items.map((entry) => (entry.shown ? link(`#${entry.id}`, entry.title) : text(entry.title, { size: "sm", tone: "secondary" }))), { gap: "sm", wrap: true })),
      ),
    ],
  };
}

export interface Neighbour {
  id: string;
  title: string;
}

/** The previous and the next example in the rail's order, so the catalogue reads through without the rail. */
export function pagerTree(words: ChromeWords, previous?: Neighbour, next?: Neighbour): UsageTree {
  const step = (neighbour: Neighbour, label: string, direction: "previous" | "next"): UsageTree => ({
    contract: "button",
    signature: "Button.navigation",
    options: { href: `#${neighbour.id}`, variant: "ghost" },
    attrs: { "aria-label": `${label}: ${neighbour.title}` },
    slots: direction === "previous" ? { pre: icon("arrow-left") } : { post: icon("arrow-right") },
    children: neighbour.title,
  });
  return {
    contract: "layout",
    signature: "Inline",
    /* With no previous example the next one still belongs at the end of the row. */
    options: { gap: "sm", justify: previous ? "between" : "end", inlineAlign: "center" },
    attrs: { role: "navigation", "aria-label": words.pagerLabel },
    children: [...(previous ? [step(previous, words.previous, "previous")] : []), ...(next ? [step(next, words.next, "next")] : [])],
  };
}

export const FACETS = ["subject", "scale", "domain", "component"] as const;
export type Facet = (typeof FACETS)[number];

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export type FacetOptions = Record<Facet, FacetOption[]>;

const facetTitle = (words: ChromeWords, facet: Facet) => ({ subject: words.facetSubject, scale: words.facetScale, domain: words.facetDomain, component: words.facetComponent })[facet];

/** One facet: its name over one checkbox per value, each with how many examples carry it. */
function facetTree(words: ChromeWords, facet: Facet, options: FacetOption[]): UsageTree {
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "xs" },
    attrs: { role: "group", "aria-label": facetTitle(words, facet) },
    children: [
      text(facetTitle(words, facet), { size: "sm", weight: "label" }),
      ...options.map((option): UsageTree => ({ contract: "checkbox", signature: "Checkbox", options: { name: facet, value: option.value }, children: `${option.label} (${option.count})` })),
    ],
  };
}

/*
 * THE ADVANCED SEARCH: words that must all appear, then facets that narrow by the filing (any value within a
 * facet, every facet at once), then what is applied, each removable on its own.
 */
export function searchTree(words: ChromeWords, facets: FacetOptions): UsageTree {
  const query: UsageTree = { contract: "form-field", signature: "FormField", options: { labelHidden: true }, slots: { label: words.search, children: { contract: "input", signature: "Input", options: { type: "search", name: "q", placeholder: words.searchPlaceholder } } } };
  const advanced: UsageTree = {
    contract: "accordion",
    signature: "Details",
    children: [
      { contract: "accordion", signature: "Details.Summary", attrs: { id: "catalog-advanced" }, children: words.advanced },
      { contract: "accordion", signature: "Details.Content", children: { contract: "layout", signature: "Grid", options: { columns: "4", responsive: true, gap: "lg" }, children: FACETS.map((facet) => facetTree(words, facet, facets[facet])) } },
    ],
  };
  /* Every chip is in the page from the start; the script shows the ones whose checkbox is checked. */
  const chips = FACETS.flatMap((facet) =>
    facets[facet].map((option): UsageTree => ({ contract: "tag", signature: "Tag", options: { tone: "neutral", removable: true, removeLabel: `${words.remove}: ${option.label}` }, attrs: { id: `catalog-chip-${facet}-${option.value}` }, children: option.label })),
  );
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    attrs: { role: "search", "aria-label": words.search },
    children: [query, advanced, inline([...chips, { contract: "button", signature: "Button.action", options: { variant: "ghost", size: "sm" }, attrs: { id: "catalog-clear" }, children: words.clearAll }], { gap: "xs", wrap: true, inlineAlign: "center" })],
  };
}

export interface ResultRow {
  id: string;
  title: string;
  context: string;
  scaleLabel: string;
}

/** Every example as a result row; the script hides the ones the search leaves out. */
export function resultsTree(words: ChromeWords, rows: ResultRow[]): UsageTree {
  return {
    contract: "list",
    signature: "List",
    options: { dividers: true },
    attrs: { "aria-label": words.results, id: "catalog-results" },
    children: rows.map((row): UsageTree => ({ contract: "list", signature: "ListItemLink", options: { href: `#${row.id}` }, slots: { title: row.title, description: row.context, trailing: tag(row.scaleLabel) } })),
  };
}

/** From an example back to the results that led to it. */
export function backTree(words: ChromeWords): UsageTree {
  return { contract: "button", signature: "Button.navigation", options: { href: "#results", variant: "ghost", size: "sm" }, slots: { pre: icon("arrow-left") }, children: words.back };
}
