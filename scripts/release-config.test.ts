import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { shipped } from "./release.ts";

const root = resolve(import.meta.dirname, "..");
const contents = (path: string, base = root) => readFileSync(join(base, path), "utf8");
const readmes = ["README.md", "packages/cli/README.md"];
const manifests = shipped.map((name) => `packages/${name}/package.json`);

test("Release Please covers the coordinated release without versioning internal workspaces", () => {
  const config = JSON.parse(contents("release-please-config.json"));
  const manifest = JSON.parse(contents(".release-please-manifest.json"));
  const version = contents("version.txt").trim();

  assert.equal(config["release-type"], "simple");
  assert.equal(config["include-component-in-tag"], false);
  assert.equal(config["include-v-in-tag"], true);
  assert.deepEqual(Object.keys(config.packages), ["."]);
  assert.deepEqual(manifest, { ".": version });
  assert.deepEqual([...config.packages["."]["extra-files"]].sort(), [...manifests, ...readmes].sort());
  for (const path of manifests) assert.equal(JSON.parse(contents(path)).version, version, path);
});

test("the manual bump keeps Release Please state and install examples in sync", (t) => {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), "skryensya-release-")));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  for (const path of ["scripts/release.ts", "version.txt", ".release-please-manifest.json", ...manifests, ...readmes]) {
    mkdirSync(dirname(join(fixture, path)), { recursive: true });
    copyFileSync(join(root, path), join(fixture, path));
  }

  execFileSync(process.execPath, [join(fixture, "scripts/release.ts"), "bump", "0.2.0"]);
  assert.equal(contents("version.txt", fixture), "0.2.0\n");
  assert.deepEqual(JSON.parse(contents(".release-please-manifest.json", fixture)), { ".": "0.2.0" });
  for (const path of manifests) assert.equal(JSON.parse(contents(path, fixture)).version, "0.2.0", path);

  for (const path of readmes) {
    const before = contents(path);
    const after = contents(path, fixture);
    assert.ok(after.includes("SKRYENSYA_VERSION=0.2.0"), path);
    assert.equal(
      (after.match(/SKRYENSYA_VERSION=0\.2\.0/g) ?? []).length,
      (before.match(/SKRYENSYA_VERSION=/g) ?? []).length,
      path,
    );
    assert.ok(after.includes("v${SKRYENSYA_VERSION}/skryensya-"), path);
  }
  assert.ok(contents("README.md", fixture).includes("## Consuming 0.2.0"));
});
