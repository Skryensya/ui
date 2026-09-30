import type { Realization } from "../realization.js";
import { badgeDotRealization } from "./badge-dot.js";
import { badgeRealization } from "./badge.js";
import { buttonRealization } from "./button.js";
import { kbdRealization } from "./kbd.js";
import { tagRealization } from "./tag.js";
import { avatarRealization } from "./avatar.js";
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

/*
 * EVERY CONTRACT FIGMA DRAWS, in the order their columns stand on the page. Adding a component is a
 * realization file and one line here; `catalogue.test.ts` holds each one to compiling clean.
 */
export const catalogue: readonly Realization[] = [buttonRealization, badgeRealization, badgeDotRealization, kbdRealization, tagRealization, avatarRealization, textRealization, headingRealization, linkRealization, codeRealization, strongRealization, skipLinkRealization, backToTopRealization, statRealization, calloutRealization, separatorRealization, labelledSeparatorRealization, quoteRealization, emptyStateRealization, progressRealization, meterRealization, inputRealization, textareaRealization];
