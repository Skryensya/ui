import { readFileSync } from "node:fs";
import { join } from "node:path";
import { agentDocsDir, buildAgentDocs, writeAgentDocs } from "./agent-docs-files.js";
import { asCompiledPair } from "./artifact.js";

/* Renders packages/core/docs from the committed artifacts alone, without the build's gates: `build` does this too. */
const root = process.argv[2] ?? process.cwd();
const read = (name: string) => JSON.parse(readFileSync(join(root, "artifacts", name), "utf8"));
const docs = buildAgentDocs(asCompiledPair(read("ai-index.json"), read("ai-manifest.json")));
writeAgentDocs(agentDocsDir(root), docs);
console.log(`  packages/core/docs: ${Object.keys(docs).length} files`);
