import { iconifyPresets } from "@skryensya/core/iconify";
import type { Context } from "../context.js";
import { icons } from "./icons.js";
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
  /** An icon set preset (`lucide`, `ph`…): install its `@iconify-json` package and write `src/icons`. */
  icons?: string;
};

const unique = <T>(items: T[]): T[] => [...new Set(items)];

/** The line a person writes to use an entry with a binding. */
function usage(entry: Entry, binding: Binding): string[] {
  if (entry.appearance) return [`write appearance="${entry.appearance.value}" on ${entry.appearance.of}; the sheet is in the stylesheet now.`];
  if (binding === "react") return entry.react ? [`import { ${entry.react.names.join(", ")} } from "${entry.react.entry}";`] : [];
  if (!entry.vanilla) return ["CSS only: the markup and the stylesheet are all it needs."];
  // The setup's one call mounts it; the per-component import is only for a page that mounts by hand.
  if (entry.vanilla.auto) return [`markup with ${entry.vanilla.selectors.join(", ")}: the Setup's mountComponentsWithIcons mounts it`];
  return entry.vanilla.mount ? [`import { ${entry.vanilla.mount} } from "${entry.vanilla.entry}";`] : [];
}

/** The entry-module lines that bind the icon set (and, in Vanilla, mount the components). */
function setup(binding: Binding): string[] {
  const head = ['import "./icons.css";', 'import { icons } from "./icons";'];
  return binding === "react"
    ? [...head, 'import { IconSetProvider } from "@skryensya/react/icon";', "", "<IconSetProvider set={icons}>{/* your app */}</IconSetProvider>"]
    : [...head, 'import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";', "", "mountComponentsWithIcons(document, icons);"];
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

  const preset = options.icons ? iconifyPresets[options.icons] : undefined;
  if (options.icons && !preset) {
    ctx.error(`No mapped icon set "${options.icons}". Mapped: ${Object.keys(iconifyPresets).join(", ")}.`);
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

  if (preset) {
    const iconPackage = `@iconify-json/${preset.prefix}`;
    const [command, args] = addCommand(manager, [iconPackage], true);
    const line = [command, ...args].join(" ");
    if (options.dryRun) {
      if (!project.has(iconPackage)) ctx.log(`  would run    ${line}`);
      ctx.log(`  would write  src/icons.ts, src/icons.css  (${options.icons})`);
    } else if (options.install === false && !project.has(iconPackage)) {
      ctx.log(`  run    ${line}\n  then   skryensya icons ${options.icons}`);
    } else {
      if (!project.has(iconPackage)) {
        ctx.log(`  running  ${line}`);
        const code = ctx.run(command, args, project.root);
        if (code !== 0) {
          ctx.error(`\n\`${line}\` failed (exit ${code}). Run it yourself, then: skryensya icons ${options.icons}`);
          return code;
        }
      }
      const code = icons(options.icons, { usage: false }, { ...ctx, cwd: project.root });
      if (code !== 0) return code;
    }
  }

  ctx.log();
  ctx.log("Use");
  for (const entry of entries) {
    ctx.log(`  ${entry.id}`);
    for (const line of usage(entry, binding)) ctx.log(`    ${line}`);
  }

  // The setup every app needs once, printed until the project has it: binding the icon set and, in
  // Vanilla, mounting. Found by name in the sources, so a project that already did it hears nothing.
  const setupDone = project.files("src", [".ts", ".tsx", ".js", ".jsx", ".astro"])
    .some((file) => /IconSetProvider|mountComponentsWithIcons/.test(project.read(file) ?? ""));
  if (!setupDone) {
    ctx.log();
    ctx.log("Setup, once (the icon set comes from: skryensya icons <set>)");
    for (const line of setup(binding)) ctx.log(`    ${line}`);
  }

  const wiring = adapter.wiring(project, cssFile);
  const notes = adapter.notes(project, binding);
  // The kit ships no icons: the project picks a set (a dev dependency) and writes only the roles it needs.
  const declared = Object.keys({ ...project.pkg.dependencies, ...project.pkg.devDependencies });
  if (!preset && !declared.some((name) => name.startsWith("@iconify-json/")))
    notes.push(`pick an icon set: skryensya add ${ids.join(" ")} --icons lucide (or ph, material-symbols, tabler…; skryensya help lists them)`);
  if (!wiring.wired || notes.length) {
    ctx.log();
    ctx.log("Next");
    if (!wiring.wired) ctx.log(`  • ${wiring.instruction}`);
    for (const note of notes) ctx.log(`  • ${note}`);
  }
  return 0;
}
