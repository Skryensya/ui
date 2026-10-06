import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { runAgent, type ProviderConnection } from "@skryensya/maker-agent";
import { counterIds, createSite, fromUsageTree, makerContext, toUsageTree, type MakerAgentView, type MakerSite } from "@skryensya/maker-model";
import index from "../../artifacts/ai-index.json" with { type: "json" };
import manifest from "../../artifacts/ai-manifest.json" with { type: "json" };
import { textsOf } from "./ui-checks.js";
import { uiCases, type UiCase } from "./ui-cases.js";
import { scoreAttempt } from "./ui-score.js";

/*
 * THE UI BENCH, LIVE. Runs Maker's own embedded agent (the same runAgent the panel uses: brief, tools, review) against each
 * case N times, scores every attempt, and writes a report to runs/ that a later run can be compared with. Metered: it makes real
 * model calls, so it only runs when asked and never logs the key or the transcripts.
 *
 *   OPENAI_API_KEY=… pnpm --filter @skryensya/evals maker-ui                          every case, 3 attempts each
 *   … maker-ui --family hero,table --n 5                                              only these families
 *   … maker-ui --case pricing-three-plans --lang es                                   one case, in Spanish
 *   … maker-ui --proceed                                                              adds "just do it": measures the build, not the questions
 *   … maker-ui --baseline runs/2026-10-05T12-00-00-gpt-6-sol.json                     print the change against an earlier run
 *   MAKER_AI_PROVIDER=anthropic ANTHROPIC_API_KEY=… MAKER_AI_MODEL=… pnpm … maker-ui  another provider or model
 */
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const value = (name: string) => { const at = args.indexOf(`--${name}`); return at >= 0 ? args[at + 1] : undefined; };

const provider = process.env.MAKER_AI_PROVIDER === "anthropic" ? "anthropic" : "openai";
const apiKey = process.env[provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"];
if (!apiKey) throw new Error(`Set ${provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"} to run the live UI bench.`);
const model = process.env.MAKER_AI_MODEL ?? (provider === "anthropic" ? "claude-sonnet-4-6" : "gpt-4.1");
const connection: ProviderConnection = { provider, apiKey, model };

const attempts = Number(value("n") ?? 3);
const lang = value("lang") === "es" ? "es" : "en";
const families = value("family")?.split(",");
const only = value("case")?.split(",");
const selected = uiCases.filter((entry) => (!families || families.includes(entry.family)) && (!only || only.includes(entry.id)));
if (selected.length === 0) throw new Error("No case matches --family / --case.");

const service = createAgentService(asCompiledPair(index, manifest), []);
const VIEW = (page: string): MakerAgentView => ({ page, selected: undefined, selectedIds: [], width: 36, scheme: "light", contrast: false, density: "default", mode: "edit" });

type Attempt = { pass: boolean; outcome: "built" | "asked" | "nothing" | "error"; failures: string[]; warnings: string[]; seconds: number; operations: number; reviews: number; answer: string; shape: Record<string, number>; error?: string };

function siteFor(entry: UiCase): MakerSite {
  const base = createSite("bench", counterIds("page"));
  const root = fromUsageTree({ contract: "layout", signature: "Main", children: [...(entry.start ?? [])] }, counterIds("node"));
  return { ...base, pages: [{ ...base.pages[0]!, root }] };
}

async function attempt(entry: UiCase): Promise<Attempt> {
  const site = siteFor(entry);
  const page = site.pages[0]!;
  const context = makerContext(site, { id: entry.id, revision: 1 }, VIEW(page.id));
  const given = `${entry.prompt.en} ${entry.prompt.es} ${(entry.start ?? []).flatMap((tree) => textsOf(tree)).join(" ")}`;
  const content = `${entry.prompt[lang]}${flag("proceed") ? " Just do it." : ""}`;
  const started = Date.now();
  let reviews = 0;
  let result: Attempt = { pass: false, outcome: "nothing", failures: ["the agent proposed nothing"], warnings: [], seconds: 0, operations: 0, reviews: 0, answer: "", shape: {} };
  try {
    for await (const event of runAgent({ connection, site, context, content, service, signal: AbortSignal.timeout(300_000) })) {
      if (event.type === "status" && /Checking/.test(event.text)) reviews++;
      if (event.type !== "done") continue;
      if (event.questions?.length) { result = { ...result, outcome: "asked", failures: [`asked ${event.questions.length} question(s) instead of building: ${event.questions.map((q) => q.title).join("; ")}`], answer: event.text }; continue; }
      if (!event.proposal) { result = { ...result, answer: event.text }; continue; }
      const tree = toUsageTree(event.proposal.site.pages[0]!.root);
      const score = scoreAttempt(entry, tree, given);
      const shape: Record<string, number> = {};
      const walk = (node: { signature: string; children?: unknown; slots?: Record<string, unknown> }) => {
        shape[node.signature] = (shape[node.signature] ?? 0) + 1;
        const kids = [node.children, ...Object.values(node.slots ?? {})].flat();
        for (const kid of kids) if (kid && typeof kid === "object" && "signature" in kid) walk(kid as never);
      };
      walk(tree);
      result = { pass: score.pass, outcome: "built", failures: [...score.failures], warnings: [...score.warnings], seconds: 0, operations: event.proposal.operations.length, reviews: 0, answer: event.text, shape };
    }
  } catch (error) {
    /* A provider or runtime failure is a failed attempt, never output that could carry a secret. */
    const why = error instanceof Error ? error.message.split(apiKey!).join("[key]").slice(0, 200) : "failed";
    result = { ...result, outcome: "error", failures: [`the run failed: ${why}`], error: why };
  }
  return { ...result, seconds: Math.round((Date.now() - started) / 100) / 10, reviews };
}

const report: { at: string; provider: string; model: string; lang: string; attempts: number; cases: Record<string, { family: string; attempts: Attempt[] }> } = { at: new Date().toISOString(), provider, model, lang, attempts, cases: {} };

console.log(`UI bench · ${provider}/${model} · ${selected.length} cases × ${attempts} · ${lang}${flag("proceed") ? " · proceed" : ""}\n`);
for (const entry of selected) {
  const runs: Attempt[] = [];
  for (let n = 0; n < attempts; n++) runs.push(await attempt(entry));
  report.cases[entry.id] = { family: entry.family, attempts: runs };
  const passed = runs.filter((run) => run.pass).length;
  const asked = runs.filter((run) => run.outcome === "asked").length;
  const seconds = runs.reduce((sum, run) => sum + run.seconds, 0) / runs.length;
  console.log(`${passed === runs.length ? "PASS" : passed === 0 ? "FAIL" : "FLAKY"}  ${entry.id.padEnd(26)} ${passed}/${runs.length}  ${seconds.toFixed(1)}s avg${asked ? `  asked ${asked}` : ""}`);
  const tally = new Map<string, number>();
  for (const run of runs) for (const failure of run.failures) tally.set(failure, (tally.get(failure) ?? 0) + 1);
  for (const [failure, count] of [...tally].sort((a, b) => b[1] - a[1]).slice(0, 3)) console.log(`        ${count}× ${failure.slice(0, 150)}`);
  const warned = runs.flatMap((run) => run.warnings);
  if (warned.length) console.log(`        ⚠ ${[...new Set(warned)].slice(0, 3).join(", ")}`);
}

const all = Object.values(report.cases).flatMap((entry) => entry.attempts);
console.log(`\nTotal ${all.filter((run) => run.pass).length}/${all.length} attempts pass`);

const baselinePath = value("baseline");
if (baselinePath) {
  const before = JSON.parse(readFileSync(baselinePath, "utf8")) as typeof report;
  console.log(`\nChange against ${baselinePath}:`);
  for (const [id, now] of Object.entries(report.cases)) {
    const was = before.cases[id];
    if (!was) continue;
    const rate = (runs: Attempt[]) => runs.filter((run) => run.pass).length / runs.length;
    const delta = Math.round((rate(now.attempts) - rate(was.attempts)) * 100);
    if (delta !== 0) console.log(`  ${delta > 0 ? "▲" : "▼"} ${id.padEnd(26)} ${Math.round(rate(was.attempts) * 100)}% → ${Math.round(rate(now.attempts) * 100)}%`);
  }
}

mkdirSync(new URL("./runs/", import.meta.url), { recursive: true });
const file = `runs/${report.at.replace(/[:.]/g, "-").slice(0, 19)}-${model.replace(/[^\w.-]/g, "_")}.json`;
writeFileSync(new URL(`./${file}`, import.meta.url), JSON.stringify(report, null, 2));
console.log(`\nSaved ${file}`);
if (all.some((run) => !run.pass)) process.exitCode = 1;
