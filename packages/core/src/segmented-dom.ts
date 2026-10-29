import { segmentedParts } from "./segmented.js";

/*
 * SEGMENTED, the DOM half both bindings run. Kept out of `segmented.ts` because that file is a
 * contract the compiler imports, and the compiler has no DOM. Same split as `fade-edge-dom.ts`.
 */

/**
 * An option whose only visible content is its icon: an icon plus words that are visually hidden
 * (they are its accessible name). Returns those words, which the option's tooltip shows to the eye;
 * `null` for an option whose words are on screen, which needs no tooltip.
 */
export function iconOnlyOptionLabel(option: Element): string | null {
  const icon = option.querySelector(":scope > .sk-icon, :scope > [data-sk-icon]");
  const hidden = option.querySelector(":scope > .sk-visually-hidden");
  const words = hidden?.textContent?.trim();
  return icon && words ? words : null;
}

/** Every icon-only option of a Segmented, by its value. */
export function iconOnlyOptionLabels(root: Element): Map<string, string> {
  const labels = new Map<string, string>();
  for (const option of root.querySelectorAll(`.${segmentedParts.option}`)) {
    const value = option.getAttribute("data-value");
    const label = iconOnlyOptionLabel(option);
    if (value && label) labels.set(value, label);
  }
  return labels;
}
