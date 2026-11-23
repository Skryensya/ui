import { canonicalPath } from "../i18n";
import { stableIconNames, type IconSize, type StableIconName } from "@skryensya/core/icon";
import { iconMarkup } from "../icons";

/* Components whose mark is an interface role already; every other one is its `component-<slug>` role. */
const sharedRole: Readonly<Record<string, StableIconName>> = {
  calendar: "calendar",
  "code-preview": "code",
  "command-palette": "search",
  "time-field": "clock",
  "nav-list": "menu",
  // A Carousel signature with its own page: it wears the Carousel's mark.
  "curve-carousel": "component-carousel",
  "progressive-carousel": "component-carousel",
};

/**
 * The mark for a component page, from a localized href, or `null` for a page that is not a component
 * (a guide, a foundation). Always a role of the vocabulary, so it follows the site's icon set.
 */
export function findComponentIconMarkup(
  href: string,
  options: { size?: IconSize; className?: string } = {},
): string | null {
  const canonical = canonicalPath(href);
  const slug = canonical.match(/^\/(?:components\/)?([a-z0-9-]+)$/)?.[1];
  if (!slug) return null;
  const role = sharedRole[slug] ?? `component-${slug}`;
  return (stableIconNames as readonly string[]).includes(role) ? iconMarkup(role as StableIconName, options) : null;
}

/**
 * The same, for a row that MUST have one: the catalogue. A component with no mark is a build error,
 * like a missing description, so a new component cannot land in the catalogue without one.
 */
export function componentIconMarkup(href: string): string {
  const markup = findComponentIconMarkup(href);
  if (!markup) {
    throw new Error(`Missing component mark for ${canonicalPath(href)}: add "component-<slug>" to stableIconNames in packages/core/src/icon.ts and map it in every preset`);
  }
  return markup;
}
