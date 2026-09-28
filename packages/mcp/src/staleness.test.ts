import { mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { stalenessCheck } from "./staleness.js";

describe("staleness", () => {
  const dir = mkdtempSync(join(tmpdir(), "mcp-stale-"));
  const index = join(dir, "ai-index.json");
  afterEach(() => rmSync(index, { force: true }));

  const write = (hash: string, at: number) => {
    writeFileSync(index, JSON.stringify({ sourceHash: hash }));
    utimesSync(index, at, at);
  };

  it("says nothing while the catalogue on disk is the one being served", () => {
    write("aaaa", 1000);
    expect(stalenessCheck(index, "aaaa")()).toBeUndefined();
  });

  it("warns, naming both hashes, once the catalogue on disk has moved on", () => {
    const check = stalenessCheck(index, "aaaa");
    write("aaaa", 1000);
    expect(check()).toBeUndefined();
    write("bbbb", 2000);
    expect(check()).toMatch(/aaaa.*bbbb.*restart/s);
  });

  it("says nothing where there is no catalogue to compare with", () => {
    expect(stalenessCheck(join(dir, "missing.json"), "aaaa")()).toBeUndefined();
  });
});
