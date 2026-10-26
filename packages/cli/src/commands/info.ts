import type { Context } from "../context.js";
import { appearancesOf, catalog, suggest } from "../manifest.js";

export function info(id: string | undefined, ctx: Context): number {
  if (!id) {
    ctx.error("Say which one: skryensya info <name>");
    return 1;
  }
  const entry = catalog.get(id);
  if (!entry) {
    const near = suggest(id);
    ctx.error(`No component "${id}".${near.length ? ` Did you mean ${near.join(", ")}?` : ""}`);
    return 1;
  }

  ctx.log(`${entry.id}  (${entry.kind}, ${entry.category})`);
  if (entry.summary) ctx.log(`  ${entry.summary}`);
  ctx.log();
  ctx.log("CSS, in load order (import from @skryensya/react/css/ or @skryensya/vanilla/css/)");
  for (const file of entry.css) ctx.log(`  ${file.replace(/^@skryensya\/core\//, "")}`);
  if (entry.react) {
    ctx.log();
    ctx.log("React");
    ctx.log(`  import { ${entry.react.names.join(", ")} } from "${entry.react.entry}";`);
  }
  if (entry.vanilla) {
    ctx.log();
    ctx.log("Vanilla");
    if (entry.vanilla.mount) ctx.log(`  import { ${entry.vanilla.mount} } from "${entry.vanilla.entry}";`);
    if (entry.vanilla.auto) ctx.log(`  mounted by @skryensya/vanilla/auto for ${entry.vanilla.selectors.join(", ")}`);
  } else if (entry.kind === "component") {
    ctx.log();
    ctx.log("Vanilla: the stylesheet is all it needs.");
  }
  const looks = appearancesOf(entry.id);
  if (looks.length) {
    ctx.log();
    ctx.log("Appearances (each is its own sheet; add the ones you use)");
    for (const look of looks) ctx.log(`  skryensya add ${look.id}`);
  }
  if (entry.peers.length) {
    ctx.log();
    ctx.log(`Also installs: ${entry.peers.join(", ")}`);
  }
  return 0;
}
