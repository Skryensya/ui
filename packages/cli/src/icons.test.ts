import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { expect, it } from "vitest";
import { main } from "./main.js";
import { capture, makeProject, pkg } from "./testing.js";

// The real Lucide collection, borrowed from core's dev dependencies, installed into a throwaway project.
const lucideDir = dirname(createRequire(import.meta.resolve("@skryensya/core/iconify"))
  .resolve("@iconify-json/lucide/icons.json"));
const withLucide = () => {
  const dir = makeProject({ "package.json": pkg({}, { devDependencies: { "@iconify-json/lucide": "^1.2.0" } }) });
  cpSync(lucideDir, join(dir, "node_modules/@iconify-json/lucide"), { recursive: true });
  return dir;
};

it("writes only the mapped roles from the project's own Iconify set, and --check accepts them", () => {
  const dir = withLucide();
  const run = capture(dir);
  expect(main(["icons", "lucide"], run.ctx)).toBe(0);
  const source = readFileSync(join(dir, "src/icons.ts"), "utf8");
  expect(source).toContain('"chevron-down":');
  expect(source).not.toContain('"a-arrow-down"'); // a Lucide icon no role asks for
  expect(readFileSync(join(dir, "src/icons.css"), "utf8")).toContain("::picker-icon");
  expect(main(["icons", "lucide", "--check"], capture(dir).ctx)).toBe(0);
});

it("--check fails on a stale file", () => {
  const dir = withLucide();
  main(["icons", "lucide", "--out", "lib/set"], capture(dir).ctx);
  expect(main(["icons", "lucide", "--check"], capture(dir).ctx)).toBe(1);
});

it("says how to install a set that is not there, and names the mapped ones", () => {
  const dir = makeProject({ "package.json": pkg({}) });
  const run = capture(dir);
  expect(main(["icons", "ph"], run.ctx)).toBe(1);
  expect(run.err()).toContain("pnpm add -D @iconify-json/ph");
  const unknown = capture(dir);
  expect(main(["icons", "feather"], unknown.ctx)).toBe(1);
  expect(unknown.err()).toContain("tabler");
  expect(unknown.err()).toContain("ph-bold");
});

it("refuses to write beside a module of the same name", () => {
  const dir = withLucide();
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "src/icons.tsx"), "export {};");
  const run = capture(dir);
  expect(main(["icons", "lucide"], run.ctx)).toBe(1);
  expect(run.err()).toContain("--out");
});

it("adds the component marks only with --components", () => {
  const dir = withLucide();
  main(["icons", "lucide"], capture(dir).ctx);
  expect(readFileSync(join(dir, "src/icons.ts"), "utf8")).not.toContain('"component-carousel"');
  main(["icons", "lucide", "--components"], capture(dir).ctx);
  expect(readFileSync(join(dir, "src/icons.ts"), "utf8")).toContain('"component-carousel"');
});

it("adds the brand logos only with --brands, one for every brand", () => {
  const dir = withLucide();
  main(["icons", "lucide"], capture(dir).ctx);
  expect(readFileSync(join(dir, "src/icons.ts"), "utf8")).not.toContain('"brand-github"');
  main(["icons", "lucide", "--brands"], capture(dir).ctx);
  const written = readFileSync(join(dir, "src/icons.ts"), "utf8");
  expect(written).toContain('"brand-github"');
  expect(written).toContain('"brand-tiktok"');
});
