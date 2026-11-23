import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { library } from "@skryensya/examples";
import { canonicalTrees } from "@skryensya/examples/canonical";
import { createAgentService } from "./agent.js";
import { renderAgentDocs, type EmittedExample } from "./agent-docs.js";
import type { CompiledPair } from "./artifact.js";

/** Where the docs live: inside `@skryensya/core`, which ships them in its tarball. */
export const agentDocsDir = (root: string) => join(root, "packages", "core", "docs");

/** The docs for a compiled pair, each signature's example emitted by the same service the MCP serves. */
export function buildAgentDocs(pair: CompiledPair): Readonly<Record<string, string>> {
  const service = createAgentService(pair, library);
  const examples = new Map<string, EmittedExample>();
  for (const canonical of canonicalTrees) {
    const signature = canonical.tree.signature;
    if (examples.has(signature)) continue;
    const outcome = service.validate(canonical.tree);
    if (!outcome.ok || !outcome.value.valid) continue;
    const { emitted, css } = outcome.value;
    examples.set(signature, { name: canonical.name, tree: canonical.tree, react: emitted.react, vanilla: emitted.vanilla, reactData: emitted.reactData, css });
  }
  return renderAgentDocs({ index: pair.index, manifest: pair.manifest, exampleFor: (signature) => examples.get(signature) });
}

const listFiles = (dir: string, prefix = ""): string[] => {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => (entry.isDirectory() ? listFiles(join(dir, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`]));
};

/** The committed files that differ from the render, are missing or should not be there. */
export function staleAgentDocs(dir: string, files: Readonly<Record<string, string>>): string[] {
  const onDisk = new Set(listFiles(dir));
  const stale = Object.entries(files)
    .filter(([path, content]) => !onDisk.has(path) || readFileSync(join(dir, path), "utf8") !== content)
    .map(([path]) => path);
  const extra = [...onDisk].filter((path) => !(path in files));
  return [...stale, ...extra].sort();
}

/** Writes the render and removes a family page whose family is gone. */
export function writeAgentDocs(dir: string, files: Readonly<Record<string, string>>): void {
  for (const path of listFiles(dir)) if (!(path in files)) rmSync(join(dir, path));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
}
