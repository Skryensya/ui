import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildInstallManifest, summarizeContract, type ManifestContract } from "./install-manifest.ts";

/* A variable specifier on purpose: the scripts' own `tsc` program has no DOM lib, and importing the
   registry statically would drag every contract's sources (and their DOM types) into it. */
const registryPath = "../src/registry.js";
const registry = (await import(/* @vite-ignore */ registryPath)) as {
  contractIds(): readonly string[];
  getContract(id: string): ManifestContract;
};

const packagesDir = join(import.meta.dirname, "../..");
const committed = JSON.parse(readFileSync(join(import.meta.dirname, "../install-manifest.json"), "utf8")) as Record<string, { appearance?: { of: string; value: string } }>;

const contracts = registry.contractIds().map((id) => summarizeContract(id, registry.getContract(id)));

describe("install manifest", () => {
  it("is the one the sources produce (run `pnpm --filter @skryensya/core build` when this fails)", () => {
    expect(committed).toEqual(buildInstallManifest({ packagesDir, contracts }));
  });

  it("lists every contract, plus one entry per appearance a contract splits into its own sheet", () => {
    const components = Object.keys(committed).filter((id) => !committed[id]!.appearance).sort();
    expect(components).toEqual([...registry.contractIds()].sort());
    for (const [id, entry] of Object.entries(committed)) {
      if (!entry.appearance) continue;
      expect(id).toBe(`${entry.appearance.of}.${entry.appearance.value}`);
      expect(registry.contractIds()).toContain(entry.appearance.of);
    }
    expect(Object.keys(committed).length).toBeGreaterThan(components.length);
  });
});
