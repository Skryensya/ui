import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Context } from "./context.js";

/** A throwaway project on disk: `files` maps a relative path to its content. */
export function makeProject(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "skryensya-cli-"));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
  return dir;
}

export const pkg = (deps: Record<string, string>, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ name: "app", dependencies: deps, ...extra });

/** A context that records what a command printed and which commands it ran, and runs nothing. */
export function capture(cwd: string, exitCode = 0) {
  const out: string[] = [];
  const err: string[] = [];
  const runs: string[] = [];
  const ctx: Context = {
    cwd,
    log: (line = "") => out.push(line),
    error: (line) => err.push(line),
    run: (command, args) => {
      runs.push([command, ...args].join(" "));
      return exitCode;
    },
  };
  return { ctx, out: () => out.join("\n"), err: () => err.join("\n"), runs };
}
