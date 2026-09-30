import type { Realization } from "../realization.js";
import { badgeDotRealization } from "./badge-dot.js";
import { badgeHolderRealization, badgeRealization } from "./badge.js";
import { buttonRealization } from "./button.js";
import { kbdRealization } from "./kbd.js";
import { tagLinkRealization, tagRealization } from "./tag.js";
import { avatarGroupRealization, avatarRealization } from "./avatar.js";
import { textRealization } from "./text.js";
import { headingRealization } from "./heading.js";
import { linkRealization } from "./link.js";
import { codeRealization } from "./code.js";
import { strongRealization } from "./strong.js";
import { skipLinkRealization } from "./skip-link.js";
import { backToTopRealization } from "./back-to-top.js";
import { statRealization } from "./stat.js";
import { calloutRealization } from "./callout.js";
import { labelledSeparatorRealization, separatorRealization } from "./separator.js";
import { quoteRealization } from "./quote.js";
import { emptyStateRealization } from "./empty-state.js";
import { progressRealization } from "./progress.js";
import { meterRealization } from "./meter.js";
import { inputRealization, textareaRealization } from "./input.js";
import { breadcrumbRealization } from "./breadcrumb.js";
import { descriptionListRealization } from "./description-list.js";
import { segmentedRealization } from "./segmented.js";
import { tabsRealization } from "./tabs.js";
import { accordionRealization } from "./accordion.js";
import { paginationRealization } from "./pagination.js";
import { stepsRealization } from "./steps.js";
import { checkboxGroupRealization, checkboxRealization } from "./checkbox.js";
import { switchRealization } from "./switch.js";
import { radioGroupRealization, radioRealization } from "./radio.js";
import { selectRealization } from "./select.js";
import { passwordInputRealization } from "./password-input.js";
import { numberFieldRealization } from "./number-field.js";
import { listRealization } from "./list.js";
import { navListRealization } from "./nav-list.js";
import { timelineRealization } from "./timeline.js";
import { detailsRealization } from "./details.js";
import { expandableTileRealization, tileCheckboxRealization, tileLinkRealization, tileRadioGroupRealization, tileSwitchRealization } from "./tile.js";
import { tooltipRealization } from "./tooltip.js";
import { stateButtonRealization } from "./state-button.js";
import { copyButtonRealization } from "./copy-button.js";
import { splitButtonRealization } from "./split-button.js";
import { formFieldRealization } from "./form-field.js";
import { otpInputRealization } from "./otp-input.js";
import { toolbarRealization } from "./toolbar.js";
import { tagsInputRealization } from "./tags-input.js";
import { dialogRealization } from "./dialog.js";
import { menuRealization } from "./menu.js";

/*
 * EVERY CONTRACT FIGMA DRAWS, in the order their columns stand on the page. Adding a component is a
 * realization file and one line here; `catalogue.test.ts` holds each one to compiling clean.
 */
export const catalogue: readonly Realization[] = [buttonRealization, badgeRealization, badgeHolderRealization, badgeDotRealization, kbdRealization, tagRealization, tagLinkRealization, avatarRealization, avatarGroupRealization, textRealization, headingRealization, linkRealization, codeRealization, strongRealization, skipLinkRealization, backToTopRealization, statRealization, calloutRealization, separatorRealization, labelledSeparatorRealization, quoteRealization, emptyStateRealization, progressRealization, meterRealization, inputRealization, textareaRealization, breadcrumbRealization, descriptionListRealization, segmentedRealization, tabsRealization, accordionRealization, paginationRealization, stepsRealization, checkboxRealization, checkboxGroupRealization, switchRealization, radioRealization, radioGroupRealization, selectRealization, passwordInputRealization, numberFieldRealization, listRealization, navListRealization, timelineRealization, detailsRealization, tileLinkRealization, tileCheckboxRealization, tileSwitchRealization, expandableTileRealization, tileRadioGroupRealization, tooltipRealization, stateButtonRealization, copyButtonRealization, splitButtonRealization, formFieldRealization, otpInputRealization, toolbarRealization, tagsInputRealization, dialogRealization, menuRealization];
