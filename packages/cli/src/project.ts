import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

type PackageJson = {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

/*
 * THE PROJECT THE CLI IS RUN IN, read once and asked questions. Every path it exposes is relative to
 * the project root and POSIX-shaped, so what a command prints is what an adapter compares against on
 * any platform. It writes only through `write`, which never touches a file outside the root.
 */
export class Project {
  readonly root: string;
  readonly pkg: PackageJson;

  constructor(cwd: string) {
    this.root = resolve(cwd);
    const path = join(this.root, "package.json");
    if (!existsSync(path)) throw new Error(`No package.json in ${this.root}. Run this from the root of your project.`);
    try {
      this.pkg = JSON.parse(readFileSync(path, "utf8")) as PackageJson;
    } catch {
      throw new Error(`${path} is not valid JSON.`);
    }
  }

  /** The version range a dependency is declared with, in any dependency list. */
  version(name: string): string | undefined {
    return this.pkg.dependencies?.[name] ?? this.pkg.devDependencies?.[name];
  }

  has(name: string): boolean {
    return this.version(name) !== undefined;
  }

  exists(rel: string): boolean {
    return existsSync(join(this.root, rel));
  }

  isDirectory(rel: string): boolean {
    return this.exists(rel) && statSync(join(this.root, rel)).isDirectory();
  }

  read(rel: string): string | undefined {
    return this.exists(rel) ? readFileSync(join(this.root, rel), "utf8") : undefined;
  }

  write(rel: string, content: string): void {
    const target = join(this.root, rel);
    if (!resolve(target).startsWith(this.root)) throw new Error(`Refusing to write outside the project: ${rel}`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }

  /** Files under a directory whose name ends with one of `extensions`, as relative POSIX paths. */
  files(dir: string, extensions: readonly string[]): string[] {
    if (!this.isDirectory(dir)) return [];
    const found: string[] = [];
    for (const name of readdirSync(join(this.root, dir)).sort()) {
      const rel = posix.join(dir, name);
      if (this.isDirectory(rel)) found.push(...this.files(rel, extensions));
      else if (extensions.some((extension) => name.endsWith(extension))) found.push(rel);
    }
    return found;
  }

  /**
   * The manager that owns this project: the `packageManager` field when there is one, else the
   * nearest lockfile walking up (a workspace keeps its lockfile at the root), else npm.
   */
  packageManager(): PackageManager {
    const declared = this.pkg.packageManager?.split("@")[0];
    if (declared === "pnpm" || declared === "npm" || declared === "yarn" || declared === "bun") return declared;
    const locks: [string, PackageManager][] = [
      ["pnpm-lock.yaml", "pnpm"],
      ["yarn.lock", "yarn"],
      ["bun.lock", "bun"],
      ["bun.lockb", "bun"],
      ["package-lock.json", "npm"],
    ];
    for (let dir = this.root; ; dir = dirname(dir)) {
      for (const [file, manager] of locks) if (existsSync(join(dir, file))) return manager;
      if (dirname(dir) === dir) return "npm";
    }
  }
}

/** The command that adds packages with a manager. */
export function addCommand(manager: PackageManager, packages: readonly string[]): [string, string[]] {
  const verb = manager === "npm" ? "install" : "add";
  return [manager, [verb, ...packages]];
}

/** `./skryensya.css` from the file that imports it: the form a bundler expects. */
export function relativeImport(fromFile: string, toFile: string): string {
  const path = posix.relative(posix.dirname(fromFile), toFile);
  return path.startsWith(".") ? path : `./${path}`;
}
