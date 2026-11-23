import { spawn } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { validateAndEmit } from "@skryensya/ai-compiler/outcomes";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { EvalCase } from "../case.js";
import type { ToolCallRecord } from "./mcp-tools.js";
import { scoreCase, type CaseScore, type RunUsage } from "./scoring.js";
import { runConfig, systemPrompt, type Handout } from "./run-config.js";

const repo = fileURLToPath(new URL("../../", import.meta.url));

/*
 * THE OTHER WAY TO DRIVE G6: instead of a hand-rolled agent loop (`harness.ts`), spawn the actual
 * `claude` CLI headless (`claude -p`) and let it use its OWN agent loop against the SAME server.
 *
 * Runs from a FRESH TEMP DIRECTORY, not the repo root. Measured live: from the repo root, `Read`
 * (the one built-in tool `--permission-mode dontAsk` lets through unconditionally, per the platform's
 * own read-only command set; `Bash`, `Write` and everything else got a real `permission_denied`
 * event, confirmed in the stream) was enough for the agent to read this very repo's source directly,
 * once even reading the eval case file's OWN reference tree before calling a single MCP tool. A
 * repo-root run cannot tell "composed it right" from "found the answer lying around", so it isn't
 * one. `--mcp-config` here is INLINE JSON naming the server by its ABSOLUTE built path
 * (`packages/mcp/dist/index.js`), not `.mcp.json`: that file's own `args` entry is repo-relative,
 * and would silently fail to resolve from anywhere else.
 *
 * `--strict-mcp-config` still matters even alone in a scratch directory: without it, every OTHER
 * MCP server in the runner's own `~/.claude` (this repo's own figma/gmail/etc.) would also be
 * sitting in the model's tool list. From a scratch directory, `Read` still exists but has nothing of
 * this repo left to find.
 *
 * This runs WITHOUT `--bare`: it uses the session's own subscription login, not a separate
 * `ANTHROPIC_API_KEY` (see `providers.ts`'s `claudeCodeProvider`); that is the one thing that makes
 * this provider worth having alongside `harness.ts`'s API-key-metered path).
 */

const MCP_SERVER_NAME = "skryensya-ui";
const MCP_TOOL_PREFIX = `mcp__${MCP_SERVER_NAME}__`;

const mcpConfigInline = () =>
  JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: { command: "node", args: [runConfig().serverEntry] } } });

interface StreamContentBlock {
  type: string;
  [key: string]: unknown;
}

interface StreamEvent {
  type: string;
  message?: { content?: StreamContentBlock[] };
  [key: string]: unknown;
}

export interface ClaudeCodeOptions {
  model?: string;
  verbose?: boolean;
}

export async function runCaseWithClaudeCode(
  evalCase: EvalCase,
  lang: "es" | "en",
  options: ClaudeCodeOptions = {},
): Promise<CaseScore> {
  const handout = runConfig().handout;
  const { events, tree } = await spawnClaude(evalCase.prompt[lang], options, handout);
  const calls = extractRecords(events, handout);
  /* Without the MCP, the tree the agent wrote stands in for its last validate_ui call, judged by the same code. */
  if (handout !== "mcp") {
    calls.push(
      tree === undefined
        ? { name: "validate_ui", args: {}, error: "no tree.json was written" }
        : { name: "validate_ui", args: { tree }, result: validateAndEmit(tree) },
    );
  }

  if (options.verbose) {
    console.log(`  [${evalCase.id}/${lang}] tools called: ${calls.map((c) => c.name).join(" -> ") || "(none)"}`);
  }

  const usage = usageOf(events);
  return { ...scoreCase(evalCase, lang, calls), ...(usage ? { usage } : {}) };
}

/** The final `result` event carries what the run cost. */
function usageOf(events: StreamEvent[]): RunUsage | undefined {
  const result = [...events].reverse().find((event) => event.type === "result") as
    | { total_cost_usd?: number; num_turns?: number; duration_ms?: number; usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number } }
    | undefined;
  if (!result) return undefined;
  const usage = result.usage ?? {};
  return {
    costUsd: result.total_cost_usd ?? 0,
    turns: result.num_turns ?? 0,
    durationMs: result.duration_ms ?? 0,
    inputTokens: (usage.input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0),
    outputTokens: usage.output_tokens ?? 0,
  };
}

/*
 * The project an agent without the MCP starts in: what a consumer's project would hold after
 * installing the kit, and nothing of this repo. `docs` gets the docs @skryensya/core ships; `skill`
 * also gets the skill (where Claude Code loads project skills) and the CLI on `npx skryensya`.
 */
export async function prepareWorkspace(cwd: string, handout: Handout): Promise<void> {
  if (handout === "mcp") return;
  const core = join(cwd, "node_modules", "@skryensya", "core");
  await mkdir(core, { recursive: true });
  await cp(join(repo, "packages/core/docs"), join(core, "docs"), { recursive: true });
  await writeFile(join(core, "package.json"), JSON.stringify({ name: "@skryensya/core", private: true }));
  if (handout !== "skill") return;
  await cp(join(repo, "packages/core/skills/skryensya-ui"), join(cwd, ".claude/skills/skryensya-ui"), { recursive: true });
  const bin = join(cwd, "node_modules", ".bin");
  await mkdir(bin, { recursive: true });
  await writeFile(join(bin, "skryensya"), `#!/bin/sh\nexec node "${join(repo, "packages/cli/dist/cli.js")}" "$@"\n`);
  await chmod(join(bin, "skryensya"), 0o755);
  await writeFile(join(cwd, "package.json"), JSON.stringify({ name: "eval-project", private: true }));
}

const TOOLS: Record<Handout, string> = {
  mcp: `mcp__${MCP_SERVER_NAME}`,
  skill: "Read,Glob,Grep,Write,Edit,Skill,Bash(npx skryensya:*),Bash(skryensya:*)",
  docs: "Read,Glob,Grep,Write,Edit",
};

async function spawnClaude(prompt: string, options: ClaudeCodeOptions, handout: Handout): Promise<{ events: StreamEvent[]; tree?: UsageTree }> {
  const args = [
    "-p",
    prompt,
    "--append-system-prompt",
    systemPrompt(),
    ...(handout === "mcp" ? ["--mcp-config", mcpConfigInline()] : []),
    "--strict-mcp-config",
    "--allowedTools",
    TOOLS[handout],
    "--permission-mode",
    "dontAsk",
    "--output-format",
    "stream-json",
    "--verbose",
  ];
  if (options.model) args.push("--model", options.model);

  // Isolated per call: nothing of this repo is reachable from here, so Bash/Read/grep have nothing
  // to find, and the only path to a correct composition is the MCP tools.
  const cwd = await mkdtemp(join(tmpdir(), "skryensya-eval-"));
  await prepareWorkspace(cwd, handout);

  try {
    const events = await new Promise<StreamEvent[]>((resolve, reject) => {
      const child = spawn("claude", args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        /*
         * Claude Code caps any MCP tool result at 25,000 tokens by default (`MAX_MCP_OUTPUT_TOKENS`),
         * a HARD rejection: without this, `get_catalog`'s ~110KB payload and a `validate_ui` response
         * for a complex composition (`paginated-data-table`, ~94KB) both tripped it, and the agent
         * never saw the result at all. Raising the cap removes that at its source.
         *
         * A SEPARATE, lower, fixed threshold still persists a large result to a file instead of
         * inlining it (Claude Code's own doc: "the warning threshold is fixed"), and no env var moves
         * it: `get_catalog` still triggers this every time, regardless of the cap above. Measured
         * live, this costs turns (a `Read` on the saved file) but not correctness or fairness. It's
         * the agent reading back its OWN tool's output, not repo source; confirmed the agent still
         * converges on a correct `validate_ui` call afterward. Left as a real, load-bearing cost of
         * this provider rather than something to route around further.
         */
        env: { ...process.env, MAX_MCP_OUTPUT_TOKENS: "100000" },
      });

      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => (stdout += chunk));
      child.stderr.on("data", (chunk: Buffer) => (stderr += chunk));
      child.on("error", (error) => {
        reject(new Error(`Could not spawn \`claude\`: ${error.message}. Is it installed and on PATH?`));
      });
      child.on("close", (code) => {
        const events = stdout
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => JSON.parse(line) as StreamEvent);

        if (events.length === 0) {
          reject(new Error(`claude -p exited ${code} with no output.\n${stderr.slice(0, 1000)}`));
          return;
        }
        resolve(events);
      });
    });
    if (handout === "mcp") return { events };
    const tree = await readFile(join(cwd, "tree.json"), "utf8").then(
      (text) => JSON.parse(text) as UsageTree,
      () => undefined,
    );
    return { events, tree };
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

/**
 * Pairs each `tool_use` block for one of OUR tools with its `tool_result`, by the id the
 * stream itself uses to correlate them. Every other tool_use (ToolSearch, Read: the platform's own
 * tools, still available even though only `mcp__skryensya-ui` is pre-approved) is not ours to score
 * and is left out.
 */
/** MCP runs record the server's tools by their own names; the other handouts record every tool (Read, Bash, Skill). */
function extractRecords(events: StreamEvent[], handout: Handout): ToolCallRecord[] {
  const prefix = handout === "mcp" ? MCP_TOOL_PREFIX : "";
  const pending = new Map<string, { name: string; args: unknown }>();
  const records: ToolCallRecord[] = [];

  for (const event of events) {
    const blocks = event.message?.content ?? [];

    if (event.type === "assistant") {
      for (const block of blocks) {
        if (
          block.type === "tool_use" &&
          typeof block.name === "string" &&
          block.name.startsWith(prefix) &&
          typeof block.id === "string"
        ) {
          pending.set(block.id, { name: block.name.slice(prefix.length), args: block.input });
        }
      }
    } else if (event.type === "user") {
      for (const block of blocks) {
        if (block.type !== "tool_result" || typeof block.tool_use_id !== "string") continue;
        const call = pending.get(block.tool_use_id);
        if (!call) continue;
        records.push(prefix ? toRecord(call, block.content) : { name: call.name, args: call.args });
      }
    }
  }

  return records;
}

/**
 * Two shapes arrive, and both are the server's JSON value:
 *   - `[{ type: "text", text: "<json>" }]`, the text block every result carries;
 *   - a plain string holding that JSON. Since the server returns `structuredContent`, Claude Code
 *     presents the structured value to the model instead of the text block, and the stream carries
 *     it as a string. Measured on the first discovery-workflow run: a valid `validate_ui` was scored
 *     as a failed call because only the first shape was read.
 * A string that is not JSON is a synthetic Claude Code error (for example "exceeds maximum allowed
 * tokens") and is recorded as a failed call, the same as a thrown MCP error on the other path.
 */
function toRecord(call: { name: string; args: unknown }, content: unknown): ToolCallRecord {
  const text =
    Array.isArray(content) && content[0]?.type === "text" && typeof content[0].text === "string"
      ? content[0].text
      : typeof content === "string"
        ? content
        : undefined;

  if (text === undefined) {
    return { name: call.name, args: call.args, error: JSON.stringify(content) };
  }

  try {
    const result: unknown = JSON.parse(text);
    if (result && typeof result === "object") return { name: call.name, args: call.args, result };
  } catch {
    // Not JSON: fall through to the error record below.
  }
  return {
    name: call.name,
    args: call.args,
    error: typeof content === "string" ? content : `unparseable tool result: ${text.slice(0, 200)}`,
  };
}
