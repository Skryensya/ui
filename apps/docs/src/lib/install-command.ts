import core from "../../../../packages/core/package.json";

/*
 * The packages are not on npm yet (that starts with v0.1.0): each one installs from the GitHub
 * Release's tarball. A packed tarball names its Skryensya dependencies by version, which npm cannot
 * resolve, so the command also carries every Skryensya package it depends on.
 */
export const kitVersion: string = core.version;

const needs = {
  core: [],
  cli: [],
  vanilla: ["core"],
  react: ["core"],
} as const satisfies Record<string, readonly string[]>;

export type KitPackage = keyof typeof needs;

export const releaseUrl = (name: KitPackage) =>
  `https://github.com/Skryensya/ui/releases/download/v${kitVersion}/skryensya-${name}-${kitVersion}.tgz`;

/** `pnpm add` for these packages and what they depend on, dependencies first, one URL per line. */
export function installCommand(...names: KitPackage[]): string {
  const order = new Set<KitPackage>();
  for (const name of names) for (const each of [...needs[name], name] as KitPackage[]) order.add(each);
  return `pnpm add \\\n${[...order].map((name) => `  ${releaseUrl(name)}`).join(" \\\n")}`;
}
