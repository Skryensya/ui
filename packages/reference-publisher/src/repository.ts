import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import type { CatalogueRepository } from "./index.js";
const exec = promisify(execFile);
/** Detached worktrees never touch the reviewer's files, index, branch or main. */
export function gitRepository(root: string): CatalogueRepository {
  const run = async (cwd: string, command: string, args: string[]) =>
    (
      await exec(command, args, {
        cwd,
        maxBuffer: 8 * 1024 * 1024,
        timeout: 300_000,
      })
    ).stdout;
  return {
    async head() {
      return (await run(root, "git", ["rev-parse", "HEAD"])).trim();
    },
    async read(sha, path) {
      if (
        !/^[a-f0-9]{40}$/.test(sha) ||
        !path.startsWith("contracts/examples/")
      )
        throw new Error("Invalid catalogue snapshot");
      return run(root, "git", ["show", `${sha}:${path}`]);
    },
    async validate(sha, files) {
      const temp = await mkdtemp(join(tmpdir(), "reference-validation-"));
      const worktree = join(temp, "repo");
      let added = false;
      try {
        if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error("Invalid base SHA");
        await run(root, "git", ["worktree", "add", "--detach", worktree, sha]);
        added = true;
        for (const file of files) {
          if (
            !/^contracts\/examples\/(fixed|library)\/[a-z0-9/_-]+\.ts$/.test(
              file.path,
            )
          )
            throw new Error("Invalid generated path");
          const path = join(worktree, file.path);
          await mkdir(dirname(path), { recursive: true });
          await writeFile(path, file.content);
        }
        // Offline installation binds workspace packages to this snapshot, NOT the live working tree.
        let output = await run(worktree, "pnpm", [
          "install",
          "--offline",
          "--frozen-lockfile",
          "--ignore-scripts",
        ]);
        output += await run(worktree, "pnpm", [
          "--filter",
          "@skryensya/ai-compiler",
          "check",
        ]);
        return { valid: true, output: output.slice(-50000) };
      } catch (e) {
        const error = e as Error & { stdout?: string; stderr?: string };
        return {
          valid: false,
          output:
            `${error.message}\n${error.stdout ?? ""}\n${error.stderr ?? ""}`.slice(
              -50000,
            ),
        };
      } finally {
        if (added)
          await run(root, "git", ["worktree", "remove", "--force", worktree]);
        await rm(temp, { recursive: true, force: true });
      }
    },
  };
}
