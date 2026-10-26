/*
 * A NUMBER FOR EVERY USAGE PREVIEW, UNIQUE ACROSS THE WHOLE SITE, for the debug panel's "Preview ids" check.
 *
 * "Example 4 of the ButtonGroup page" is not enough when the same card shows up in a screenshot, a bug report
 * and a console: the number has to name one card on the whole site, and keep naming it tomorrow. So it is not a
 * position or a hash. It is handed out once, in order, and written down in `src/data/preview-ids.json` (commit it,
 * like a lockfile): a key (the page's path + what the card is) maps to its number, new cards take the next free
 * one, and a card that is removed leaves its number unused rather than passing it on to a different card.
 *
 * The key is the page path plus the card's label/title, option and story, NOT its tree: editing an example's
 * content keeps its number. Two cards on one page with all of that identical are the same card to this file.
 *
 * Reads and writes are synchronous on purpose: pages render in one process, and an id taken is on disk before
 * the next card asks. A read-only checkout (an image build) still gets a number for a card that is not
 * registered yet, just not a remembered one; run the dev server or a build locally and commit the file.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const candidates = [resolve(process.cwd(), "src/data/preview-ids.json"), resolve(process.cwd(), "apps/docs/src/data/preview-ids.json")];
const file = candidates.find(existsSync) ?? candidates[0]!;

let ids: Record<string, number> | undefined;
const load = (): Record<string, number> => {
  if (ids) return ids;
  try {
    ids = JSON.parse(readFileSync(file, "utf8")) as Record<string, number>;
  } catch {
    ids = {};
  }
  return ids;
};

export function previewId(pathname: string, ...parts: (string | undefined)[]): number {
  const registry = load();
  const key = [pathname.replace(/\/+$/, "") || "/", ...parts.map((part) => part ?? "")].join("|");
  const known = registry[key];
  if (known) return known;
  const next = Math.max(0, ...Object.values(registry)) + 1;
  registry[key] = next;
  try {
    writeFileSync(file, `${JSON.stringify(Object.fromEntries(Object.entries(registry).sort(([, a], [, b]) => a - b)), null, 2)}\n`);
  } catch {
    /* read-only checkout: the number holds for this run only */
  }
  return next;
}
