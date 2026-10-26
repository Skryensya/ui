import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add } from "./commands/add.js";
import { info } from "./commands/info.js";
import { list } from "./commands/list.js";
import { catalog } from "./manifest.js";
import { capture, makeProject, pkg } from "./testing.js";

/*
 * An appearance is its own sheet (`button.brutalist.css` beside `button.css`), so the CLI treats each one as
 * an id named like the sheet: `skryensya add button.brutalist`. It brings its component along, and a page
 * that asks for no appearance gets none.
 */

const next = () => makeProject({ "package.json": pkg({ next: "15", react: "19" }), "pnpm-lock.yaml": "", "src/app/layout.tsx": "export default function L() {}" });
const css = (dir: string) => readFileSync(join(dir, "src/app/skryensya.css"), "utf8");

describe("appearance entries", () => {
  it("exist for the components that split one, with the sheet after its base", () => {
    const entry = catalog.get("button.brutalist")!;
    expect(entry.kind).toBe("appearance");
    expect(entry.appearance).toEqual({ of: "button", value: "brutalist" });
    const files = entry.css.map((f) => f.split("/").pop());
    expect(files.indexOf("button.css")).toBeGreaterThanOrEqual(0);
    expect(files.indexOf("button.brutalist.css")).toBeGreaterThan(files.indexOf("button.css"));
  });

  it("add button.brutalist writes the component and its appearance, once each, base first", () => {
    const dir = next();
    const run = capture(dir);
    expect(add(["button.brutalist"], { install: false }, run.ctx)).toBe(0);
    const written = css(dir);
    expect(written).toContain("components: button, button.brutalist");
    expect(written.match(/components\/button\.css/g)).toHaveLength(1);
    expect(written.indexOf("button.brutalist.css")).toBeGreaterThan(written.indexOf("components/button.css"));
    expect(written).not.toContain("button.tactile.css");
    expect(run.out()).toContain('appearance="brutalist"');
  });

  it("a plain add of the component loads no appearance", () => {
    const dir = next();
    add(["button"], { install: false }, capture(dir).ctx);
    expect(css(dir)).not.toMatch(/\.(tactile|brutalist|frosted)\.css/);
  });

  it("list does not bury the components under their appearances, and info lists them", () => {
    const listed = capture(next());
    list({}, listed.ctx);
    expect(listed.out()).not.toContain("button.brutalist");
    const shown = capture(next());
    info("button", shown.ctx);
    expect(shown.out()).toContain("skryensya add button.brutalist");
    expect(shown.out()).toContain("skryensya add button.tactile");
  });
});
