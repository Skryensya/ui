<script lang="ts">
  import {
    selectAttrs,
    selectEvents,
    selectPositioning,
    type SelectOption,
    type SelectValueChangeDetails,
  } from "@skryensya/core/select";
  import { select } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { mount } from "svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { selectorsFor } from "@skryensya/core/selectors";
  import SelectItems from "./SelectItems.svelte";

  /*
   * SELECT, a machine-backed enhancer over `@zag-js/select` (the SAME machine React uses, via
   * `@skryensya/core/machines`). It renders no structure: it scans its authored markup (label,
   * control, trigger, positioner, content, items, and the optional hidden `<select>`) and patches the
   * attributes `connect` returns onto those nodes.
   *
   * There is no native equivalent for a listbox with typeahead, highlighting and controlled placement
   * (decision 8), so a machine earns its place, the same one React uses.
   */
  const root = getRoot();

  /* Derived from the contract's own mount attributes; see `selectorsFor`. */
  const selector = selectorsFor(selectAttrs);

  const trigger = root.querySelector<HTMLElement>(selector.trigger);
  const valueEl = root.querySelector<HTMLElement>(selector.value);
  const content = root.querySelector<HTMLElement>(selector.content);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const hidden = root.querySelector<HTMLSelectElement>(selector.hidden);

  if (!trigger) throw new Error("Select requires a [data-sk-select-trigger] element.");
  if (!content) throw new Error("Select requires a [data-sk-select-content] element.");

  function readItem(el: HTMLElement): SelectOption {
    const value = el.dataset.value;
    if (!value) throw new Error("Every [data-sk-select-item] needs a non-empty data-value.");

    const text = el.querySelector<HTMLElement>(selector.itemText) ?? el;

    return {
      value,
      label: text.textContent?.trim() || value,
      disabled: el.hasAttribute("data-disabled"),
    };
  }

  /*
   * The hidden select is optional, it is what makes the menu submit inside a form, and what a no-JS
   * visitor is left with. When it is there it must agree with the items, because two authored lists
   * that drift render a menu that submits a different value than it shows.
   */
  function assertHiddenSelectMatches(hidden: HTMLSelectElement, items: readonly SelectOption[]): void {
    const authored = Array.from(hidden.options).map((option) => option.value);
    const expected = items.map((item) => item.value);

    if (authored.join(" ") !== expected.join(" ")) {
      throw new Error(
        `Select hidden select drifted from its items: [${authored.join(", ")}] vs [${expected.join(", ")}].`,
      );
    }
  }

  /*
   * THE OTHER WAY IN: a list too large to hand-author as `<li>`s (see `selectAttrs.items`'s own
   * comment and `SelectItems.svelte`, which renders and virtualizes it). `data-sk-select-items`
   * names a `<script type="application/json">`, the same convention `command-palette.ts`'s
   * `readIndex` already uses for its own index.
   */
  function readGeneratedItems(scriptId: string): SelectOption[] {
    const script = document.getElementById(scriptId);
    if (!script) {
      throw new Error(`Select's [${selectAttrs.items}] names a script "${scriptId}" that does not exist.`);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(script.textContent || "[]");
    } catch {
      throw new Error(`Select's [${selectAttrs.items}] script "${scriptId}" is not valid JSON.`);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`Select's [${selectAttrs.items}] script "${scriptId}" must hold a JSON array.`);
    }
    return parsed as SelectOption[];
  }

  /** Can't be authored for a list this size either, so it is generated the same way. */
  function generateHiddenOptions(select: HTMLSelectElement, items: readonly SelectOption[]): void {
    select.replaceChildren(
      ...items.map((item) => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        option.disabled = Boolean(item.disabled);
        return option;
      }),
    );
  }

  const itemsScriptId = root.getAttribute(selectAttrs.items);
  const itemEls = itemsScriptId ? [] : Array.from(root.querySelectorAll<HTMLElement>(selector.item));
  if (!itemsScriptId && itemEls.length === 0) {
    throw new Error(`Select requires at least one [data-sk-select-item], or a [${selectAttrs.items}] script id.`);
  }

  const items = itemsScriptId ? readGeneratedItems(itemsScriptId) : itemEls.map(readItem);
  if (hidden) {
    if (itemsScriptId) generateHiddenOptions(hidden, items);
    else assertHiddenSelectMatches(hidden, items);
  }

  const collection = select.collection<SelectOption>({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => Boolean(item.disabled),
  });

  /*
   * Only the virtualized path ever fills this - `SelectItems.svelte`'s `onReady` sets it once it has
   * built its own virtualizer. `useMachine`'s own options are read through a getter (`() => ({...})`
   * below), so this starting `undefined` and becoming real a tick after `useMachine` is called is not
   * a race: nothing calls `scrollToIndexFn` before a keypress gives it a reason to.
   */
  let scrollToIndexRef: ((index: number, options?: { align?: string; behavior?: string }) => void) | undefined =
    $state(undefined);

  const placeholder = root.dataset.placeholder ?? "";
  // Captured ONCE, never re-read from the DOM: `getRootProps().id` returns a namespaced id
  // (`select:${id}`) that `applyZagProps` writes back onto `root.id`. Reading `root.id` live from
  // `useMachine`'s reactive factory would feed that prefix back on every recomputation. The imperative
  // original never mutated `root.id`; this reproduces the same thing.
  const selectId = root.id || uniqueId("sk-select");

  /* Only the parts the consumer gave an id to; the rest still belong to the machine. */
  function authoredIds(): Record<string, string> {
    const ids: Record<string, string> = {};
    const claim = (key: string, el: HTMLElement | null) => {
      if (el?.id) ids[key] = el.id;
    };

    claim("root", root);
    claim("trigger", trigger);
    claim("content", content);
    claim("hiddenSelect", hidden);
    claim("control", root.querySelector(selector.control));
    claim("label", root.querySelector(selector.label));
    claim("positioner", root.querySelector(selector.positioner));

    return ids;
  }

  const readDefaultValue = (): string[] | undefined => {
    const value = root.dataset.value;
    return value ? [value] : undefined;
  };

  // Captured ONCE, before the machine writes anything: reading this live inside the reactive factory
  // would start claiming as "authored" the ids the machine itself generated on the first render.
  const ids = authoredIds();

  const service = useMachine(select.machine, () => ({
    id: selectId,
    // Authored ids win. Left to itself the machine derives its own (`select:brand`) and spreads
    // them over whatever the consumer wrote, so an id they authored would silently change the
    // moment this mounts.
    ids,
    collection,
    name: hidden?.name ?? root.dataset.name,
    disabled: root.hasAttribute("data-disabled"),
    required: root.hasAttribute("data-required"),
    defaultValue: readDefaultValue(),
    /* Shared with React (`selectPositioning`); `boundary` stays here because it is a DOM lookup and
     * the shared const holds no DOM. */
    positioning: { ...selectPositioning, boundary: root.closest("dialog") ? document.documentElement : undefined },
    scrollToIndexFn: itemsScriptId
      ? (details: { index: number; immediate?: boolean }) =>
          scrollToIndexRef?.(details.index, { align: "auto", behavior: details.immediate ? "auto" : "smooth" })
      : undefined,
    onValueChange(details: { value: string[] }) {
      const change: SelectValueChangeDetails = { value: details.value };
      root.dispatchEvent(
        new CustomEvent<SelectValueChangeDetails>(selectEvents.valueChange, { bubbles: true, detail: change }),
      );
    },
  }));

  const api = $derived(select.connect(service, normalizeProps));

  // Hoisted out of the patch: these are authored markup, so they are found once rather than re-queried
  // on every state change.
  const labelEl = root.querySelector<HTMLElement>(selector.label);
  const controlEl = root.querySelector<HTMLElement>(selector.control);
  const indicatorEl = root.querySelector<HTMLElement>(selector.indicator);

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "hiddenSelect", node: () => hidden, props: () => api.getHiddenSelectProps() },
    { part: "label", node: () => labelEl, props: () => api.getLabelProps() },
    { part: "control", node: () => controlEl, props: () => api.getControlProps() },
    { part: "trigger", node: () => trigger, props: () => api.getTriggerProps(), events: true },
    {
      part: "valueText",
      node: () => valueEl,
      props: () => api.getValueTextProps(),
      after: (node) => {
        /* The displayed value is the machine's, it changes on every selection, so this is the one
         * place this writes CONTENT rather than attributes. The placeholder is still theirs. */
        node.textContent = api.valueAsString || placeholder;
      },
    },
    { part: "indicator", node: () => indicatorEl, props: () => api.getIndicatorProps() },
    {
      part: "positioner",
      node: () => positioner,
      props: () => api.getPositionerProps(),
    },
    { part: "content", node: () => content, props: () => api.getContentProps(), events: true },

    ...itemEls.flatMap((el, index): PartBinding[] => {
      const item = items[index]!;
      return [
        {
          part: "item",
          node: () => el,
          events: true,
          /*
           * Zag's `aria-selected` tracks the COMMITTED value, not the row under
           * `aria-activedescendant`. The WAI reference implementation moves `aria-selected="true"`
           * onto whichever option is highlighted as you arrow through the list, before Enter commits
           * anything.
           *
           * Spread into a new object rather than mutated in place: the correction is the same, and a
           * fresh plain object is what lets this stay free of casts.
           */
          props: () => ({
            ...api.getItemProps({ item }),
            "aria-selected": item.value === api.highlightedValue ? "true" : undefined,
          }),
        },
        {
          part: "itemText",
          node: () => el.querySelector<HTMLElement>(selector.itemText),
          props: () => api.getItemTextProps({ item }),
        },
        {
          part: "itemIndicator",
          node: () => el.querySelector<HTMLElement>(selector.itemIndicator),
          props: () => api.getItemIndicatorProps({ item }),
        },
      ];
    }),
  ];

  bindParts(bindings);

  /*
   * THE VIRTUALIZED ROWS, mounted directly onto `content` - see `SelectItems.svelte`'s own banner
   * for why that needs a second `mount()` rather than a template slot here.
   */
  if (itemsScriptId) {
    content.style.position = "relative";
    mount(SelectItems, {
      target: content,
      props: {
        items,
        scrollElement: content,
        getApi: () => api,
        /* `--size-touch-target` (`primitives/_size.scss`): every item's own `min-block-size`. */
        estimateItemSize: 44,
        onReady: (scrollToIndex) => {
          scrollToIndexRef = scrollToIndex;
        },
      },
    });
  }
</script>
