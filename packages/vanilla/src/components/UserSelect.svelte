<script lang="ts">
  import {
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { avatarParts } from "@skryensya/core/avatar";
  import { comboboxParts } from "@skryensya/core/combobox";
  import { select } from "@skryensya/core/machines";
  import { selectAttrs, selectParts, selectPositioning, type SelectOption } from "@skryensya/core/select";
  import { selectorsFor } from "@skryensya/core/selectors";
  import { selectionParts } from "@skryensya/core/selection";
  import {
    userSelectAttrs,
    userSelectEvents,
    userSelectLabel,
    userSelectLabels,
    userSelectSearchKey,
    type UserSelectLabels,
  } from "@skryensya/core/user-select";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { remountIcons } from "../icon.js";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * USER SELECT, a machine-backed enhancer over `@zag-js/select` (the SAME machine `Select.svelte`
   * uses, always `multiple: true` and `composite: false` here - see the React binding's own note on
   * why: it splits Zag's markup into a `role="dialog"` wrapper that can hold a real search field
   * (`content`, patched below) and a nested `role="listbox"` around the rows alone (`list`, generated
   * around whatever the author wrote).
   *
   * Every row stays hand-authored, avatar included: this enhancer never builds a row, it only reads
   * `data-value`, the item-text node and the description (the email) off it, same as `Select.svelte`
   * reads its own items. The markup it expects is `userSelectContract`'s template; the parts that
   * template lists but an author left out (the list wrapper, the status, the empty row, the footer,
   * each row's checkbox) are generated in the same shape, so G2 sees one DOM either way. The ONE thing it renders is the trigger's live avatar summary, because that has no
   * authored form (it changes with the selection) - and even that clones the AUTHORED avatar off the
   * matching row rather than re-deriving one, so initials-vs-photo stays Avatar's call, never this
   * file's.
   */
  const root = getRoot();

  const selector = selectorsFor(selectAttrs);
  const own = selectorsFor(userSelectAttrs);

  /*
   * The same string table React reads (`userSelectLabels`), overridden from the root: `data-term`
   * for the noun, `data-placeholder` and `data-search-placeholder` under their existing names, and
   * `data-<key>-label` for every other key (`data-clear-label`, `data-count-label`, ...).
   */
  const labels = { ...userSelectLabels } as UserSelectLabels;
  for (const key of Object.keys(userSelectLabels) as (keyof UserSelectLabels)[]) {
    const attr = key === "term" || key === "placeholder" || key === "searchPlaceholder" ? key : `${key}Label`;
    const authoredLabel = root.dataset[attr];
    if (authoredLabel) labels[key] = authoredLabel;
  }
  const label = (key: Exclude<keyof UserSelectLabels, "term">, values?: Record<string, string | number>) =>
    userSelectLabel(labels, key, values);

  const control = root.querySelector<HTMLElement>(selector.control);
  const trigger = root.querySelector<HTMLElement>(selector.trigger);
  const valueEl = root.querySelector<HTMLElement>(selector.value);
  const indicatorEl = root.querySelector<HTMLElement>(selector.indicator);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const content = root.querySelector<HTMLElement>(selector.content);
  const search = root.querySelector<HTMLInputElement>(own.search);
  const hidden = root.querySelector<HTMLSelectElement>(selector.hidden);

  if (!trigger) throw new Error("UserSelect requires a [data-sk-select-trigger] element.");
  if (!content) throw new Error("UserSelect requires a [data-sk-select-content] element.");
  if (!valueEl) throw new Error("UserSelect requires a [data-sk-select-value] element.");
  if (!search) throw new Error("UserSelect requires a [data-sk-user-select-search] element.");

  type Authored = {
    node: HTMLElement;
    item: SelectOption;
    key: string;
    avatar: HTMLElement | null;
    text: HTMLElement | null;
    indicator: HTMLElement | null;
  };

  // Multiple selection shows a leading checkbox on every row. Decorative (the option's own
  // `aria-selected` is the state) and checked from the row's `data-state` in CSS, so it is inserted
  // once and never touched again. An authored one is kept as it is.
  const ensureCheck = (node: HTMLElement) => {
    if (node.querySelector(own.check)) return;
    const box = document.createElement("span");
    box.className = selectionParts.checkbox;
    box.setAttribute(userSelectAttrs.check, "");
    box.setAttribute("aria-hidden", "true");
    const control = document.createElement("span");
    control.className = selectionParts.checkboxControl;
    const indicator = document.createElement("span");
    indicator.className = selectionParts.checkboxIndicator;
    indicator.dataset.state = "checked";
    const glyph = document.createElement("span");
    glyph.dataset.skIcon = "check";
    glyph.dataset.skIconSize = "sm";
    indicator.append(glyph);
    control.append(indicator);
    box.append(control);
    node.prepend(box);
    remountIcons(box);
  };

  const readItem = (node: HTMLElement): Authored => {
    ensureCheck(node);
    const value = node.dataset.value;
    if (!value) throw new Error("Every [data-sk-select-item] needs a non-empty data-value.");
    const text = node.querySelector<HTMLElement>(selector.itemText) ?? node;
    const label = text.textContent?.trim() || value;
    const email = node.querySelector(`.${comboboxParts.itemDescription}`)?.textContent?.trim() ?? node.dataset.email ?? "";
    return {
      node,
      item: { value, label, disabled: node.hasAttribute("data-disabled") },
      key: userSelectSearchKey(`${label} ${email}`),
      avatar: node.querySelector<HTMLElement>(`.${avatarParts.root}`),
      text: node.querySelector<HTMLElement>(selector.itemText),
      indicator: node.querySelector<HTMLElement>(selector.itemIndicator),
    };
  };

  const authored: Authored[] = Array.from(root.querySelectorAll<HTMLElement>(selector.item)).map(readItem);
  const authoredByValue = new Map(authored.map((row) => [row.item.value, row]));

  function assertHiddenSelectMatches(hiddenSelect: HTMLSelectElement, items: readonly Authored[]): void {
    const got = Array.from(hiddenSelect.options).map((option) => option.value);
    const expected = items.map((row) => row.item.value);
    if (got.join(" ") !== expected.join(" "))
      throw new Error(`UserSelect hidden select drifted from its items: [${got.join(", ")}] vs [${expected.join(", ")}].`);
  }
  if (hidden) assertHiddenSelectMatches(hidden, authored);

  // The rows stay exactly where the author put them; ONLY the wrapper around them is generated. A
  // `role="listbox"` (`composite: false`'s `getListProps()`) belongs on this element, never on
  // `content`, which also holds the search field - a listbox's only valid children are its options.
  let listEl = root.querySelector<HTMLElement>(own.list);
  if (!listEl) {
    listEl = document.createElement("div");
    listEl.setAttribute(userSelectAttrs.list, "");
    if (authored[0]) {
      authored[0].node.before(listEl);
      listEl.append(...authored.map((row) => row.node));
    } else {
      content.append(listEl);
    }
  }
  // The rows scroll inside their own fixed-height well, with the kit's scrollbar, so the search
  // field above and the footer below stay put while the list moves.
  listEl.classList.add("sk-scrollbar");

  // Inside the list, after the rows, so "nothing matches" sits in the list's own fixed height
  // instead of under an empty well. `role="presentation"`: a listbox's children are options.
  let emptyEl = root.querySelector<HTMLElement>(own.empty);
  if (!emptyEl) {
    emptyEl = document.createElement("div");
    emptyEl.className = comboboxParts.empty;
    emptyEl.setAttribute(userSelectAttrs.empty, "");
    emptyEl.setAttribute("role", "presentation");
    listEl.append(emptyEl);
  }
  // Icon, title and hint; authored ones are kept, missing ones are generated.
  const emptyPart = (attr: string, make: () => HTMLElement) => {
    let node = emptyEl!.querySelector<HTMLElement>(`[${attr}]`);
    if (!node) {
      node = make();
      node.setAttribute(attr, "");
      emptyEl!.append(node);
    }
    return node;
  };
  // An authored empty row without the structure (bare text) is emptied; the parts below replace it.
  if (!emptyEl.querySelector(own.emptyTitle)) emptyEl.replaceChildren();
  const emptyIconEl = emptyPart(userSelectAttrs.emptyIcon, () => {
    const node = document.createElement("span");
    node.setAttribute("aria-hidden", "true");
    return node;
  });
  const emptyTitleEl = emptyPart(userSelectAttrs.emptyTitle, () => document.createElement("span"));
  const emptyHintEl = emptyPart(userSelectAttrs.emptyHint, () => document.createElement("span"));
  // The authored glyph's name, placeholder or already upgraded (`data-icon` on the svg), so a row the
  // template drew is kept rather than redrawn.
  let emptyIconName =
    emptyIconEl.querySelector("[data-sk-icon]")?.getAttribute("data-sk-icon") ??
    emptyIconEl.querySelector("[data-icon]")?.getAttribute("data-icon") ??
    "";
  const setEmptyIcon = (name: string) => {
    if (name === emptyIconName) return;
    emptyIconName = name;
    // A fresh placeholder each time: the icon set upgrades new `data-sk-icon` nodes, not a renamed one
    // it already upgraded.
    const glyph = document.createElement("span");
    glyph.dataset.skIcon = name;
    glyph.dataset.skIconSize = "md";
    emptyIconEl.replaceChildren(glyph);
    remountIcons(emptyIconEl);
  };

  let statusEl = root.querySelector<HTMLElement>(own.status);
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = `${comboboxParts.status} sk-visually-hidden`;
    statusEl.setAttribute(userSelectAttrs.status, "");
    statusEl.setAttribute("role", "status");
    statusEl.setAttribute("aria-atomic", "true");
    // Right after the search field, where the template has it.
    search.after(statusEl);
  }

  let footerEl = root.querySelector<HTMLElement>(own.footer);
  let countEl = footerEl?.querySelector<HTMLElement>(own.count) ?? null;
  let clearEl = footerEl?.querySelector<HTMLButtonElement>(own.clear) ?? null;
  if (!footerEl) {
    footerEl = document.createElement("span");
    footerEl.className = "sk-inline";
    footerEl.dataset.align = "center";
    footerEl.dataset.gap = "sm";
    footerEl.dataset.justify = "between";
    footerEl.setAttribute(userSelectAttrs.footer, "");

    countEl = document.createElement("span");
    countEl.className = "sk-text";
    countEl.dataset.size = "caption";
    countEl.dataset.tone = "secondary";
    countEl.setAttribute(userSelectAttrs.count, "");

    clearEl = document.createElement("button");
    clearEl.className = "sk-button sk-interactive";
    clearEl.dataset.variant = "ghost";
    clearEl.dataset.size = "sm";
    clearEl.type = "button";
    clearEl.setAttribute(userSelectAttrs.clear, "");

    footerEl.append(countEl, clearEl);
    content.append(footerEl);
  }

  const placeholder = label("placeholder");
  const unselectedLabel = label("unselected");
  if (!search.placeholder) search.placeholder = label("searchPlaceholder");
  if (!search.hasAttribute("aria-label")) search.setAttribute("aria-label", search.placeholder);
  if (root.hasAttribute("data-disabled")) search.disabled = true;
  if (clearEl && !clearEl.textContent?.trim()) clearEl.textContent = label("clear");
  const maxAvatars = Number(root.dataset.maxAvatars) || 3;

  const emptyMessage = () =>
    authored.length === 0
      ? label("empty")
      : label("noResults", { query: query.trim() });

  const resultText = (count: number) => {
    if (count === 0) return emptyMessage();
    return count === 1 ? label("result") : label("results", { count });
  };

  const makeCollection = (items: SelectOption[]) =>
    select.collection<SelectOption>({
      items,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => Boolean(item.disabled),
    });

  // `$state.raw`: always REPLACED wholesale by a filter pass, never mutated row by row.
  let visible = $state.raw(authored);
  let query = $state("");
  /*
   * SELECTED FIRST, decided when the list OPENS and then held: whoever was already picked sits at the
   * top, but ticking a row while the list is open never moves it out from under the pointer. The rows
   * are moved, not rebuilt, so every authored node and its bindings stay the same element.
   */
  let ordered: Authored[] = authored;
  const pinSelected = (values: readonly string[]) => {
    const first = new Set(values);
    ordered = [...authored.filter((row) => first.has(row.item.value)), ...authored.filter((row) => !first.has(row.item.value))];
    listEl!.prepend(...ordered.map((row) => row.node));
    // A new order starts at its top: a scroll offset kept from the last open would land mid-list.
    listEl!.scrollTop = 0;
  };

  const filterAuthoredItems = (value: string) => {
    const needle = userSelectSearchKey(value.trim());
    const next = needle ? ordered.filter((row) => row.key.includes(needle)) : ordered;
    visible = next;
    const shown = new Set(next);
    for (const row of authored) {
      const hiddenNow = !shown.has(row);
      if (row.node.hidden !== hiddenNow) row.node.hidden = hiddenNow;
    }
  };

  const collection = $derived(makeCollection(visible.map((row) => row.item)));

  const readDefaultValue = (): string[] | undefined => {
    const value = root.dataset.value;
    return value ? value.split(" ").filter(Boolean) : undefined;
  };

  const machineId = root.id || uniqueId("sk-user-select");
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(machineId) : null;
  let unbindAnchor: (() => void) | undefined;

  const service = useMachine(select.machine, () => ({
    id: machineId,
    collection,
    name: hidden?.name ?? root.dataset.name,
    multiple: true,
    composite: false,
    // Multiple selection defaults this to false already; stated explicitly because "does not close
    // on select" is the one behavior this whole component depends on.
    closeOnSelect: false,
    disabled: root.hasAttribute("data-disabled"),
    defaultValue: readDefaultValue(),
    positioning: { ...selectPositioning, boundary: root.closest("dialog") ? document.documentElement : undefined },
    // The clear button's accessible name is its visible text, not Zag's own "Clear value".
    translations: { clearTriggerLabel: clearEl?.textContent?.trim() || label("clear") },
    onValueChange(details: { value: string[] }) {
      root.dispatchEvent(new CustomEvent(userSelectEvents.valueChange, { bubbles: true, detail: { value: details.value } }));
    },
  }));

  const api = $derived(select.connect(service, normalizeProps));

  const selectedRows = () => api.value.map((value) => authoredByValue.get(value)).filter((row): row is Authored => row != null);

  const triggerLabel = () => {
    const selected = selectedRows();
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return `${placeholder}, ${label("selectedOne", { name: selected[0]!.item.label })}`;
    return `${placeholder}, ${label("selectedMany", { count: selected.length })}`;
  };

  // `null`, not "": an empty selection's key IS "", and the first render must still paint the empty state.
  let renderedKey: string | null = null;
  const renderTriggerValue = () => {
    const selected = selectedRows();
    const nextKey = selected.map((row) => row.item.value).join(" ");
    if (nextKey === renderedKey) return;
    renderedKey = nextKey;

    valueEl.replaceChildren();
    if (selected.length === 0) {
      // An empty dashed disc where the faces go, then the label. The icon is a `data-sk-icon`
      // placeholder the page's own icon set upgrades, like every other generated glyph here.
      const empty = document.createElement("span");
      empty.setAttribute(userSelectAttrs.unselected, "");
      const disc = document.createElement("span");
      disc.className = avatarParts.root;
      disc.dataset.size = "sm";
      const glyph = document.createElement("span");
      glyph.dataset.skIcon = "user";
      glyph.dataset.skIconSize = "sm";
      disc.append(glyph);
      empty.append(disc, unselectedLabel);
      valueEl.append(empty);
      remountIcons(valueEl);
      return;
    }

    const wrap = document.createElement("span");
    wrap.className = "sk-inline";
    wrap.dataset.align = "center";
    wrap.dataset.gap = "sm";
    wrap.dataset.wrap = "false";

    if (selected.length === 1) {
      const avatar = selected[0]!.avatar?.cloneNode(true) as HTMLElement | undefined;
      if (avatar) wrap.append(avatar);
    } else {
      const group = document.createElement("div");
      group.className = avatarParts.group;
      group.setAttribute("role", "group");
      const shown = selected.slice(0, maxAvatars);
      for (const row of shown) {
        const avatar = row.avatar?.cloneNode(true) as HTMLElement | undefined;
        if (avatar) group.append(avatar);
      }
      const overflow = selected.length - shown.length;
      if (overflow > 0) {
        const badge = document.createElement("span");
        badge.className = avatarParts.groupOverflow;
        badge.textContent = `+${overflow}`;
        group.append(badge);
      }
      wrap.append(group);
    }

    const text = document.createElement("span");
    text.className = selectParts.value;
    text.textContent = selected.length === 1 ? selected[0]!.item.label : label("count", { count: selected.length });
    wrap.append(text);
    valueEl.append(wrap);
  };

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "hiddenSelect", node: () => hidden, props: () => (hidden ? api.getHiddenSelectProps() : null) },
    { part: "control", node: () => control, props: () => api.getControlProps() },
    {
      part: "trigger",
      node: () => trigger,
      props: () => api.getTriggerProps(),
      events: true,
      after: (node) => {
        node.setAttribute("aria-label", triggerLabel());
        node.removeAttribute("aria-labelledby");
      },
    },
    {
      part: "valueText",
      node: () => valueEl,
      props: () => ({ "aria-hidden": "true" }),
      after: () => renderTriggerValue(),
    },
    { part: "indicator", node: () => indicatorEl, props: () => api.getIndicatorProps() },
    {
      part: "positioner",
      node: () => positioner,
      props: () => {
        const props = api.getPositionerProps();
        return anchorName ? stripPositioningStyle(props) : props;
      },
      after: (node) => {
        if (anchorName) unbindAnchor = bindAnchor(trigger, node, anchorName);
      },
    },
    { part: "content", node: () => content, props: () => api.getContentProps(), events: true },
    {
      // `composite: false` puts the listbox role, `aria-multiselectable` and `aria-activedescendant`
      // here, on the wrapper around the rows, never on `content`.
      part: "list",
      node: () => listEl,
      props: () => api.getListProps(),
      after: (node) => {
        // `getListProps()` defaults this to a real tab stop (its OTHER use case: a standalone
        // listbox). Here the search field is the one real tab stop; the list is reached through it
        // via `aria-activedescendant`, never by Tab.
        node.setAttribute("tabindex", "-1");
      },
    },
    {
      part: "empty",
      node: () => emptyEl,
      props: () => ({}),
      after: (node) => {
        node.hidden = visible.length > 0;
        const noRoster = authored.length === 0;
        setEmptyIcon(noRoster ? "user" : "search");
        emptyTitleEl.textContent = emptyMessage();
        emptyHintEl.textContent = noRoster ? "" : label("noResultsHint");
        emptyHintEl.hidden = noRoster;
      },
    },
    {
      part: "status",
      node: () => statusEl,
      props: () => ({}),
      after: (node) => {
        const text = api.open ? resultText(visible.length) : "";
        if (node.textContent !== text) node.textContent = text;
      },
    },
    {
      part: "footer",
      node: () => footerEl,
      props: () => ({}),
      after: (node) => {
        node.hidden = api.value.length === 0;
      },
    },
    {
      part: "count",
      node: () => countEl,
      props: () => ({}),
      after: (node) => {
        node.textContent = label("selectedCount", { count: api.value.length });
      },
    },
    { part: "clear", node: () => clearEl, props: () => api.getClearTriggerProps(), events: true },
  ];

  bindParts(bindings);

  /*
   * ── The rows stay hand-written ───────────────────────────────────────────────────────────────
   * Same precedent as `Combobox.svelte`'s own note: `dirtyItems()` is a diff that MUTATES
   * `appliedHighlight` / `appliedSelection` / `patchedOnce`, so it is only correct called once per
   * round - one binding per row would call it once per row, each call after the first consuming a
   * set the previous one already emptied.
   */
  let appliedHighlight: string | null = null;
  let appliedSelection = new Set<string>();
  let patchedOnce = false;
  const dirtyItems = (): Authored[] => {
    const selection = new Set(api.value);
    if (!patchedOnce) {
      patchedOnce = true;
      appliedHighlight = api.highlightedValue;
      appliedSelection = selection;
      return authored;
    }
    const dirty = new Set<string>();
    if (appliedHighlight !== api.highlightedValue) {
      if (appliedHighlight != null) dirty.add(appliedHighlight);
      if (api.highlightedValue != null) dirty.add(api.highlightedValue);
      appliedHighlight = api.highlightedValue;
    }
    for (const value of selection) if (!appliedSelection.has(value)) dirty.add(value);
    for (const value of appliedSelection) if (!selection.has(value)) dirty.add(value);
    appliedSelection = selection;
    if (dirty.size === 0) return [];
    return authored.filter((row) => dirty.has(row.item.value));
  };

  $effect(() => {
    for (const row of dirtyItems()) {
      applyZagProps(row.node, api.getItemProps({ item: row.item }) as DomProps);
      if (row.text) applyZagProps(row.text, api.getItemTextProps({ item: row.item }) as DomProps);
      if (row.indicator) applyZagProps(row.indicator, api.getItemIndicatorProps({ item: row.item }) as DomProps);
    }
  });

  // The search field is never Zag-managed (the select machine has no input of its own): typing
  // filters the AUTHORED rows, same source of truth as everywhere else in this file. Space is
  // stopped from bubbling into `content`'s own keydown handler, which otherwise reads it as
  // "toggle the highlighted row" (correct for a bare listbox, wrong for a field where someone is
  // typing "Jane Cooper"); Enter, the arrows, Home and End all still reach it untouched.
  let wasOpen = false;
  const cleanups: Array<() => void> = [];
  onMount(() => {
    for (const row of authored) cleanups.push(bindZagEvents(row.node, () => api.getItemProps({ item: row.item }) as DomProps));

    const onInput = () => {
      query = search.value;
      filterAuthoredItems(query);
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === " ") event.stopPropagation();
    };
    search.addEventListener("input", onInput);
    search.addEventListener("keydown", onKeydown);
    cleanups.push(
      () => search.removeEventListener("input", onInput),
      () => search.removeEventListener("keydown", onKeydown),
    );
  });

  // Every open starts from the full roster, never a stale filtered view. Cleared on OPEN rather than on
  // close: closing is an exit transition, and clearing then brought every filtered-out row back into
  // the box while it was still fading out.
  $effect(() => {
    if (!wasOpen && api.open) {
      query = "";
      search.value = "";
      pinSelected(api.value);
      filterAuthoredItems("");
    }
    wasOpen = api.open;
  });

  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>
