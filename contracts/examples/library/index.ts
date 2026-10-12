import type { PatternModule } from "../model/types.js";
import { amountWell } from "./card/amount-well.js";
import { avatarByline } from "./card/avatar-byline.js";
import { centeredCodeCard } from "./card/centered-code-card.js";
import { centeredIdentityCard } from "./card/centered-identity-card.js";
import { cornerLabelImage } from "./card/corner-label-image.js";
import { decisionRow } from "./card/decision-row.js";
import { descriptionSwitchTile } from "./card/description-switch-tile.js";
import { equalGrid } from "./card/equal-grid.js";
import { figureBreakdownCard } from "./card/figure-breakdown-card.js";
import { figureChipCard } from "./card/figure-chip-card.js";
import { figureDeltaCard } from "./card/figure-delta-card.js";
import { headingStack } from "./card/heading-stack.js";
import { iconLinkGroup } from "./card/icon-link-group.js";
import { iconLinkTiles } from "./card/icon-link-tiles.js";
import { mediaTopCard } from "./card/media-top-card.js";
import { meterFigureCard } from "./card/meter-figure-card.js";
import { mosaicColumns } from "./card/mosaic-columns.js";
import { pricingColumn } from "./card/pricing-column.js";
import { progressWellsCard } from "./card/progress-wells-card.js";
import { projectCard } from "./card/project-card.js";
import { statementCard } from "./card/statement-card.js";
import { statsOverPair } from "./card/stats-over-pair.js";
import { statusDetailCard } from "./card/status-detail-card.js";
import { avatarMessageRows } from "./list/avatar-message-rows.js";
import { avatarRoleRows } from "./list/avatar-role-rows.js";
import { checkTagRows } from "./list/check-tag-rows.js";
import { emptyStateBlock } from "./list/empty-state-block.js";
import { figureRows } from "./list/figure-rows.js";
import { iconActionRows } from "./list/icon-action-rows.js";
import { separatedGroups } from "./list/separated-groups.js";
import { titledPanel } from "./list/titled-panel.js";
import { viewerToolbar } from "./action/viewer-toolbar.js";
import { splitActionCard } from "./action/split-action-card.js";
import { viewSwitcher } from "./action/view-switcher.js";
import { eventTimeline } from "./feedback/event-timeline.js";
import { stageSteps } from "./feedback/stage-steps.js";
import { commentThreadCard } from "./list/comment-thread-card.js";
import { faqAccordion } from "./list/faq-accordion.js";
import { inlineNotice } from "./feedback/inline-notice.js";
import { breadcrumbTrail } from "./navigation/breadcrumb-trail.js";
import { sectionTabs } from "./navigation/section-tabs.js";
import { colorChoiceCard } from "./form/color-choice-card.js";
import { dateChoiceCard } from "./form/date-choice-card.js";
import { otpVerificationCard } from "./form/otp-verification-card.js";
import { searchableChoiceCard } from "./form/searchable-choice-card.js";
import { accountFormCard } from "./form/account-form-card.js";
import { brandSplit } from "./form/brand-split.js";
import { dangerCallout } from "./form/danger-callout.js";
import { inlineCaptureCard } from "./form/inline-capture-card.js";
import { labelledField } from "./form/labelled-field.js";
import { messageFormCard } from "./form/message-form-card.js";
import { settingsSections } from "./form/settings-sections.js";
import { switchRowsCard } from "./form/switch-rows-card.js";

import { copyValue } from "./action/copy-value.js";
import { loadingIndicator } from "./feedback/loading-indicator.js";
import { trendChart } from "./table/trend-chart.js";
import { avatarGreeting } from "./card/avatar-greeting.js";
import { tagPicker } from "./form/tag-picker.js";
import { toastNotice } from "./feedback/toast-notice.js";
import { announcementTicker } from "./media/announcement-ticker.js";
import { attachFiles } from "./form/attach-files.js";
import { timeSlotField } from "./form/time-slot-field.js";
import { contentSkeleton } from "./feedback/content-skeleton.js";
import { beforeAfterCompare } from "./media/before-after-compare.js";
import { featureComparison } from "./table/feature-comparison.js";
import { levelControl } from "./form/level-control.js";
import { topicTags } from "./form/topic-tags.js";
import { assigneePicker } from "./form/assignee-picker.js";
import { verificationCode } from "./form/verification-code.js";
import { searchableSelect } from "./form/searchable-select.js";
import { dateField } from "./form/date-field.js";
import { colorField } from "./form/color-field.js";
import { saveWithAlternatives } from "./action/save-with-alternatives.js";
import { quickActionsDock } from "./action/quick-actions-dock.js";
import { actionsMenu } from "./navigation/actions-menu.js";
import { commentFeed } from "./list/comment-feed.js";
import { decisionFlow } from "./media/decision-flow.js";
import { applicationBar } from "./navigation/application-bar.js";
import { captionedVideo } from "./media/captioned-video.js";
import { trackPlayer } from "./media/track-player.js";
import { selectableGrid } from "./table/selectable-grid.js";
import { fileExplorerGrid } from "./table/file-explorer-grid.js";
import { photoGallery } from "./media/photo-gallery.js";
import { shortcutHint } from "./action/shortcut-hint.js";
import { quantityStepper } from "./form/quantity-stepper.js";
import { installSteps } from "./list/install-steps.js";
import { starRating } from "./form/star-rating.js";
import { monthCalendar } from "./form/month-calendar.js";
import { codeSnippet } from "./card/code-snippet.js";
import { pageToc } from "./navigation/page-toc.js";
import { shareQr } from "./card/share-qr.js";
import { testimonialCard } from "./card/testimonial-card.js";
import { eventCard } from "./card/event-card.js";
import { contactCard } from "./card/contact-card.js";
import { alertCard } from "./card/alert-card.js";
import { featureCard } from "./card/feature-card.js";
import { itemizedCard } from "./card/itemized-card.js";
import { routeCard } from "./card/route-card.js";
import { shareBarsCard } from "./card/share-bars-card.js";
import { offerCard } from "./card/offer-card.js";
import { inviteBanner } from "./card/invite-banner.js";

/*
 * EVERY PATTERN MODULE, one per layout, in `library/<subject>/<pattern>.ts`: the pattern (its layout and the
 * fields it fills) and the uses written against it (an intent, a purpose and bilingual content). The order
 * here is only alphabetical inside a subject: the Catalog orders by scale itself.
 *
 * A new file is not enough: it is not published until it is listed here, and `examples.test.ts` fails a
 * pattern file that is not.
 */
export const modules: readonly PatternModule[] = [
  inviteBanner,
  itemizedCard,
  routeCard,
  shareBarsCard,
  offerCard,
  featureCard,
  alertCard,
  contactCard,
  eventCard,
  testimonialCard,
  shareQr,
  pageToc,
  codeSnippet,
  monthCalendar,
  starRating,
  installSteps,
  quantityStepper,
  shortcutHint,
  photoGallery,
  fileExplorerGrid,
  selectableGrid,
  trackPlayer,
  captionedVideo,
  applicationBar,
  decisionFlow,
  commentFeed,
  actionsMenu,
  quickActionsDock,
  saveWithAlternatives,
  colorField,
  dateField,
  searchableSelect,
  verificationCode,
  assigneePicker,
  topicTags,
  levelControl,
  featureComparison,
  beforeAfterCompare,
  contentSkeleton,
  timeSlotField,
  attachFiles,
  announcementTicker,
  toastNotice,
  tagPicker,
  avatarGreeting,
  copyValue,
  loadingIndicator,
  trendChart,
  amountWell,
  colorChoiceCard,
  commentThreadCard,
  dateChoiceCard,
  otpVerificationCard,
  searchableChoiceCard,
  splitActionCard,
  eventTimeline,
  faqAccordion,
  stageSteps,
  viewSwitcher,
  avatarByline,
  centeredCodeCard,
  centeredIdentityCard,
  cornerLabelImage,
  decisionRow,
  descriptionSwitchTile,
  equalGrid,
  figureBreakdownCard,
  figureChipCard,
  figureDeltaCard,
  headingStack,
  iconLinkGroup,
  iconLinkTiles,
  mediaTopCard,
  meterFigureCard,
  mosaicColumns,
  pricingColumn,
  progressWellsCard,
  projectCard,
  statementCard,
  statsOverPair,
  statusDetailCard,
  avatarMessageRows,
  avatarRoleRows,
  checkTagRows,
  emptyStateBlock,
  figureRows,
  iconActionRows,
  separatedGroups,
  titledPanel,
  accountFormCard,
  brandSplit,
  dangerCallout,
  inlineCaptureCard,
  labelledField,
  messageFormCard,
  settingsSections,
  switchRowsCard,
  viewerToolbar,
  inlineNotice,
  breadcrumbTrail,
  sectionTabs,
];
