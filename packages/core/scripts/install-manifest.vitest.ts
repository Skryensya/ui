import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildInstallManifest } from "./install-manifest.ts";

/* A variable specifier on purpose: the scripts' own `tsc` program has no DOM lib, and importing the
   registry statically would drag every contract's sources (and their DOM types) into it. */
const registryPath = "../src/registry.js";
const registry = (await import(/* @vite-ignore */ registryPath)) as {
  contractIds(): readonly string[];
  getContract(id: string): { category?: string; css: string; signatures: Record<string, { react?: { name: string } }> };
};

const packagesDir = join(import.meta.dirname, "../..");
const committed = JSON.parse(readFileSync(join(import.meta.dirname, "../install-manifest.json"), "utf8")) as Record<string, unknown>;

const contracts = registry.contractIds().map((id) => {
  const { category, css, signatures } = registry.getContract(id);
  const reactNames = [...new Set(Object.values(signatures).flatMap((signature) => (signature.react ? [signature.react.name] : [])))];
  return { id, category: category ?? "", css, reactNames };
});

describe("install manifest", () => {
  it("is the one the sources produce (run `pnpm --filter @skryensya/core build` when this fails)", () => {
    expect(committed).toEqual(buildInstallManifest({ packagesDir, contracts }));
  });

  it("lists every contract", () => {
    expect(Object.keys(committed).sort()).toEqual([...registry.contractIds()].sort());
  });
});
