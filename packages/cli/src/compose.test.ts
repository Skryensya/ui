import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { main } from "./main.js";

const run = (args: string[], tree: unknown) => {
  const dir = mkdtempSync(join(tmpdir(), "sk-compose-"));
  writeFileSync(join(dir, "tree.json"), JSON.stringify(tree));
  const out: string[] = [];
  const err: string[] = [];
  const code = main([...args, "tree.json"], { cwd: dir, log: (line = "") => out.push(line), error: (line) => err.push(line), run: () => 0 });
  return { code, out: out.join("\n"), err: err.join("\n") };
};

const button = { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: "Save" };

describe("validate and review without the MCP", () => {
  it("prints the React and the HTML of a valid tree", () => {
    const { code, out } = run(["validate"], button);
    expect(code).toBe(0);
    expect(out).toContain('import { Button } from "@skryensya/react/button"');
    expect(out).toContain("data-sk-button");
  });

  it("emits nothing for an invalid tree, and says why", () => {
    const { code, out, err } = run(["validate"], { ...button, options: { tone: "loud" } });
    expect(code).toBe(1);
    expect(out).toBe("");
    expect(err).toContain("Nothing emitted");
  });

  it("fails a review on an accessibility error, with the fix", () => {
    const fake = { contract: "box", signature: "Box", options: { padding: "md" }, attrs: { role: "listbox" }, children: { contract: "typography", signature: "Text", children: "x" } };
    const { code, out } = run(["review"], fake);
    expect(code).toBe(1);
    expect(out).toContain("hand-rolled-widget");
    expect(out).toContain("fix:");
  });

  it("answers in the MCP's shape with --json", () => {
    const { out } = run(["validate", "--json"], button);
    expect(JSON.parse(out)).toMatchObject({ valid: true, emitted: { react: expect.any(String) } });
  });
});
