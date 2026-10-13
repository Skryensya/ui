/*
 * WHERE THE SYSTEM'S PACKAGES COME FROM. The kit is not on a registry: each version is a GitHub Release
 * whose assets are npm-compatible tarballs, and the CLI is one of them, so it knows exactly which release
 * it belongs to. `add` installs the packages of THAT release, never "latest" and never a same-named
 * package from somewhere else. The packages share one version (`scripts/release.ts`), which is what makes
 * this a rule rather than a lookup.
 *
 * `build` injects the version (`scripts/build.ts`). From source (tests, a checkout) there is none, and the
 * packages are named plainly: a workspace resolves them itself.
 */
declare const __SKRYENSYA_VERSION__: string | undefined;

export const version: string = typeof __SKRYENSYA_VERSION__ === "string" ? __SKRYENSYA_VERSION__ : "dev";

const repository = "https://github.com/Skryensya/ui";

/** What a binding drags in that the release does not resolve for it: its own dependencies are tarballs too. */
const companions: Record<string, string[]> = {
  "@skryensya/react": ["@skryensya/core", "@skryensya/icons-lucide"],
  "@skryensya/vanilla": ["@skryensya/core", "@skryensya/icons-lucide"],
};

export const isSystemPackage = (name: string): boolean => name.startsWith("@skryensya/");

/** The release asset for a system package at this CLI's version, or the plain name from source. */
export function packageTarget(name: string, at: string = version): string {
  if (at === "dev" || !isSystemPackage(name)) return name;
  return `${repository}/releases/download/v${at}/skryensya-${name.slice("@skryensya/".length)}-${at}.tgz`;
}

/** The packages to install for a wanted set: each system package preceded by the release packages it needs. */
export function withCompanions(names: readonly string[], at: string = version): string[] {
  if (at === "dev") return [...names];
  return [...new Set(names.flatMap((name) => [...(companions[name] ?? []), name]))];
}
