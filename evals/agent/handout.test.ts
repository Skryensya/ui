import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { prepareWorkspace } from "./claude-code-provider.js";

/* The project an agent without the MCP is handed, checked without calling a model. */

const dirs: string[] = [];
const fresh = () => {
  const dir = mkdtempSync(join(tmpdir(), "sk-handout-"));
  dirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the handout workspaces", () => {
  it("docs: only the docs @skryensya/core ships", async () => {
    const dir = fresh();
    await prepareWorkspace(dir, "docs");
    expect(existsSync(join(dir, "node_modules/@skryensya/core/docs/llms.txt"))).toBe(true);
    expect(existsSync(join(dir, ".claude/skills"))).toBe(false);
    expect(existsSync(join(dir, "node_modules/.bin/skryensya"))).toBe(false);
  });

  // The CLI shim runs the built bundle: `pnpm --filter @skryensya/cli build` first.
  it.skipIf(!existsSync(join(import.meta.dirname, "../../packages/cli/dist/cli.js")))("skill: the skill where Claude Code loads it, and a CLI that validates", async () => {
    const dir = fresh();
    await prepareWorkspace(dir, "skill");
    expect(existsSync(join(dir, ".claude/skills/skryensya-ui/SKILL.md"))).toBe(true);
    writeFileSync(join(dir, "tree.json"), JSON.stringify({ contract: "button", signature: "Button.action", children: "Save" }));
    const out = execFileSync(join(dir, "node_modules/.bin/skryensya"), ["validate", "tree.json"], { cwd: dir, encoding: "utf8" });
    expect(out).toContain("@skryensya/react/button");
  });

  it("mcp: nothing on disk; the server is the handout", async () => {
    const dir = fresh();
    await prepareWorkspace(dir, "mcp");
    expect(existsSync(join(dir, "node_modules"))).toBe(false);
  });
});
