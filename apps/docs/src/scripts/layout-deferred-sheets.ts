import dialogCss from "@skryensya/core/components/dialog.css?inline";
import vaulCss from "@skryensya/core/patterns/vaul.css?inline";
import dialogVaulCss from "@skryensya/core/patterns/dialog-vaul.css?inline";
import commandPaletteCss from "@skryensya/core/components/command-palette.css?inline";
import tileCss from "@skryensya/core/components/tile.css?inline";
import { insertDeferredStyles } from "./deferred-styles";

/* The layout's closed overlays: the palette (Dialog + Dialog Vaul + its own sheet), the mobile drawer
   (Vaul) and the preference sheet, whose settings are Tiles. Why they wait: `deferred-styles.ts`. */
export function initLayoutDeferredSheets(): void {
  insertDeferredStyles([dialogCss, vaulCss, dialogVaulCss, commandPaletteCss, tileCss]);
}
