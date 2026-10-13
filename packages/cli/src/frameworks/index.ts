import type { Project } from "../project.js";
import { astro } from "./astro.js";
import { next } from "./next.js";
import { reactRouter } from "./react-router.js";
import { tanstackStart } from "./tanstack-start.js";
import { vite } from "./vite.js";
import type { FrameworkAdapter } from "./types.js";

/** Every framework the CLI knows. Adding one is adding a file here and a line below. */
export const adapters: readonly FrameworkAdapter[] = [next, astro, reactRouter, tanstackStart, vite];

/**
 * The adapter for this project: the one named, or the one detected. When several match, the most
 * specific wins (a meta-framework over the bundler under it). Two equally specific ones (a Next app
 * with Astro docs in the same package.json) are ambiguous, and guessing would write to the wrong
 * place, so it says so instead.
 */
export function resolveAdapter(project: Project, named?: string): FrameworkAdapter {
  if (named) {
    const adapter = adapters.find((candidate) => candidate.id === named);
    if (!adapter) throw new Error(`Unknown framework "${named}". Supported: ${adapters.map((a) => a.id).join(", ")}.`);
    return adapter;
  }
  const found = adapters.filter((adapter) => adapter.detect(project));
  const top = Math.max(...found.map((adapter) => adapter.priority));
  const winners = found.filter((adapter) => adapter.priority === top);
  if (winners.length === 1) return winners[0]!;
  if (winners.length > 1) {
    throw new Error(`This project uses ${winners.map((a) => a.label).join(" and ")}. Choose one with --framework ${winners.map((a) => a.id).join("|")}.`);
  }
  throw new Error(`No supported framework found. Supported: ${adapters.map((a) => a.label).join(", ")}. Use --framework to force one.`);
}

export type { FrameworkAdapter } from "./types.js";
