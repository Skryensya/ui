import { actionRowInCardsSnippet } from "./action-row-in-cards.js";
import { calloutErrorWithRetrySnippet } from "./callout-error-with-retry.js";
import { footerCreditLineSnippet } from "./footer-credit-line.js";
import { formFieldHintAndErrorSnippet } from "./form-field-hint-and-error.js";
import { formFieldValidatedIdentifierSnippet } from "./form-field-validated-identifier.js";
import { heroCenteredMinimalSnippet } from "./hero-centered-minimal.js";
import { heroSplitWithMediaSnippet } from "./hero-split-with-media.js";
import { heroWithActionsSnippet } from "./hero-with-actions.js";
import { heroWithAppBadgesSnippet } from "./hero-with-app-badges.js";
import { heroWithAudienceTabsSnippet } from "./hero-with-audience-tabs.js";
import { heroWithCodePreviewSnippet } from "./hero-with-code-preview.js";
import { heroWithEmailCaptureSnippet } from "./hero-with-email-capture.js";
import { heroWithEyebrowSnippet } from "./hero-with-eyebrow.js";
import { heroWithLogoWallSnippet } from "./hero-with-logo-wall.js";
import { heroWithPricingToggleSnippet } from "./hero-with-pricing-toggle.js";
import { heroWithSocialProofSnippet } from "./hero-with-social-proof.js";
import { heroWithTestimonialSnippet } from "./hero-with-testimonial.js";
import { heroWithVideoDemoSnippet } from "./hero-with-video-demo.js";
import { imageCropperAvatarSnippet } from "./image-cropper-avatar.js";
import { imageCropperCoverSnippet } from "./image-cropper-cover.js";
import { iconButtonToolbarWithTooltipsSnippet } from "./icon-button-toolbar-with-tooltips.js";
import { iconOnlyButtonTooltipSnippet } from "./icon-only-button-tooltip.js";
import { paginationStandaloneSnippet } from "./pagination-standalone.js";
import { questionnaireBranchingSurveySnippet } from "./questionnaire-branching-survey.js";
import { productCardInGridSnippet } from "./product-card-in-grid.js";
import { settingsRowWithSwitchSnippet } from "./settings-row-with-switch.js";
import { tableWithPaginationSnippet } from "./table-with-pagination.js";
import { chatPattern } from "./references/chat.js";
import { checkoutPattern } from "./references/checkout.js";
import { inboxPattern } from "./references/inbox.js";
import { issueTrackerPattern } from "./references/issue-tracker.js";
import { pageSnippets } from "./pages.generated.js";
import { repoOverviewPattern } from "./references/repo-overview.js";
import { searchResultsPattern } from "./references/search-results.js";
import { settingsPattern } from "./references/settings.js";
import { signInPattern } from "./references/sign-in.js";
import { storeListingPattern } from "./references/store-listing.js";
import type { Snippet } from "./snippet.js";

/*
 * Every snippet, component-level first (one family, well-composed), then molecule-level (a few
 * families, one small piece of UI). The compiler validates every tree here against the contracts,
 * so this list is not a catalogue of good intentions. A snippet naming a signature that changed
 * fails the build.
 */
export const legacySnippets: readonly Snippet[] = [
  calloutErrorWithRetrySnippet,
  iconOnlyButtonTooltipSnippet,
  formFieldHintAndErrorSnippet,
  formFieldValidatedIdentifierSnippet,
  heroWithActionsSnippet,
  heroCenteredMinimalSnippet,
  heroWithEyebrowSnippet,
  footerCreditLineSnippet,
  imageCropperAvatarSnippet,
  imageCropperCoverSnippet,
  paginationStandaloneSnippet,
  questionnaireBranchingSurveySnippet,
  settingsRowWithSwitchSnippet,
  actionRowInCardsSnippet,
  productCardInGridSnippet,
  iconButtonToolbarWithTooltipsSnippet,
  tableWithPaginationSnippet,
  heroSplitWithMediaSnippet,
  heroWithSocialProofSnippet,
  heroWithEmailCaptureSnippet,
  heroWithAppBadgesSnippet,
  heroWithLogoWallSnippet,
  heroWithPricingToggleSnippet,
  heroWithCodePreviewSnippet,
  heroWithVideoDemoSnippet,
  heroWithAudienceTabsSnippet,
  heroWithTestimonialSnippet,
  ...pageSnippets,
  /* Reference screens: the shape a family of well-known sites converges on, hand-composed and held to the accessibility rules in `quality.ts`. */
  repoOverviewPattern,
  inboxPattern,
  issueTrackerPattern,
  storeListingPattern,
  chatPattern,
  signInPattern,
  checkoutPattern,
  settingsPattern,
  searchResultsPattern,
];

