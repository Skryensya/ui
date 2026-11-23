import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { reviewUsageTree, validateAndEmit } from "@skryensya/ai-compiler/outcomes";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Context } from "../context.js";

/*
 * `validate` and `review`: what the MCP's validate_ui and review_ui answer, from the same code, for a
 * model or a person with no MCP connected. The input is a usage tree as JSON, in a file or on stdin.
 */

export type ComposeOptions = { json?: boolean };

function readTree(source: string | undefined, ctx: Context): UsageTree | undefined {
  if (!source) {
    ctx.error("Say where the tree is: a JSON file, or - for stdin.");
    return undefined;
  }
  try {
    return JSON.parse(source === "-" ? readFileSync(0, "utf8") : readFileSync(resolve(ctx.cwd, source), "utf8")) as UsageTree;
  } catch (error) {
    ctx.error(`Could not read a usage tree from ${source}: ${(error as Error).message}`);
    return undefined;
  }
}

export function validate(source: string | undefined, options: ComposeOptions, ctx: Context): number {
  const tree = readTree(source, ctx);
  if (!tree) return 1;
  const outcome = validateAndEmit(tree);
  if (options.json) {
    ctx.log(JSON.stringify(outcome, null, 2));
    return outcome.valid ? 0 : 1;
  }
  if (!outcome.valid) {
    ctx.error(`Invalid: ${outcome.problems.length} problem${outcome.problems.length === 1 ? "" : "s"}. Nothing emitted.`);
    for (const problem of outcome.problems) ctx.error(`  ${JSON.stringify(problem)}`);
    return 1;
  }
  ctx.log("// React");
  ctx.log(outcome.emitted.react);
  if (outcome.emitted.reactData) {
    ctx.log(`\n// ${outcome.emitted.reactData.file}`);
    ctx.log(outcome.emitted.reactData.source);
  }
  ctx.log("\n<!-- HTML (Vanilla) -->");
  ctx.log(outcome.emitted.vanilla);
  ctx.log(`\n/* Stylesheets, in order: ${outcome.css.join(", ")} */`);
  return 0;
}

export function review(source: string | undefined, options: ComposeOptions, ctx: Context): number {
  const tree = readTree(source, ctx);
  if (!tree) return 1;
  const outcome = reviewUsageTree(tree);
  const failed = !outcome.valid || !outcome.review?.passes;
  if (options.json) {
    ctx.log(JSON.stringify(outcome, null, 2));
    return failed ? 1 : 0;
  }
  if (!outcome.valid) {
    ctx.error(outcome.hint);
    for (const problem of outcome.problems) ctx.error(`  ${JSON.stringify(problem)}`);
    return 1;
  }
  for (const finding of outcome.review!.findings) {
    ctx.log(`${finding.severity === "error" ? "error" : "warn "} ${finding.rule}  at ${finding.path}`);
    ctx.log(`      ${finding.message}`);
    ctx.log(`      fix: ${finding.fix}  (${finding.reference})`);
  }
  ctx.log(outcome.hint);
  return failed ? 1 : 0;
}
