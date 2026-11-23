import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { agentDocsDir, buildAgentDocs, staleAgentDocs } from "./agent-docs-files.js";
import { asCompiledPair } from "./artifact.js";

const root = join(import.meta.dirname, "..", "..", "..");
const read = (name: string) => JSON.parse(readFileSync(join(root, "artifacts", name), "utf8"));
const pair = asCompiledPair(read("ai-index.json"), read("ai-manifest.json"));
const docs = buildAgentDocs(pair);

describe("the docs shipped in @skryensya/core", () => {
  it("are the render of the committed artifacts: rebuild with `pnpm --filter @skryensya/ai-compiler build`", () => {
    expect(staleAgentDocs(agentDocsDir(root), docs)).toEqual([]);
  });

  it("have a page for every family the catalogue offers, linked from the index", () => {
    for (const entry of pair.index.contracts) {
      expect(docs[`components/${entry.id}.md`], entry.id).toBeDefined();
      expect(docs["llms.txt"]).toContain(`(components/${entry.id}.md)`);
    }
  });

  it("give most signatures an emitted example, so a model without the MCP copies real output", () => {
    const pages = Object.entries(docs).filter(([path]) => path.startsWith("components/"));
    const withExample = pages.filter(([, page]) => page.includes("```tsx"));
    expect(withExample.length / pages.length).toBeGreaterThan(0.8);
  });
});
