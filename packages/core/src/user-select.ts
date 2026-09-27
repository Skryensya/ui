/*
 * USER SELECT, the pieces shared between the React and Vanilla bindings of a people-picker composed
 * entirely from Select, Combobox and Avatar's own primitives (see each binding for the composition
 * itself: `@skryensya/react/user-select`, `packages/vanilla/src/components/UserSelect.svelte`).
 *
 * Nothing here is a new visual part. The trigger, its control, the positioner, the content box and
 * every item row stay `@skryensya/core/select`'s own `selectAttrs`/`selectParts`; search and item
 * description styling stay `@skryensya/core/combobox`'s. `userSelectAttrs` names only the handful of
 * mount points genuinely new to this composition: the root (its own, so mounting it can never collide
 * with a plain `Select` on the same page), the search field, the list wrapper `composite: false` needs
 * around the rows, and the optional "N selected · Clear all" footer.
 *
 * NO `ComponentContract` HERE, on purpose. Every other file in this shape (`select.ts`, `combobox.ts`,
 * `avatar.ts`) ends in one, which is what a compiled contract, a canonical usage tree
 * (`packages/ai-gates/src/trees.ts`) and the Vanilla auto-loader's registry all key off. This
 * composition paints entirely with THEIR classes, so it earns no new sheet of its own to publish a
 * contract for; adding one only to satisfy the pipeline would be a contract that describes no CSS.
 * The one real cost: `mountUserSelect` (Vanilla) stays out of `initComponents()`'s own registry, the
 * same shape `@skryensya/editor` already carries for its own, different reason (an optional peer
 * dependency) - a page authoring `[data-sk-user-select]` calls `mountUserSelect()` itself.
 */

export const userSelectAttrs = {
  root: "data-sk-user-select",
  search: "data-sk-user-select-search",
  list: "data-sk-user-select-list",
  empty: "data-sk-user-select-empty",
  status: "data-sk-user-select-status",
  footer: "data-sk-user-select-footer",
  count: "data-sk-user-select-count",
  clear: "data-sk-user-select-clear",
  unselected: "data-sk-user-select-unselected",
  check: "data-sk-user-select-check",
  emptyIcon: "data-sk-user-select-empty-icon",
  emptyTitle: "data-sk-user-select-empty-title",
  emptyHint: "data-sk-user-select-empty-hint",
} as const;

export type UserSelectPart = keyof typeof userSelectAttrs;
export type UserSelectAttr = (typeof userSelectAttrs)[UserSelectPart];

/*
 * EVERY STRING THE COMPOSITION WRITES, one table both bindings read, so React and Vanilla never say
 * different things. Each is a template: `{term}` is the noun for what is being picked ("users" by
 * default; "usuarios", "members", "reviewers"...), `{count}`, `{name}` and `{query}` are filled at
 * the point of use. Changing `term` alone relabels an English picker; localizing replaces the
 * sentences too, because a noun cannot carry another language's word order ("No hay usuarios").
 *
 * React takes these as `term` and `labels`; Vanilla as `data-term` and `data-<key>-label` on the root
 * (`data-placeholder` and `data-search-placeholder` keep their existing names).
 */
export const userSelectLabels = {
  term: "users",
  placeholder: "Select {term}",
  searchPlaceholder: "Search {term}...",
  unselected: "No one selected",
  /** The trigger's text beside the avatar stack when two or more are selected. */
  count: "{count} {term}",
  /** The footer's count. */
  selectedCount: "{count} selected",
  /** Appended to the trigger's accessible name: "Select users, Jane Cooper selected". */
  selectedOne: "{name} selected",
  selectedMany: "{count} {term} selected",
  clear: "Clear all",
  empty: "No {term} available",
  /** The search came back empty: the title, then a hint under it. */
  noResults: 'No {term} match "{query}"',
  noResultsHint: "Try another name or email.",
  loading: "Loading {term}...",
  result: "1 result available",
  results: "{count} results available",
} as const;

export type UserSelectLabels = { -readonly [K in keyof typeof userSelectLabels]: string };

/** Fills one template: `{term}` from the labels themselves, the rest from `values`. */
export function userSelectLabel(
  labels: UserSelectLabels,
  key: Exclude<keyof UserSelectLabels, "term">,
  values: Record<string, string | number> = {},
): string {
  let result = labels[key].replaceAll("{term}", labels.term);
  for (const [name, value] of Object.entries(values)) result = result.replaceAll(`{${name}}`, String(value));
  return result;
}

export const userSelectEvents = {
  valueChange: "sk:userselectvaluechange",
} as const;

const combiningMarks = /\p{M}+/gu;

/**
 * Diacritic-insensitive fold: "mar" and "María" match in either binding. One function so the two
 * bindings' search never quietly disagree on what counts as a match.
 */
export function userSelectSearchKey(value: string): string {
  return value.normalize("NFD").replace(combiningMarks, "").toLocaleLowerCase();
}
