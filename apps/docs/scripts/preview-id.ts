/*
 * WHICH CARD IS "#158"? `pnpm preview-id 158` prints the page, the card's title, option and story, and where to open the
 * code. `pnpm preview-id callout` lists every card whose key contains the text. The numbers live in
 * `src/data/preview-ids.json` (see `src/lib/preview-ids.ts`); the same number shows in the debug panel's "Preview ids" check.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const registry = JSON.parse(readFileSync("src/data/preview-ids.json", "utf8")) as Record<string, number>;
const query = process.argv[2]?.replace(/^#/, "").toLowerCase();
if (!query) {
  console.error("usage: pnpm preview-id <number | text>");
  process.exit(1);
}

const matches = Object.entries(registry).filter(([key, n]) => (/^\d+$/.test(query) ? n === Number(query) : key.toLowerCase().includes(query)));
if (matches.length === 0) {
  console.error(`No preview matches "${query}".`);
  process.exit(1);
}

const grep = (text: string) => {
  try {
    return execFileSync("grep", ["-rnF", "--include=*.astro", "--include=*.ts", "--include=*.tsx", "-m", "3", text, "src"], { encoding: "utf8" }).trim().split("\n").slice(0, 6);
  } catch {
    return [];
  }
};

for (const [key, n] of matches.slice(0, 20)) {
  const [path, title, label, option, story, storyName] = key.split("|");
  console.log(`#${n}  ${path}`);
  for (const [name, value] of [["title", title], ["label", label], ["option", option], ["story", [story, storyName].filter(Boolean).join(" / ")]] as const) {
    if (value) console.log(`  ${name.padEnd(7)}${value}`);
  }
  // The page component (`/components/button-group` → ButtonGroupPage.astro), then wherever the title's exact words are written (the copy lives in i18n).
  const name = (path ?? "").split("/").filter(Boolean).pop()?.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
  const page = `src/components/pages/${name}Page.astro`;
  if (name && existsSync(page)) console.log(`  page   ${page}`);
  for (const hit of title ? grep(title) : []) console.log(`  → ${hit}`);
  console.log();
}
if (matches.length > 20) console.log(`…and ${matches.length - 20} more; narrow the text.`);
