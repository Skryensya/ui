/*
 * SPLITTER, the DOM half both bindings run for resizable columns. Kept out of `splitter.ts`, which is
 * the pure matcher and arithmetic.
 */

/**
 * The width a resizable table's columns may share, measured off the element it sits in.
 *
 * The CONTENT box of that element, never its border box: `getBoundingClientRect()` counts the
 * element's own padding, which the table cannot use, and seeding from it overflowed the wrapper by
 * exactly that padding. Minus the table's own horizontal border, which the separated-border model
 * (`border-collapse: separate`, what `.sk-table` uses) paints outside the width its `<col>`s sum to.
 * One reader for both bindings, and for the first read and the `ResizeObserver` retry alike: the two
 * used to disagree (border box first, content box on retry), so the same table seeded two widths.
 */
export function resizableTableWidth(measured: Element, table: Element): number {
  const own = getComputedStyle(table);
  return Math.max(0, contentBoxWidth(measured) - px(own.borderLeftWidth) - px(own.borderRightWidth));
}

/** An element's content-box width: what a `ResizeObserver`'s `contentRect` reports, read now. */
export function contentBoxWidth(element: Element): number {
  const style = getComputedStyle(element);
  return Math.max(
    0,
    element.getBoundingClientRect().width -
      px(style.paddingLeft) - px(style.paddingRight) - px(style.borderLeftWidth) - px(style.borderRightWidth),
  );
}

// `|| 0`: an environment with no stylesheet cascade (jsdom) reports `""`, and `parseFloat("")` is NaN.
const px = (value: string) => Number.parseFloat(value) || 0;
