import { fileURLToPath } from "node:url";
import { evalSystemPrompts, handoutSystemPrompts, type Workflow } from "./system-prompt.js";

/*
 * WHICH SERVER AND WHICH FRAMING a run measures, set once by `run-agent.ts` and read by every
 * provider. It exists so the discovery workflow can be compared against the one it replaced on the
 * same cases: `--workflow catalog --server <path>` points at a build of the previous server (the
 * README says how to make one) with the framing its agents were given.
 */
/**
 * WHAT THE AGENT IS HANDED, so the three channels can be measured on the same cases:
 *   - `mcp`: the MCP server alone (the default, what this harness always measured);
 *   - `skill`: no MCP; the `skryensya-ui` skill, the docs shipped in @skryensya/core and the CLI;
 *   - `docs`: no MCP, no skill, no CLI; only the docs shipped in @skryensya/core.
 * Only the `claude-code` provider runs `skill` and `docs`: they need an agent with files and a shell.
 */
export type Handout = "mcp" | "skill" | "docs";

export type RunConfig = {
  readonly workflow: Workflow;
  readonly handout: Handout;
  /** Absolute path to the stdio server entry every provider spawns. */
  readonly serverEntry: string;
};

const defaultEntry = fileURLToPath(new URL("../../packages/mcp/dist/index.js", import.meta.url));

let current: RunConfig = { workflow: "discovery", handout: "mcp", serverEntry: defaultEntry };

export function configureRun(config: Partial<RunConfig>): RunConfig {
  current = { ...current, ...config };
  return current;
}

export const runConfig = (): RunConfig => current;
export const systemPrompt = (): string => (current.handout === "mcp" ? evalSystemPrompts[current.workflow] : handoutSystemPrompts[current.handout]);
