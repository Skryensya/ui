import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
  type VirtualItem,
  type VirtualizerOptions,
} from "@tanstack/virtual-core";

/** The reactive handle `createVirtualizer` returns: `items`/`totalSize` re-derive on every change. */
export interface VirtualizerHandle<TScrollElement extends Element, TItemElement extends Element> {
  /** The raw instance, for imperative calls (`scrollToIndex`, `measureElement`). */
  readonly instance: Virtualizer<TScrollElement, TItemElement>;
  readonly items: VirtualItem[];
  readonly totalSize: number;
}

/*
 * Hand-rolled instead of the `@tanstack/svelte-virtual` package, for the same reason
 * `packages/react/src/components/select.tsx` hand-rolls its own copy rather than pulling in
 * `@tanstack/react-virtual`: both packages are short wrappers around `@tanstack/virtual-core` (the
 * framework-agnostic core, already a dependency here), and installing a second, Svelte-only
 * package for the same ~15 lines just to match a React-only one across the two bindings is the
 * dependency this project does not want. `@tanstack/svelte-virtual`'s own source uses Svelte
 * stores; this is the runes equivalent, the reactivity primitive every other enhancer in this
 * package already uses (`bind-part.svelte.ts`, `splitter.svelte.ts`).
 *
 * MUST be called synchronously from a component's own `<script>` - `$effect` throws
 * `lifecycle_outside_component` otherwise, the same constraint `splitter.svelte.ts` documents for
 * its own runes.
 */
export function createVirtualizer<TScrollElement extends Element, TItemElement extends Element>(
  getOptions: () => Omit<
    VirtualizerOptions<TScrollElement, TItemElement>,
    "observeElementRect" | "observeElementOffset" | "scrollToFn"
  >,
): VirtualizerHandle<TScrollElement, TItemElement> {
  let version = $state(0);

  const resolve = (): VirtualizerOptions<TScrollElement, TItemElement> => {
    const options = getOptions();
    return {
      observeElementRect,
      observeElementOffset,
      scrollToFn: elementScroll,
      ...options,
      onChange(instance, sync) {
        version++;
        options.onChange?.(instance, sync);
      },
    };
  };

  const instance = new Virtualizer<TScrollElement, TItemElement>(resolve());

  /*
   * BOTH IN ONE `$effect.pre`, `_didMount()` gated to run exactly once before the first
   * `_willUpdate()`. Splitting them across a `$effect.pre` (`_willUpdate`) and a plain `$effect`
   * (`_didMount`) - mirroring the two separate effects `@tanstack/react-virtual`'s own source uses -
   * runs `_willUpdate()` FIRST here: Svelte always runs every `$effect.pre` in a flush before any
   * `$effect`, regardless of declaration order, unlike React's same-phase layout effects, which fire
   * in declaration order. `_willUpdate()` before the instance has ever mounted measured an empty
   * range, every time (confirmed against this file's own test).
   */
  let didMountCleanup: (() => void) | undefined;
  $effect.pre(() => {
    if (!didMountCleanup) didMountCleanup = instance._didMount();
    instance.setOptions(resolve());
    instance._willUpdate();
    /* Read so this effect re-runs on every `onChange` (scroll, resize, item count), the only
     * signal `getOptions()`'s own reads cannot provide by themselves. */
    void version;
  });
  $effect(() => () => didMountCleanup?.());

  const items = $derived.by(() => {
    void version;
    return instance.getVirtualItems();
  });
  const totalSize = $derived.by(() => {
    void version;
    return instance.getTotalSize();
  });

  return {
    instance,
    get items() {
      return items;
    },
    get totalSize() {
      return totalSize;
    },
  };
}
