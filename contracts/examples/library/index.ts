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
import { statsOverPair } from "./card/stats-over-pair.js";
import { statusDetailCard } from "./card/status-detail-card.js";
import { avatarMessageRows } from "./list/avatar-message-rows.js";
import { avatarRoleRows } from "./list/avatar-role-rows.js";
import { checkTagRows } from "./list/check-tag-rows.js";
import { emptyStateBlock } from "./list/empty-state-block.js";
import { figureRows } from "./list/figure-rows.js";
import { iconActionRows } from "./list/icon-action-rows.js";
import { iconChevronLinks } from "./list/icon-chevron-links.js";
import { iconWordStates } from "./list/icon-word-states.js";
import { separatedGroups } from "./list/separated-groups.js";
import { titleWithLink } from "./list/title-with-link.js";
import { titledPanel } from "./list/titled-panel.js";
import { viewerToolbar } from "./action/viewer-toolbar.js";
import { inlineNotice } from "./feedback/inline-notice.js";
import { breadcrumbTrail } from "./navigation/breadcrumb-trail.js";
import { sectionTabs } from "./navigation/section-tabs.js";
import { rememberRecoverRow } from "./form/access-fragments.js";
import { labelledDivider } from "./form/access-fragments.js";
import { accountFormCard } from "./form/account-form-card.js";
import { brandSplit } from "./form/brand-split.js";
import { dangerCallout } from "./form/danger-callout.js";
import { inlineCaptureCard } from "./form/inline-capture-card.js";
import { labelledField } from "./form/labelled-field.js";
import { messageFormCard } from "./form/message-form-card.js";
import { settingsSections } from "./form/settings-sections.js";
import { switchRowsCard } from "./form/switch-rows-card.js";

/*
 * EVERY PATTERN MODULE, one per layout, in `library/<subject>/<pattern>.ts`: the pattern (its layout and the
 * fields it fills) and the uses written against it (an intent, a purpose and bilingual content). The order
 * here is only alphabetical inside a subject: the Catalog orders by scale itself.
 *
 * A new file is not enough: it is not published until it is listed here, and `examples.test.ts` fails a
 * pattern file that is not.
 */
export const modules: readonly PatternModule[] = [
  amountWell,
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
  statsOverPair,
  statusDetailCard,
  avatarMessageRows,
  avatarRoleRows,
  checkTagRows,
  emptyStateBlock,
  figureRows,
  iconActionRows,
  iconChevronLinks,
  iconWordStates,
  separatedGroups,
  titleWithLink,
  titledPanel,
  rememberRecoverRow,
  labelledDivider,
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
