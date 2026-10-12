/*
 * What a page needs to use one component on its own, from `@skryensya/core`'s generated install
 * manifest (`packages/core/scripts/install-manifest.ts`): the sheets in load order, the React import,
 * and the Vanilla mount with the selectors the auto-loader watches for. `undefined` for a page that has
 * no contract of its own.
 */
import manifest from "@skryensya/core/install-manifest.json";

export interface Install {
  category: string;
  css: { entry: string; files: string[] };
  react: { entry: string; names: string[] } | null;
  vanilla: { entry: string; mount: string | null; selectors: string[]; auto: boolean } | null;
}

export function installFor(contractId: string | undefined): Install | undefined {
  return contractId ? (manifest as Record<string, Install>)[contractId] : undefined;
}
