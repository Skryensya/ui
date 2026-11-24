/*
 * The pages the reader came from, for the ⌘K palette's empty state.
 *
 * Docs-local: the palette stores nothing (`commandPaletteEvents.recents`, core), because what counts as recent is the app's.
 * Here that is every page opened, kept in the site's own preference (`recentPagesPreference`) and handed over when the palette
 * asks. Paths, not titles: the palette already knows each page's title and where it sits from its index, and an address that
 * is not in it (a page that was removed, another language's) is skipped there rather than listed as a dead row.
 */

import { commandPaletteEvents, type CommandPaletteRecents } from "@skryensya/core/command-palette";
import { getPreference, setPreference } from "@skryensya/vanilla/storage";
import { RECENT_PAGES_MAX, recentPagesPreference } from "../lib/preferences";

/** `/a/b/` and `/a/b` are one page: the index holds the second, a host may serve the first. */
const here = (): string => location.pathname.replace(/(.)\/$/, "$1");

let bound = false;

export function initRecentPages(): void {
  if (!bound) {
    bound = true;
    document.addEventListener(commandPaletteEvents.recents, (event) => {
      const detail = (event as CustomEvent<CommandPaletteRecents>).detail;
      const palette = (event.target as Element | null)?.closest<HTMLElement>("[data-recents-label]");
      if (!palette) return;
      detail.label = palette.dataset.recentsLabel;
      detail.hrefs.push(...getPreference(recentPagesPreference).filter((path) => path !== here()));
    });
  }
  /* The 404 is every missing path: remembering it would list a page that does not exist. */
  if (document.querySelector("[data-docs-not-found]")) return;
  const path = here();
  setPreference(recentPagesPreference, [path, ...getPreference(recentPagesPreference).filter((p) => p !== path)].slice(0, RECENT_PAGES_MAX));
}
