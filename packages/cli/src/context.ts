import { spawnSync } from "node:child_process";

/** Everything a command touches outside the project's files, so a test can stand in for each. */
export type Context = {
  cwd: string;
  log: (line?: string) => void;
  error: (line: string) => void;
  /** Runs a command and returns its exit code. */
  run: (command: string, args: string[], cwd: string) => number;
};

export const defaultContext = (cwd: string): Context => ({
  cwd,
  log: (line = "") => console.log(line),
  error: (line) => console.error(line),
  run: (command, args, where) => spawnSync(command, args, { cwd: where, stdio: "inherit", shell: process.platform === "win32" }).status ?? 1,
});
