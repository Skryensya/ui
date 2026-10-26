import type { Context } from "../context.js";
import { readIds, renderCss } from "../css.js";
import { resolveAdapter } from "../frameworks/index.js";
import { catalog, suggest, type Binding, type Entry } from "../manifest.js";
import { addCommand, Project } from "../project.js";
import { packageTarget, withCompanions } from "../release.js";

export type AddOptions = {
  binding?: Binding;
  framework?: string;
  /** Print what would change and change nothing. */
  dryRun?: boolean;
  /** Install the packages. Off, the command prints the line to run instead. */
  install?: boolean;
};

const unique = <T>(items: T[]): T[] => [...new Set(items)];

/** The line a person writes to use an entry with a binding. */
function usage(entry: Entry, binding: Binding): string[] {
  if (entry.appearance) return [`write appearance="${entry.appearance.value}" on ${entry.appearance.of}; the sheet is in the stylesheet now.`];
  if (binding === "react") return entry.react ? [`import { ${entry.react.names.join(", ")} } from "${entry.react.entry}";`] : [];
  if (!entry.vanilla) return ["CSS only: the markup and the stylesheet are all it needs."];
  const lines = entry.vanilla.mount ? [`import { ${entry.vanilla.mount} } from "${entry.vanilla.entry}";`] : [];
  if (entry.vanilla.auto) lines.push(`(mounted by the auto-loader for ${entry.vanilla.selectors.join(", ")})`);
  return lines;
}

export function add(ids: string[], options: AddOptions, ctx: Context): number {
  if (!ids.length) {
    ctx.error("Say what to add: skryensya add <name> [<name>...]. See them with: skryensya list");
    return 1;
  }

  const unknown = ids.filter((id) => !catalog.has(id));
  if (unknown.length) {
    for (const id of unknown) {
      const near = suggest(id);
      ctx.error(`No component "${id}".${near.length ? ` Did you mean ${near.join(", ")}?` : ""}`);
    }
    return 1;
  }

  let project: Project;
  let adapter: ReturnType<typeof resolveAdapter>;
  try {
    project = new Project(ctx.cwd);
    adapter = resolveAdapter(project, options.framework);
  } catch (error) {
    ctx.error((error as Error).message);
    return 1;
  }

  const binding = options.binding ?? adapter.defaultBinding(project);
  // An appearance (`button.brutalist`) dresses a component, so asking for it brings the component along.
  const entries = unique(unique(ids).flatMap((id) => {
    const entry = catalog.get(id)!;
    return entry.appearance ? [catalog.get(entry.appearance.of)!, entry] : [entry];
  }));

  const missing = entries.filter((entry) => binding === "react" && !entry.react && !entry.appearance);
  if (missing.length) {
    ctx.error(`${missing.map((entry) => entry.id).join(", ")} ${missing.length > 1 ? "have" : "has"} no React binding. Use --binding vanilla, or pick another component.`);
    return 1;
  }
  const integrationsOnVanilla = entries.filter((entry) => binding === "vanilla" && entry.kind === "integration");
  if (integrationsOnVanilla.length) {
    ctx.error(`${integrationsOnVanilla.map((entry) => entry.id).join(", ")} only exist for React. Use --binding react.`);
    return 1;
  }

  // The stylesheet is cumulative: what was added before stays, in the order it was added.
  const cssFile = adapter.cssFile(project);
  const before = readIds(project.read(cssFile));
  const all = unique([...before, ...entries.map((entry) => entry.id)]);
  const content = renderCss(all, binding);
  const changed = project.read(cssFile) !== content;

  // The binding is the only system package a project installs: it brings core, and re-exports the
  // stylesheets the managed file imports. A component with no behaviour still needs it for its CSS.
  const wanted = unique([`@skryensya/${binding}`, ...entries.flatMap((entry) => entry.peers)]);
  // The kit is distributed as release tarballs, so the binding's own dependencies (core, the icon set)
  // are tarballs too and have to be named: a registry would not find them. Once the binding is in the
  // project those came with it.
  const absent = wanted.filter((name) => !project.has(name));
  const packages = withCompanions(absent, ctx.release).filter((name) => !project.has(name)).map((name) => packageTarget(name, ctx.release));
  const manager = project.packageManager();

  ctx.log(`${adapter.label} · ${binding} · ${manager}${options.dryRun ? " · dry run" : ""}`);
  ctx.log();
  ctx.log(changed ? `  ${options.dryRun ? "would write" : "wrote"}  ${cssFile}  (${all.join(", ")})` : `  ${cssFile} is already up to date`);
  if (changed && !options.dryRun) project.write(cssFile, content);

  if (packages.length) {
    const [command, args] = addCommand(manager, packages);
    const line = [command, ...args].join(" ");
    if (options.dryRun || options.install === false) {
      ctx.log(`  ${options.dryRun ? "would run" : "run"}    ${line}`);
    } else {
      ctx.log(`  running  ${line}`);
      const code = ctx.run(command, args, project.root);
      if (code !== 0) {
        ctx.error(`\n\`${line}\` failed (exit ${code}). The stylesheet was written; run the command yourself, then add again.`);
        return code;
      }
    }
  } else {
    ctx.log("  packages are already installed");
  }

  ctx.log();
  ctx.log("Use");
  for (const entry of entries) {
    ctx.log(`  ${entry.id}`);
    for (const line of usage(entry, binding)) ctx.log(`    ${line}`);
  }

  const wiring = adapter.wiring(project, cssFile);
  const notes = adapter.notes(project, binding);
  if (!wiring.wired || notes.length) {
    ctx.log();
    ctx.log("Next");
    if (!wiring.wired) ctx.log(`  • ${wiring.instruction}`);
    for (const note of notes) ctx.log(`  • ${note}`);
  }
  return 0;
}
