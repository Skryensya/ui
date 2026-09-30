import type { Realization } from "../realization.js";
import { badgeDotRealization } from "./badge-dot.js";
import { badgeRealization } from "./badge.js";
import { buttonRealization } from "./button.js";
import { kbdRealization } from "./kbd.js";
import { tagRealization } from "./tag.js";
import { avatarRealization } from "./avatar.js";

/*
 * EVERY CONTRACT FIGMA DRAWS, in the order their columns stand on the page. Adding a component is a
 * realization file and one line here; `catalogue.test.ts` holds each one to compiling clean.
 */
export const catalogue: readonly Realization[] = [buttonRealization, badgeRealization, badgeDotRealization, kbdRealization, tagRealization, avatarRealization];
