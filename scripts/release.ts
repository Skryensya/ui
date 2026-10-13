/*
 * THE RELEASE, in four steps a person or the workflow runs the same way:
 *
 *   node scripts/release.ts bump 0.0.2      set the version of every shipped package (and the README's URLs)
 *   node scripts/release.ts build           build the shipped packages, in dependency order
 *   node scripts/release.ts pack [dir]      one npm-compatible tarball per package, plus SHA256SUMS
 *   node scripts/release.ts verify [dir]    open every tarball and check it: version, every export target present
 *
 * The tarballs are GitHub Release assets, not npm packages (nothing is published to a registry), and
 * consumers install them by URL. What goes in them is what the build produced:
 *
 *   - the repo keeps `exports` pointing at `src/`, so the workspace runs on source with no build step;
 *   - a tarball's `exports` point at `dist/`, written for the pack only (below) and put back right after.
 *     Types stay on the sources the tarball also carries: Rolldown emits no `.d.ts`, and a `.tsx` next to the
 *     JavaScript is a better declaration than none.
 *
 * `devtools` has no build and ships source as it always has; its `exports` are left alone. `cli` is one bundled
 * file (`bin`), reads the release it belongs to from this same version, and installs that release's tarballs.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

/** What a release ships, in the order it builds: `core` first, the rest depend on it. */
export const shipped = ["core", "icons-lucide", "icons-material", "icons-phosphor", "react", "vanilla", "charts", "editor", "devtools", "cli"] as const;

type Condition = string | { [key: string]: Condition };
interface Manifest {
  name: string;
  version: string;
  scripts?: Record<string, string>;
  exports?: Record<string, Condition>;
  bin?: Record<string, string>;
  publishConfig?: Record<string, unknown>;
  [key: string]: unknown;
}

const manifestPath = (name: string) => join(root, "packages", name, "package.json");
const read = (name: string) => JSON.parse(readFileSync(manifestPath(name), "utf8")) as Manifest;
const write = (name: string, manifest: Manifest) => writeFileSync(manifestPath(name), `${JSON.stringify(manifest, null, 2)}\n`);

const run = (command: string, args: string[], cwd = root) => execFileSync(command, args, { cwd, stdio: "inherit" });

const SEMVER = /^\d+\.\d+\.\d+(-[\w.]+)?$/;

/** `./src/components/button.tsx` → `./dist/components/button.js`; anything else is not source and stays. */
const distOf = (file: string): string | undefined => {
  const match = /^\.\/src\/(.+)\.(?:ts|tsx)$/.exec(file);
  return match ? `./dist/${match[1]}.js` : undefined;
};

/** The exports a tarball carries: the JavaScript from `dist`, the types left on the source beside it. */
export function packedExports(name: string, exports: Record<string, Condition>): Record<string, Condition> {
  const out: Record<string, Condition> = {};
  for (const [subpath, condition] of Object.entries(exports)) {
    const file = typeof condition === "string" ? condition : (condition.default as string | undefined);
    const dist = typeof file === "string" ? distOf(file) : undefined;
    if (!dist || typeof file !== "string") {
      out[subpath] = condition;
      continue;
    }
    /* `core`, `charts`, `editor` and the icon sets are built by `tsc`, which writes declarations beside the JavaScript. */
    const declared = name === "react" || name === "vanilla" ? file : dist.replace(/\.js$/, ".d.ts");
    out[subpath] = { types: declared, default: dist };
  }
  return out;
}

const buildable = (name: string) => Boolean(read(name).scripts?.build);

function bump(version: string): void {
  if (!SEMVER.test(version)) throw new Error(`"${version}" is not a version (x.y.z).`);
  for (const name of shipped) write(name, { ...read(name), version });

  /* The README's install URLs name the version twice each (the tag and the file). */
  for (const file of ["README.md", "packages/cli/README.md"]) {
    const readme = join(root, file);
    const text = readFileSync(readme, "utf8")
    .replace(/## Consuming \d+\.\d+\.\d+(-[\w.]+)?/, `## Consuming ${version}`)
    .replace(/releases\/download\/v[\d.\w-]+\/(skryensya-[\w-]+)-[\d.\w-]+\.tgz/g, `releases/download/v${version}/$1-${version}.tgz`)
    .replace(/`\d+\.\d+\.\d+(-[\w.]+)?` is cut as a GitHub Release/, `\`${version}\` is cut as a GitHub Release`);
    writeFileSync(readme, text);
  }
  console.log(`${shipped.length} packages and the README are at ${version}.`);
}

function build(): void {
  for (const name of shipped) {
    if (!buildable(name)) continue;
    console.log(`\n▸ build ${name}`);
    run("pnpm", ["--filter", read(name).name, "build"]);
  }
}

function pack(out: string): void {
  const versions = new Set(shipped.map((name) => read(name).version));
  if (versions.size !== 1) throw new Error(`The shipped packages disagree on a version: ${[...versions].join(", ")}. Run \`bump\`.`);
  /* The workflow names the tag it was started for; a tag that is not the version in the repo is a mistake, not a release. */
  const tag = process.env.RELEASE_TAG;
  if (tag && tag !== `v${[...versions][0]}`) throw new Error(`Tag ${tag} does not match the packages' version ${[...versions][0]}.`);

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  for (const name of shipped) {
    const original = readFileSync(manifestPath(name), "utf8");
    const manifest = JSON.parse(original) as Manifest;
    try {
      if (manifest.exports && buildable(name)) {
        if (!existsSync(join(root, "packages", name, "dist"))) throw new Error(`${manifest.name} has no dist: run \`build\` first.`);
        write(name, { ...manifest, publishConfig: { ...manifest.publishConfig, exports: packedExports(name, manifest.exports) } });
      }
      console.log(`▸ pack ${manifest.name}`);
      run("pnpm", ["pack", "--pack-destination", out], join(root, "packages", name));
    } finally {
      writeFileSync(manifestPath(name), original);
    }
  }

  const sums = readdirSync(out)
    .filter((file) => file.endsWith(".tgz"))
    .sort()
    .map((file) => `${createHash("sha256").update(readFileSync(join(out, file))).digest("hex")}  ${file}`);
  writeFileSync(join(out, "SHA256SUMS"), `${sums.join("\n")}\n`);
  console.log(`\n${sums.length} tarballs in ${out}`);
}

function verify(dir: string): void {
  const problems: string[] = [];
  const tarballs = readdirSync(dir).filter((file) => file.endsWith(".tgz")).sort();
  if (tarballs.length !== shipped.length) problems.push(`expected ${shipped.length} tarballs, found ${tarballs.length}`);

  for (const file of tarballs) {
    const listing = execFileSync("tar", ["-tzf", join(dir, file)], { encoding: "utf8" }).split("\n").map((line) => line.replace(/^package\//, ""));
    const present = new Set(listing);
    const manifest = JSON.parse(execFileSync("tar", ["-xzOf", join(dir, file), "package/package.json"], { encoding: "utf8" })) as Manifest;

    const expected = new Set(shipped.map((name) => read(name).version));
    if (!expected.has(manifest.version)) problems.push(`${file}: version ${manifest.version} is not the repo's`);

    /* What a consumer's resolver would open: every file an export names has to be in the tarball. */
    const targets: string[] = [];
    const collect = (condition: Condition) => (typeof condition === "string" ? targets.push(condition) : Object.values(condition).forEach(collect));
    for (const [subpath, condition] of Object.entries(manifest.exports ?? {})) {
      if (subpath.includes("*")) continue;
      collect(condition);
    }
    for (const target of new Set(targets)) {
      const path = target.replace(/^\.\//, "");
      if (path.includes("*")) continue;
      if (!present.has(path)) problems.push(`${manifest.name}: export target ${target} is not in the tarball`);
    }
    for (const [command, target] of Object.entries(manifest.bin ?? {})) {
      if (!present.has(target.replace(/^\.\//, ""))) problems.push(`${manifest.name}: bin "${command}" points at ${target}, which is not in the tarball`);
    }

    /* A built package must not hand a consumer TypeScript to run: no `default` may be a source script. */
    if (buildable(manifest.name.replace("@skryensya/", ""))) {
      for (const [subpath, condition] of Object.entries(manifest.exports ?? {})) {
        const runtime = typeof condition === "string" ? condition : condition.default;
        if (typeof runtime === "string" && /^\.\/src\/.+\.(ts|tsx)$/.test(runtime)) problems.push(`${manifest.name}: ${subpath} still runs source (${runtime})`);
      }
    }
    if (/workspace:/.test(JSON.stringify(manifest.dependencies ?? {}))) problems.push(`${manifest.name}: an unresolved workspace: dependency`);
  }

  if (problems.length) {
    console.error(problems.map((problem) => `  ✗ ${problem}`).join("\n"));
    process.exit(1);
  }
  console.log(`${tarballs.length} tarballs verified.`);
}

const [command, argument] = process.argv.slice(2);
if (import.meta.filename === process.argv[1]) {
  const out = resolve(argument ?? join(root, "release"));
  if (command === "bump" && argument) bump(argument);
  else if (command === "build") build();
  else if (command === "pack") pack(out);
  else if (command === "verify") verify(out);
  else {
    console.error("usage: release.ts bump <x.y.z> | build | pack [dir] | verify [dir]");
    process.exit(2);
  }
}
