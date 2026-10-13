import { catalog, consumerPath, cssOf, type Binding } from "./manifest.js";

/*
 * THE MANAGED STYLESHEET: one file the CLI owns, holding the system's tokens and the CSS of every
 * component added so far. The framework imports it once; after that, adding a component is a change
 * to this file and nowhere else. It is regenerated whole from the list of ids in its own header, so
 * running the same command twice produces the same bytes and a hand edit is never half-merged.
 */

const HEADER = "/* skryensya: managed by `skryensya add`. Run it again to change what is here, do not edit by hand. */";
const IDS = /^\/\* components: (.*) \*\/$/m;

/** The component ids a managed stylesheet already holds, so adding is cumulative. */
export function readIds(content: string | undefined): string[] {
  const line = content?.match(IDS)?.[1];
  if (!line) return [];
  return line
    .split(",")
    .map((id) => id.trim())
    .filter((id) => catalog.has(id));
}

export function renderCss(ids: readonly string[], binding: Binding): string {
  const imports = ["@skryensya/core/tokens.css", ...cssOf(ids)].map((file) => `@import "${consumerPath(file, binding)}";`);
  return [HEADER, `/* components: ${ids.join(", ")} */`, ...imports, ""].join("\n");
}
