import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { runAgent, type ProviderConnection } from "@skryensya/maker-agent";
import { makerContext } from "@skryensya/maker-model";
import index from "../../artifacts/ai-index.json" with { type: "json" };
import manifest from "../../artifacts/ai-manifest.json" with { type: "json" };
import { evalFixture, scoreSelection, selectionEvals } from "./cases.js";

// Opt-in, metered live-agent evaluation. No credentials, request headers or transcripts are logged.
const provider = process.env.MAKER_AI_PROVIDER === "anthropic" ? "anthropic" : "openai";
const apiKey = process.env[provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"];
if (!apiKey) throw new Error(`Set ${provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"} to run live selection evals.`);
const connection: ProviderConnection = { provider, apiKey, model: process.env.MAKER_AI_MODEL ?? (provider === "anthropic" ? "claude-sonnet-4-6" : "gpt-4.1") };
const service = createAgentService(asCompiledPair(index, manifest), []);
for (const evalCase of selectionEvals) {
  const { site, view } = evalFixture(evalCase);
  const context = makerContext(site, { id: evalCase.id, revision: 1 }, view);
  let passed = false;
  try {
    for await (const event of runAgent({ connection, site, context, content: evalCase.prompt, service, signal: AbortSignal.timeout(180_000) })) {
      if (event.type === "done" && event.proposal) passed = scoreSelection(evalCase, site, event.proposal.site, view.selectedIds);
    }
  } catch { /* Provider/runtime failure is a failed evaluation, not secret-bearing console output. */ }
  console.log(`${passed ? "PASS" : "FAIL"} ${evalCase.id}`);
  if (!passed) process.exitCode = 1;
}
