import type { Context } from "../context.js";
import { catalog, categories, type Entry } from "../manifest.js";

const bindingsOf = (entry: Entry): string => [entry.react ? "react" : "", entry.vanilla ? "vanilla" : ""].filter(Boolean).join(" ") || "css";

export type ListOptions = { category?: string; json?: boolean };

export function list(options: ListOptions, ctx: Context): number {
  const all = categories();
  if (options.category && !all.includes(options.category)) {
    ctx.error(`No category "${options.category}". Categories: ${all.join(", ")}.`);
    return 1;
  }
  const entries = [...catalog.values()].filter((entry) => !options.category || entry.category === options.category);

  if (options.json) {
    ctx.log(JSON.stringify(entries.map(({ id, kind, category, react, vanilla, peers }) => ({ id, kind, category, react: react?.entry ?? null, vanilla: vanilla?.entry ?? null, peers })), null, 2));
    return 0;
  }

  const width = Math.max(...entries.map((entry) => entry.id.length));
  for (const category of all) {
    const inCategory = entries.filter((entry) => entry.category === category);
    if (!inCategory.length) continue;
    ctx.log(`${category} (${inCategory.length})`);
    for (const entry of inCategory.sort((a, b) => a.id.localeCompare(b.id))) {
      ctx.log(`  ${entry.id.padEnd(width)}  ${bindingsOf(entry)}`);
    }
    ctx.log();
  }
  ctx.log(`${entries.length} entries. Add one with: skryensya add <name>`);
  return 0;
}
