import { anchoredParts } from "@skryensya/core/anchored";
import type { CSSProperties } from "react";

/*
 * The React side of the Anclaje pattern: two tiny prop builders, because the placement itself is the
 * popper's, written by each component's Zag machine as inline style on its positioner.
 *
 * React portals every positioner to the body, so the anchor cannot be found by nesting; the classes are
 * what `patterns/anchored.css` styles, and the machine's props carry the rest.
 */
const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

/** Merge onto the element the popup is measured against, AFTER spreading the machine's props. */
export function anchorProps(className: string, style?: CSSProperties) {
  return { className: cx(className, anchoredParts.anchor), style };
}

/** The machine's positioner props plus the pattern's class. The machine's `style` is what places it. */
export function positionerProps<T extends { style?: CSSProperties }>(props: T, className: string) {
  return { ...props, className: cx(className, anchoredParts.positioner) };
}
