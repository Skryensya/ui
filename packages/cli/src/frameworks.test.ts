import { describe, expect, it } from "vitest";
import { astro } from "./frameworks/astro.js";
import { resolveAdapter } from "./frameworks/index.js";
import { next } from "./frameworks/next.js";
import { reactRouter } from "./frameworks/react-router.js";
import { tanstackStart } from "./frameworks/tanstack-start.js";
import { vite } from "./frameworks/vite.js";
import { Project } from "./project.js";
import { makeProject, pkg } from "./testing.js";

const project = (files: Record<string, string>) => new Project(makeProject(files));

describe("resolveAdapter", () => {
  it("detects the framework from the dependencies", () => {
    expect(resolveAdapter(project({ "package.json": pkg({ next: "15.0.0" }) })).id).toBe("next");
    expect(resolveAdapter(project({ "package.json": pkg({ astro: "5.0.0" }) })).id).toBe("astro");
  });

  it("refuses to guess when a project has both", () => {
    expect(() => resolveAdapter(project({ "package.json": pkg({ next: "15", astro: "5" }) }))).toThrow(/--framework/);
  });

  it("says what is supported when it finds nothing", () => {
    expect(() => resolveAdapter(project({ "package.json": pkg({ express: "5" }) }))).toThrow(/Next\.js, Astro, React Router, TanStack Start, Vite/);
  });

  it("does not mistake a framework that runs on Vite for a plain Vite app", () => {
    expect(() => resolveAdapter(project({ "package.json": pkg({ vite: "6", "@sveltejs/kit": "2" }) }))).toThrow(/No supported framework/);
  });

  it("lets a meta-framework outrank the Vite under it", () => {
    expect(resolveAdapter(project({ "package.json": pkg({ vite: "7", "@tanstack/react-start": "1" }) })).id).toBe("tanstack-start");
    expect(resolveAdapter(project({ "package.json": pkg({ vite: "7", "@react-router/dev": "8" }) })).id).toBe("react-router");
    expect(resolveAdapter(project({ "package.json": pkg({ vite: "7", react: "19" }) })).id).toBe("vite");
  });

  it("still reports two equally specific frameworks as ambiguous", () => {
    expect(() => resolveAdapter(project({ "package.json": pkg({ "@react-router/dev": "8", "@tanstack/react-start": "1" }) }))).toThrow(/React Router and TanStack Start/);
  });

  it("takes the framework it was told, whatever the dependencies say", () => {
    expect(resolveAdapter(project({ "package.json": pkg({}) }), "astro").id).toBe("astro");
    expect(() => resolveAdapter(project({ "package.json": pkg({}) }), "remix")).toThrow(/Unknown framework/);
  });
});

describe("Next adapter", () => {
  it("writes the stylesheet beside the App Router, under src/ when the project uses it", () => {
    expect(next.cssFile(project({ "package.json": pkg({ next: "15" }), "app/page.tsx": "" }))).toBe("app/skryensya.css");
    expect(next.cssFile(project({ "package.json": pkg({ next: "15" }), "src/app/page.tsx": "" }))).toBe("src/app/skryensya.css");
  });

  it("puts it in styles/ for the pages router", () => {
    expect(next.cssFile(project({ "package.json": pkg({ next: "15" }), "pages/index.tsx": "" }))).toBe("styles/skryensya.css");
    expect(next.cssFile(project({ "package.json": pkg({ next: "15" }), "src/pages/index.tsx": "" }))).toBe("src/styles/skryensya.css");
  });

  it("asks for the import in the root layout, with the path that layout needs", () => {
    const p = project({ "package.json": pkg({ next: "15" }), "src/app/layout.tsx": "export default function L() {}" });
    const wiring = next.wiring(p, "src/app/skryensya.css");
    expect(wiring.wired).toBe(false);
    expect(wiring.instruction).toContain('import "./skryensya.css";');
    expect(wiring.instruction).toContain("src/app/layout.tsx");
  });

  it("knows the stylesheet is already imported", () => {
    const p = project({ "package.json": pkg({ next: "15" }), "app/layout.tsx": 'import "./skryensya.css";' });
    expect(next.wiring(p, "app/skryensya.css").wired).toBe(true);
  });

  it("warns about Client Components in the App Router, and only there", () => {
    expect(next.notes(project({ "package.json": pkg({ next: "15" }), "app/page.tsx": "" }), "react").join(" ")).toContain("use client");
    expect(next.notes(project({ "package.json": pkg({ next: "15" }), "pages/index.tsx": "" }), "react")).toEqual([]);
  });

  it("always uses the React binding", () => {
    expect(next.defaultBinding(project({ "package.json": pkg({ next: "15" }) }))).toBe("react");
  });
});

describe("Astro adapter", () => {
  it("uses the React binding only when its integration is installed", () => {
    expect(astro.defaultBinding(project({ "package.json": pkg({ astro: "5" }) }))).toBe("vanilla");
    expect(astro.defaultBinding(project({ "package.json": pkg({ astro: "5", "@astrojs/react": "4" }) }))).toBe("react");
  });

  it("asks for the import in the base layout, relative to it", () => {
    const p = project({ "package.json": pkg({ astro: "5" }), "src/layouts/Base.astro": "---\n---\n<slot />" });
    const wiring = astro.wiring(p, "src/styles/skryensya.css");
    expect(wiring.wired).toBe(false);
    expect(wiring.instruction).toContain('import "../styles/skryensya.css";');
  });

  it("finds the import in a layout or a page", () => {
    const p = project({ "package.json": pkg({ astro: "5" }), "src/pages/index.astro": '---\nimport "../styles/skryensya.css";\n---' });
    expect(astro.wiring(p, "src/styles/skryensya.css").wired).toBe(true);
  });

  it("tells the vanilla binding to load the auto-loader, and the React one to register its integration", () => {
    const bare = project({ "package.json": pkg({ astro: "5" }) });
    expect(astro.notes(bare, "vanilla").join(" ")).toContain("@skryensya/vanilla/auto");
    expect(astro.notes(bare, "react").join(" ")).toContain("astro add react");
    expect(astro.notes(project({ "package.json": pkg({ astro: "5", "@astrojs/react": "4" }) }), "react").join(" ")).not.toContain("astro add react");
  });
});

describe("Vite adapter", () => {
  it("uses React when the project has it, vanilla when it does not", () => {
    expect(vite.defaultBinding(project({ "package.json": pkg({ vite: "7", react: "19" }) }))).toBe("react");
    expect(vite.defaultBinding(project({ "package.json": pkg({ vite: "7" }) }))).toBe("vanilla");
  });

  it("writes beside the sources and asks for the import in the entry module", () => {
    const p = project({ "package.json": pkg({ vite: "7" }), "src/main.tsx": "console.log(1)" });
    expect(vite.cssFile(p)).toBe("src/skryensya.css");
    const wiring = vite.wiring(p, "src/skryensya.css");
    expect(wiring.wired).toBe(false);
    expect(wiring.instruction).toContain('import "./skryensya.css";');
    expect(wiring.instruction).toContain("src/main.tsx");
  });

  it("knows the stylesheet is imported from the entry or from index.html", () => {
    expect(vite.wiring(project({ "package.json": pkg({ vite: "7" }), "src/main.ts": 'import "./skryensya.css";' }), "src/skryensya.css").wired).toBe(true);
    expect(vite.wiring(project({ "package.json": pkg({ vite: "7" }), "index.html": '<link href="/src/skryensya.css">' }), "src/skryensya.css").wired).toBe(true);
  });

  it("tells the vanilla binding to load the auto-loader", () => {
    expect(vite.notes(project({ "package.json": pkg({ vite: "7" }) }), "vanilla").join(" ")).toContain("@skryensya/vanilla/auto");
    expect(vite.notes(project({ "package.json": pkg({ vite: "7" }) }), "react")).toEqual([]);
  });
});

describe("React Router adapter", () => {
  it("detects framework mode, not the library", () => {
    expect(reactRouter.detect(project({ "package.json": pkg({ "react-router": "8" }) }))).toBe(false);
    expect(reactRouter.detect(project({ "package.json": pkg({ "react-router": "8", "@react-router/dev": "8" }) }))).toBe(true);
  });

  it("asks for the import in the root route", () => {
    const p = project({ "package.json": pkg({ "@react-router/dev": "8" }), "app/root.tsx": "export default function Root() {}" });
    expect(reactRouter.cssFile(p)).toBe("app/skryensya.css");
    const wiring = reactRouter.wiring(p, "app/skryensya.css");
    expect(wiring.wired).toBe(false);
    expect(wiring.instruction).toContain('import "./skryensya.css";');
    expect(wiring.instruction).toContain("app/root.tsx");
  });

  it("finds the import once it is there", () => {
    const p = project({ "package.json": pkg({ "@react-router/dev": "8" }), "app/root.tsx": 'import "./skryensya.css";' });
    expect(reactRouter.wiring(p, "app/skryensya.css").wired).toBe(true);
  });
});

describe("TanStack Start adapter", () => {
  it("detects the React package", () => {
    expect(tanstackStart.detect(project({ "package.json": pkg({ "@tanstack/react-start": "1" }) }))).toBe(true);
    expect(tanstackStart.detect(project({ "package.json": pkg({ "@tanstack/react-router": "1" }) }))).toBe(false);
  });

  it("asks for the import in the root route, relative to it", () => {
    const p = project({ "package.json": pkg({ "@tanstack/react-start": "1" }), "src/routes/__root.tsx": "export const Route = {}" });
    expect(tanstackStart.cssFile(p)).toBe("src/styles/skryensya.css");
    const wiring = tanstackStart.wiring(p, "src/styles/skryensya.css");
    expect(wiring.wired).toBe(false);
    expect(wiring.instruction).toContain('import "../styles/skryensya.css";');
    expect(wiring.instruction).toContain("src/routes/__root.tsx");
  });

  it("finds the import once it is there", () => {
    const p = project({ "package.json": pkg({ "@tanstack/react-start": "1" }), "src/routes/__root.tsx": 'import "../styles/skryensya.css";' });
    expect(tanstackStart.wiring(p, "src/styles/skryensya.css").wired).toBe(true);
  });
});
