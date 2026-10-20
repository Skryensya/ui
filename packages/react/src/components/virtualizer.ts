import { useLayoutEffect, useReducer, useState } from "react";
import { flushSync } from "react-dom";
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
  type VirtualizerOptions,
} from "@tanstack/virtual-core";

/*
 * Hand-rolled instead of the `@tanstack/react-virtual` package: that package is this ~15-line
 * wrapper around `@tanstack/virtual-core` (the framework-agnostic core, shared with the Vanilla
 * binding's own wrapper, `runtime/virtualizer.svelte.ts`) plus a React-only dependency this
 * library doesn't otherwise need. Copied from `@tanstack/react-virtual`'s own source
 * (`useVirtualizer`, minus its opt-in `directDomUpdates` feature, which neither consumer uses).
 *
 * Shared between `select.tsx` and `user-select.tsx` - both list a Zag `select` machine's items,
 * and both need the same windowing.
 */
export function useVirtualizer<TScrollElement extends Element, TItemElement extends Element>(
  options: Omit<
    VirtualizerOptions<TScrollElement, TItemElement>,
    "observeElementRect" | "observeElementOffset" | "scrollToFn"
  >,
) {
  const rerender = useReducer((x: number) => x + 1, 0)[1];
  const resolved: VirtualizerOptions<TScrollElement, TItemElement> = {
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
    onChange: (instance, sync) => {
      if (sync) flushSync(rerender);
      else rerender();
      options.onChange?.(instance, sync);
    },
  };
  const [instance] = useState(() => new Virtualizer(resolved));
  instance.setOptions(resolved);
  useLayoutEffect(() => instance._didMount(), []);
  useLayoutEffect(() => instance._willUpdate());
  return instance;
}
