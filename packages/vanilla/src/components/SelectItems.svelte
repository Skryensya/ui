<script lang="ts">
  import { selectAttrs, selectParts, type SelectOption } from "@skryensya/core/select";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply.js";
  import { createVirtualizer } from "../runtime/virtualizer.svelte.js";
  import { remountIcons } from "../icon.js";

  /*
   * THE ITEMS, generated rather than adopted - the one list `Select.svelte` cannot ask an author to
   * hand-write (`data-sk-select-items`, see its own and `selectAttrs.items`'s comments). Mounted
   * directly onto the already-authored `content` element (`mount(SelectItems, { target: content })`),
   * the same technique `splitter.svelte.ts`'s `attachColumnResizer` uses to mount `ColumnResizer.svelte`
   * onto a handle it creates itself, for the identical reason: a Zag-backed `useMachine` needs a real
   * mounted Svelte component, and there is no template slot in `Select.svelte` that lands inside an
   * element someone else already put in the DOM.
   *
   * Every row still goes through `applyZagProps`/`bindZagEvents`, not a plain `{...props}` spread -
   * the same two primitives `bind-part.svelte.ts` wraps for every OTHER part in this binding. A native
   * Svelte spread does not know Zag's boolean-`aria-*`-stays-present rule or its `onX` handler shape,
   * which is the whole reason that pair exists instead of every enhancer spreading props by hand.
   */
  /* `object`, not `DomProps`: Zag's Svelte `connect()` types its props against Svelte's own closed
     `HTMLAttributes` (no index signature), the exact reason `apply.ts`'s own `PartProps` type is
     `object` rather than `DomProps` - the single `as DomProps` cast happens once, inside `zagPart`
     below, the only place that needs it. */
  type ItemProps = (props: { item: SelectOption }) => object;

  let {
    items,
    scrollElement,
    getApi,
    estimateItemSize,
    onReady,
  }: {
    items: readonly SelectOption[];
    scrollElement: HTMLElement;
    /** A closure, read fresh on every row patch - not a prop value, which `mount()` only reads once. */
    getApi: () => {
      getItemProps: ItemProps;
      getItemTextProps: ItemProps;
      getItemIndicatorProps: ItemProps;
      highlightedValue: string | null;
    };
    estimateItemSize: number;
    /** Handed the raw instance once, synchronously, so `Select.svelte` can wire its `scrollToIndexFn`
        before the machine's first poll - `useMachine`'s options are read through a getter, so this
        becoming available a tick after `useMachine` itself is called is not a race. */
    onReady: (scrollToIndex: (index: number, options?: { align?: string; behavior?: string }) => void) => void;
  } = $props();

  const virtualizer = createVirtualizer<HTMLElement, HTMLLIElement>(() => ({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimateItemSize,
    overscan: 8,
    getItemKey: (index) => items[index]!.value,
  }));

  $effect(() => {
    onReady((index, options) => virtualizer.instance.scrollToIndex(index, options as never));
  });

  $effect(() => {
    void virtualizer.items;
    remountIcons(scrollElement);
  });

  /** One action, reused on every row AND its two inner spans: patches attrs reactively, wires events
      once, same contract `bind-part.svelte.ts` gives every other part - just per-row instead of static. */
  function zagPart(node: HTMLElement, getProps: () => object) {
    $effect(() => {
      applyZagProps(node, getProps() as DomProps);
    });
    return { destroy: bindZagEvents(node, () => getProps() as DomProps) };
  }

  /* Labels can wrap (`overflow-wrap: anywhere`, `select.css`); `estimateItemSize` is a single line,
     so a wrapped row self-corrects here instead of overlapping the next one. */
  function measureRow(node: HTMLLIElement) {
    virtualizer.instance.measureElement(node);
  }
</script>

<!-- In normal flow (unlike the rows below), so its height is what gives the scroll surface something
     to scroll THROUGH - `height` on `content` itself would be clamped by its own `max-block-size`
     before `scrollHeight` ever saw it (confirmed against the React binding's identical fix). -->
<li aria-hidden="true" style:height="{virtualizer.totalSize}px" style:margin="0" style:padding="0"></li>

<!-- Every row re-adds `--sk-select-content-padding` itself: an absolutely positioned box sits
     flush with its containing block's padding at its OUTER edge, not past it, so `top`/`left: 0`
     would ride every row above `content`'s own padding and stack it all below the last one
     instead (same fix as the React binding's). -->

{#each virtualizer.items as virtualRow (virtualRow.key)}
  {@const item = items[virtualRow.index]}
  {#if item}
    <li
      use:zagPart={() => ({
        ...getApi().getItemProps({ item }),
        "aria-selected": item.value === getApi().highlightedValue ? "true" : undefined,
      })}
      use:measureRow
      class="{selectParts.item} sk-interactive"
      data-index={virtualRow.index}
      {...{ [selectAttrs.item]: "" }}
      style:position="absolute"
      style:top="var(--sk-select-content-padding)"
      style:inset-inline-start="var(--sk-select-content-padding)"
      style:inline-size="calc(100% - 2 * var(--sk-select-content-padding))"
      style:transform="translateY({virtualRow.start}px)"
    >
      <span
        use:zagPart={() => getApi().getItemTextProps({ item })}
        class={selectParts.itemText}
        {...{ [selectAttrs.itemText]: "" }}
      >
        {item.label}
      </span>
      <span
        use:zagPart={() => getApi().getItemIndicatorProps({ item })}
        class={selectParts.itemIndicator}
        {...{ [selectAttrs.itemIndicator]: "" }}
      >
        <span data-sk-icon="check" data-sk-icon-size="md"></span>
      </span>
    </li>
  {/if}
{/each}
