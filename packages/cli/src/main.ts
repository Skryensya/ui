import { parseArgs } from "node:util";
import { add } from "./commands/add.js";
import { info } from "./commands/info.js";
import { list } from "./commands/list.js";
import type { Context } from "./context.js";
import { adapters } from "./frameworks/index.js";
import type { Binding } from "./manifest.js";
import { version } from "./release.js";

const help = () => `skryensya, wire skryensya/ui into your project

Usage
  skryensya list [--category <name>] [--json]   the catalog
  skryensya info <name>                          what one component needs and exports
  skryensya add <name> [<name>...]               add its CSS and packages to this project

Options for add
  --framework <${adapters.map((adapter) => adapter.id).join("|")}>
                             skip detection
  --binding <react|vanilla>  default: the framework's own
  --dry-run                  show what would change, change nothing
  --no-install               write the stylesheet, print the install line
  --cwd <dir>                run as if from another directory
  --version                  the release this CLI belongs to (add installs that release)

It never copies component source: it connects the packages to your project.`;

/** Runs the CLI with an argument list and returns the exit code. Nothing in here calls process.exit. */
export function main(argv: string[], ctx: Context): number {
  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(argv);
  } catch (error) {
    ctx.error((error as Error).message);
    return 1;
  }
  const { values, positionals } = parsed;
  if (values.version) {
    ctx.log(version);
    return 0;
  }
  const [command, ...rest] = positionals;

  if (values.help || !command || command === "help") {
    ctx.log(help());
    return command || values.help ? 0 : 1;
  }

  const local = values.cwd ? { ...ctx, cwd: values.cwd } : ctx;
  switch (command) {
    case "list":
      return list({ category: values.category, json: values.json }, local);
    case "info":
      return info(rest[0], local);
    case "add": {
      if (values.binding !== undefined && values.binding !== "react" && values.binding !== "vanilla") {
        ctx.error(`--binding is react or vanilla, got "${values.binding}".`);
        return 1;
      }
      return add(rest, { binding: values.binding as Binding | undefined, framework: values.framework, dryRun: values["dry-run"], install: !values["no-install"] }, local);
    }
    default:
      ctx.error(`Unknown command "${command}". Run: skryensya help`);
      return 1;
  }
}

function parse(argv: string[]) {
  return parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      category: { type: "string" },
      json: { type: "boolean" },
      binding: { type: "string" },
      framework: { type: "string" },
      cwd: { type: "string" },
      "dry-run": { type: "boolean" },
      "no-install": { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
}
