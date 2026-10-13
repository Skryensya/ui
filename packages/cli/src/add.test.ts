import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add } from "./commands/add.js";
import { info } from "./commands/info.js";
import { list } from "./commands/list.js";
import { main } from "./main.js";
import { capture, makeProject, pkg } from "./testing.js";

const next = () =>
  makeProject({ "package.json": pkg({ next: "15", react: "19" }), "pnpm-lock.yaml": "", "src/app/layout.tsx": "export default function L() {}" });
const astroVanilla = () => makeProject({ "package.json": pkg({ astro: "5" }), "package-lock.json": "{}", "src/layouts/Base.astro": "---\n---\n<slot />" });
const read = (dir: string, rel: string) => readFileSync(join(dir, rel), "utf8");

describe("add, on Next", () => {
  it("writes the stylesheet, installs the packages with the project's own manager, and says how to use it", () => {
    const dir = next();
    const run = capture(dir);
    expect(add(["button"], { install: true }, run.ctx)).toBe(0);

    const css = read(dir, "src/app/skryensya.css");
    expect(css).toContain('@import "@skryensya/react/css/tokens.css";');
    expect(css).toContain('@import "@skryensya/react/css/components/button.css";');
    expect(css).not.toContain("@skryensya/core");
    expect(run.runs).toEqual(["pnpm add @skryensya/react"]);
    expect(run.out()).toContain('import { Button } from "@skryensya/react/button";');
    expect(run.out()).toContain('import "./skryensya.css";');
    expect(run.out()).toContain("use client");
  });

  it("is cumulative: a second add keeps what the first one added, in order", () => {
    const dir = next();
    add(["button"], { install: false }, capture(dir).ctx);
    add(["calendar"], { install: false }, capture(dir).ctx);
    const css = read(dir, "src/app/skryensya.css");
    expect(css).toContain("components: button, calendar");
    expect(css.match(/button\.css/g)).toHaveLength(1);
  });

  it("is idempotent: the same command twice changes nothing and installs nothing new", () => {
    const dir = next();
    add(["button"], { install: false }, capture(dir).ctx);
    const before = read(dir, "src/app/skryensya.css");
    const again = capture(dir);
    add(["button"], { install: true }, again.ctx);
    expect(read(dir, "src/app/skryensya.css")).toBe(before);
    expect(again.out()).toContain("already up to date");
  });

  it("does not reinstall a package the project already has", () => {
    const dir = makeProject({ "package.json": pkg({ next: "15", "@skryensya/react": "1" }), "app/page.tsx": "" });
    const run = capture(dir);
    add(["button"], { install: true }, run.ctx);
    expect(run.runs).toEqual([]);
    expect(run.out()).toContain("packages are already installed");
  });

  it("installs the third-party peer an integration needs", () => {
    const dir = next();
    const run = capture(dir);
    add(["data-table"], { install: true }, run.ctx);
    expect(run.runs[0]).toBe("pnpm add @skryensya/react @tanstack/react-table");
    expect(read(dir, "src/app/skryensya.css")).toContain("table.css");
  });

  it("does not repeat the wiring instruction once the layout imports the stylesheet", () => {
    const dir = makeProject({ "package.json": pkg({ next: "15" }), "app/layout.tsx": 'import "./skryensya.css";' });
    const run = capture(dir);
    add(["button"], { install: false }, run.ctx);
    expect(run.out()).not.toContain("Import the stylesheet");
  });
});

describe("add, on Astro", () => {
  it("defaults to vanilla without the React integration, and points at the auto-loader", () => {
    const dir = astroVanilla();
    const run = capture(dir);
    expect(add(["tooltip"], { install: false }, run.ctx)).toBe(0);
    expect(read(dir, "src/styles/skryensya.css")).toContain("tooltip.css");
    expect(run.out()).toContain("Astro · vanilla · npm");
    expect(run.out()).toContain("@skryensya/vanilla/auto");
    expect(run.out()).toContain('import "../styles/skryensya.css";');
    expect(run.out()).toContain("npm install @skryensya/vanilla");
  });

  it("honours --binding react and tells the author to register the integration", () => {
    const dir = astroVanilla();
    const run = capture(dir);
    add(["button"], { binding: "react", install: false }, run.ctx);
    expect(run.out()).toContain("Astro · react");
    expect(run.out()).toContain("astro add react");
    expect(run.out()).toContain("client:load");
  });
});

describe("add, on Vite, React Router and TanStack Start", () => {
  it("wires a Vite app through its entry module and installs the React binding", () => {
    const dir = makeProject({ "package.json": pkg({ vite: "7", react: "19" }), "yarn.lock": "", "src/main.tsx": "" });
    const run = capture(dir);
    add(["button"], { install: true }, run.ctx);
    expect(read(dir, "src/skryensya.css")).toContain("button.css");
    expect(run.runs).toEqual(["yarn add @skryensya/react"]);
    expect(run.out()).toContain("Vite · react · yarn");
    expect(run.out()).toContain('import "./skryensya.css";');
    expect(run.out()).not.toContain("use client");
  });

  it("wires React Router through app/root.tsx", () => {
    const dir = makeProject({ "package.json": pkg({ "@react-router/dev": "8", vite: "7" }), "app/root.tsx": "" });
    const run = capture(dir);
    add(["dialog"], { install: false }, run.ctx);
    expect(read(dir, "app/skryensya.css")).toContain("dialog.css");
    expect(run.out()).toContain("React Router · react");
    expect(run.out()).toContain("app/root.tsx");
  });

  it("wires TanStack Start through the root route, ahead of the Vite it runs on", () => {
    const dir = makeProject({ "package.json": pkg({ "@tanstack/react-start": "1", vite: "7" }), "bun.lock": "", "src/routes/__root.tsx": "" });
    const run = capture(dir);
    add(["tooltip"], { install: true }, run.ctx);
    expect(read(dir, "src/styles/skryensya.css")).toContain("tooltip.css");
    expect(run.out()).toContain("TanStack Start · react · bun");
    expect(run.out()).toContain('import "../styles/skryensya.css";');
    expect(run.runs).toEqual(["bun add @skryensya/react"]);
  });
});

describe("add, and core", () => {
  it("never asks the project to install core, nor imports it", () => {
    const dir = astroVanilla();
    const run = capture(dir);
    add(["tooltip"], { install: true }, run.ctx);
    expect(run.runs).toEqual(["npm install @skryensya/vanilla"]);
    const css = read(dir, "src/styles/skryensya.css");
    expect(css).toContain('@import "@skryensya/vanilla/css/tokens.css";');
    expect(css).toContain('@import "@skryensya/vanilla/css/components/tooltip.css";');
    expect(css).not.toContain("@skryensya/core");
  });

  it("still installs the binding for a component that is only CSS, because its stylesheet comes through it", () => {
    const dir = astroVanilla();
    const run = capture(dir);
    add(["badge"], { install: true }, run.ctx);
    expect(run.runs).toEqual(["npm install @skryensya/vanilla"]);
  });
});

describe("add, safety and errors", () => {
  it("writes nothing and runs nothing on --dry-run", () => {
    const dir = next();
    const run = capture(dir);
    add(["button"], { dryRun: true, install: true }, run.ctx);
    expect(() => read(dir, "src/app/skryensya.css")).toThrow();
    expect(run.runs).toEqual([]);
    expect(run.out()).toContain("would write");
    expect(run.out()).toContain("would run");
  });

  it("rejects an unknown name with a suggestion, and changes nothing", () => {
    const dir = next();
    const run = capture(dir);
    expect(add(["buton"], { install: true }, run.ctx)).toBe(1);
    expect(run.err()).toContain("Did you mean button");
    expect(run.runs).toEqual([]);
  });

  it("refuses an integration on the vanilla binding", () => {
    const run = capture(astroVanilla());
    expect(add(["data-table"], { binding: "vanilla" }, run.ctx)).toBe(1);
    expect(run.err()).toContain("only exist for React");
  });

  it("reports a failed install without hiding that the stylesheet was written", () => {
    const dir = next();
    const run = capture(dir, 2);
    expect(add(["button"], { install: true }, run.ctx)).toBe(2);
    expect(run.err()).toContain("failed");
    expect(read(dir, "src/app/skryensya.css")).toContain("button.css");
  });

  it("says when it is not in a project, or the framework is not supported", () => {
    expect(add(["button"], {}, capture(makeProject({})).ctx)).toBe(1);
    const run = capture(makeProject({ "package.json": pkg({ express: "5" }) }));
    expect(add(["button"], {}, run.ctx)).toBe(1);
    expect(run.err()).toContain("No supported framework");
  });

  it("asks for a name when given none", () => {
    expect(add([], {}, capture(next()).ctx)).toBe(1);
  });
});

describe("list and info", () => {
  it("lists the catalog by category", () => {
    const run = capture(".");
    expect(list({}, run.ctx)).toBe(0);
    expect(run.out()).toMatch(/actions \(\d+\)/);
    expect(run.out()).toContain("button");
    expect(run.out()).toContain("integrations (2)");
  });

  it("narrows to one category and rejects a made-up one", () => {
    const only = capture(".");
    list({ category: "overlays" }, only.ctx);
    expect(only.out()).toContain("tooltip");
    expect(only.out()).not.toContain("button");
    expect(list({ category: "nope" }, capture(".").ctx)).toBe(1);
  });

  it("prints machine-readable JSON", () => {
    const run = capture(".");
    list({ json: true }, run.ctx);
    const parsed = JSON.parse(run.out()) as { id: string }[];
    expect(parsed.find((entry) => entry.id === "button")).toBeTruthy();
  });

  it("describes what one component needs and exports", () => {
    const run = capture(".");
    expect(info("calendar", run.ctx)).toBe(0);
    expect(run.out()).toContain("components/button.css");
    expect(run.out()).toContain('from "@skryensya/react/calendar"');
    expect(run.out()).toContain("mountCalendar");
  });

  it("says which package an integration also installs", () => {
    const run = capture(".");
    info("hook-form", run.ctx);
    expect(run.out()).toContain("react-hook-form");
  });

  it("suggests a name for a typo", () => {
    const run = capture(".");
    expect(info("buton", run.ctx)).toBe(1);
    expect(run.err()).toContain("button");
  });
});

describe("main", () => {
  it("routes arguments to commands and uses --cwd", () => {
    const dir = next();
    const run = capture(".");
    expect(main(["add", "button", "--no-install", "--cwd", dir], run.ctx)).toBe(0);
    expect(read(dir, "src/app/skryensya.css")).toContain("button.css");
  });

  it("rejects a bad --binding, an unknown command and an unknown flag", () => {
    expect(main(["add", "button", "--binding", "angular"], capture(next()).ctx)).toBe(1);
    expect(main(["frobnicate"], capture(".").ctx)).toBe(1);
    expect(main(["add", "button", "--nope"], capture(".").ctx)).toBe(1);
  });

  it("prints help with no arguments", () => {
    const run = capture(".");
    main([], run.ctx);
    expect(run.out()).toContain("skryensya add");
  });
});

describe("add, from a release", () => {
  it("installs the release's tarballs: the binding and the packages it depends on, at the CLI's version", () => {
    const dir = makeProject({ "package.json": pkg({ next: "15" }), "app/page.tsx": "" });
    const run = capture(dir);
    expect(add(["button"], { framework: "next" }, { ...run.ctx, release: "0.0.2" })).toBe(0);
    const base = "https://github.com/Skryensya/ui/releases/download/v0.0.2";
    expect(run.runs).toEqual([
      `npm install ${base}/skryensya-core-0.0.2.tgz ${base}/skryensya-icons-lucide-0.0.2.tgz ${base}/skryensya-react-0.0.2.tgz`,
    ]);
  });

  it("leaves third-party peers as plain names", () => {
    const dir = makeProject({ "package.json": pkg({ next: "15" }), "app/page.tsx": "" });
    const run = capture(dir);
    add(["data-table"], { framework: "next" }, { ...run.ctx, release: "0.0.2" });
    expect(run.runs[0]).toContain("@tanstack/react-table");
    expect(run.runs[0]).not.toContain("releases/download/v0.0.2/@tanstack");
  });

  it("installs nothing of the system when the binding is already there", () => {
    const dir = makeProject({ "package.json": pkg({ next: "15", "@skryensya/react": "0.0.2" }), "app/page.tsx": "" });
    const run = capture(dir);
    add(["button"], { framework: "next" }, { ...run.ctx, release: "0.0.2" });
    expect(run.runs).toEqual([]);
  });
});
