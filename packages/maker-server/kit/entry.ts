/*
 * THE KIT A PUBLISHED SITE LOADS: every stylesheet, the kit's own sans, and the vanilla enhancers
 * mounted over the markup the emitter wrote, with Lucide bound to the icon vocabulary. One bundle
 * for every site, built once per catalogue and served from one content-addressed path, so a
 * browser that visited one site has it cached for the next.
 */
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import "./base.css";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import { lucideIcons } from "@skryensya/icons-lucide";

import.meta.glob("../../core/css/components/*.css", { eager: true });
import.meta.glob("../../core/css/patterns/*.css", { eager: true });

void mountComponentsWithIcons(document, lucideIcons);
