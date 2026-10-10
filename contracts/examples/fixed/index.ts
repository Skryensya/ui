import { hasIntent, type IntentId } from "../model/taxonomy.js";
import type { Fixed, Scale, SubjectId } from "../model/types.js";
import { legacySnippets } from "./legacy.js";
import type { Snippet } from "./snippet.js";

/*
 * THE FIXED EXAMPLES: trees written once, whole, that predate the pattern model or are one of a kind
 * (a whole page has no layout to separate from its meaning). Each is filed here under the same
 * taxonomy as everything else, by a line in `placement` below: what it is for (intent), what a person
 * would call it (subject) and how much of a page it is (scale).
 *
 * A fixed tree is English-only, as it was written. When one earns a second use (the same layout for
 * another job) or a Spanish copy, it stops being fixed: it becomes a pattern with its first use, in
 * `../library`.
 *
 * A snippet with no line in `placement` fails the build (see `examples.test.ts`): filing is not optional.
 */

type Placement = readonly [subject: SubjectId, scale: Scale, intent: IntentId];

const placement: Readonly<Record<string, Placement>> = {
  "callout-error-with-retry": ["feedback", "component", "status/errors/error-with-retry"],
  "icon-only-button-tooltip": ["action", "component", "actions/buttons/icon-only"],
  "form-field-hint-and-error": ["form", "component", "input/fields/field-hint-and-error"],
  "form-field-validated-identifier": ["form", "component", "input/fields/validated-identifier"],
  "hero-with-actions": ["hero", "component", "marketing/landing/hero"],
  "hero-centered-minimal": ["hero", "component", "marketing/landing/hero"],
  "hero-with-eyebrow": ["hero", "component", "marketing/landing/hero"],
  "hero-split-with-media": ["hero", "composition", "marketing/landing/hero"],
  "hero-with-social-proof": ["hero", "composition", "marketing/proof/social-proof"],
  "hero-with-email-capture": ["hero", "composition", "marketing/conversion/email-capture"],
  "hero-with-app-badges": ["hero", "composition", "marketing/conversion/app-download"],
  "hero-with-logo-wall": ["hero", "composition", "marketing/proof/logo-wall"],
  "hero-with-pricing-toggle": ["hero", "composition", "marketing/pricing/pricing-toggle"],
  "hero-with-code-preview": ["hero", "composition", "marketing/product/code-demo"],
  "hero-with-video-demo": ["hero", "composition", "marketing/product/video-demo"],
  "hero-with-audience-tabs": ["hero", "composition", "marketing/audience/audience-tabs"],
  "hero-with-testimonial": ["hero", "composition", "marketing/proof/testimonial"],
  "footer-credit-line": ["navigation", "fragment", "navigation/site/footer-credit"],
  "image-cropper-avatar": ["form", "component", "input/media/profile-picture"],
  "image-cropper-cover": ["form", "component", "input/media/cover-crop"],
  "pagination-standalone": ["table", "component", "data/collections/pagination"],
  "table-with-pagination": ["table", "composition", "data/collections/paged-table"],
  "questionnaire-branching-survey": ["survey", "composition", "input/surveys/branching-survey"],
  "settings-row-with-switch": ["form", "component", "input/preferences/toggle-setting"],
  "action-row-in-cards": ["card", "composition", "decision/confirmation/decision-row"],
  "product-card-in-grid": ["card", "composition", "commerce/catalog/product-card"],
  "icon-button-toolbar-with-tooltips": ["action", "component", "actions/toolbars/icon-toolbar"],
  "page-app-shell": ["screen", "page", "navigation/shells/app-shell"],
  "page-app-shell-explorer": ["screen", "page", "navigation/shells/nested-navigation-shell"],
  "page-dashboard": ["screen", "page", "metrics/dashboards/analytics-dashboard"],
  "page-settings": ["screen", "page", "input/preferences/settings-screen"],
  "page-account-settings": ["screen", "page", "input/preferences/settings-screen"],
  "page-team": ["screen", "page", "identity/people/team-page"],
  "page-marketing": ["screen", "page", "marketing/landing/landing-page"],
  "page-pricing": ["screen", "page", "commerce/pricing/pricing-page"],
  "page-product": ["screen", "page", "commerce/catalog/product-page"],
  "page-store-listing": ["screen", "page", "commerce/catalog/store-listing"],
  "page-docs-site": ["screen", "page", "content/documentation/docs-site"],
  "page-article": ["screen", "page", "content/publishing/article-page"],
  "page-help-center": ["screen", "page", "content/documentation/help-center"],
  "page-changelog": ["screen", "page", "content/publishing/changelog"],
  "page-search-results": ["screen", "page", "content/search/search-results"],
  "page-repo-overview": ["screen", "page", "content/code/repo-overview"],
  "page-checkout": ["screen", "page", "commerce/checkout/checkout-flow"],
  "page-checkout-form": ["screen", "page", "commerce/checkout/checkout-flow"],
  "page-booking": ["screen", "page", "commerce/booking/booking-flow"],
  "page-sign-in": ["screen", "page", "identity/access/sign-in-page"],
  "page-sign-in-card": ["screen", "page", "identity/access/sign-in-page"],
  "page-onboarding": ["screen", "page", "identity/onboarding/step-flow"],
  "page-not-found": ["screen", "page", "status/errors/not-found"],
  "page-inbox": ["screen", "page", "collaboration/messages/mail-client"],
  "page-chat": ["screen", "page", "collaboration/messages/chat"],
  "page-issue-tracker": ["screen", "page", "collaboration/work/issue-tracker"],
};

/** Snippets with no line in `placement`, and lines pointing at a snippet or an intent that does not exist. Empty means filed. */
export function unplacedFixed(): readonly string[] {
  const ids = new Set(legacySnippets.map((snippet) => snippet.id));
  return [
    ...legacySnippets.filter((snippet) => !placement[snippet.id]).map((snippet) => `${snippet.id}: no placement`),
    ...Object.entries(placement).flatMap(([id, [, , intent]]) => [
      ...(ids.has(id) ? [] : [`${id}: placement names no such snippet`]),
      ...(hasIntent(intent) ? [] : [`${id}: unknown intent ${intent}`]),
    ]),
  ];
}

/** A fixed example has no authored title: its id read as words ("hero-with-actions" is "Hero with actions"). */
const titleOf = (id: string): string => {
  const words = id.replace(/^page-/, "").split("-").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const toFixed = (snippet: Snippet): Fixed | undefined => {
  const at = placement[snippet.id];
  if (!at) return undefined;
  const [subject, scale, intent] = at;
  return {
    id: snippet.id,
    subject,
    scale,
    intent,
    title: titleOf(snippet.id),
    purpose: snippet.intent,
    notes: snippet.notes,
    tree: snippet.tree,
  };
};

export const fixed: readonly Fixed[] = legacySnippets.map(toFixed).filter((entry): entry is Fixed => entry !== undefined);

export { legacySnippets };
export type { Snippet, SnippetLevel } from "./snippet.js";
