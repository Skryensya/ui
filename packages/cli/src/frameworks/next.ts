import { relativeImport } from "../project.js";
import type { FrameworkAdapter } from "./types.js";

const APP_ROOTS = ["src/app", "app"] as const;
const PAGES_ROOTS = ["src/pages", "pages"] as const;
const EXTENSIONS = ["tsx", "jsx", "ts", "js"] as const;

/** The file that every page passes through, where a global stylesheet may be imported. */
const layoutCandidates = (): string[] => [
  ...APP_ROOTS.flatMap((root) => EXTENSIONS.map((ext) => `${root}/layout.${ext}`)),
  ...PAGES_ROOTS.flatMap((root) => EXTENSIONS.map((ext) => `${root}/_app.${ext}`)),
];

const usesAppRouter = (project: import("../project.js").Project) => APP_ROOTS.some((root) => project.isDirectory(root));

export const next: FrameworkAdapter = {
  id: "next",
  label: "Next.js",
  priority: 100,

  detect: (project) => project.has("next"),

  // Next renders React, so the React binding is the only one that fits.
  defaultBinding: () => "react",

  cssFile(project) {
    const appRoot = APP_ROOTS.find((root) => project.isDirectory(root));
    if (appRoot) return `${appRoot}/skryensya.css`;
    const pagesRoot = PAGES_ROOTS.find((root) => project.isDirectory(root));
    if (pagesRoot) return `${pagesRoot.startsWith("src/") ? "src/" : ""}styles/skryensya.css`;
    return "app/skryensya.css";
  },

  wiring(project, cssFile) {
    const layouts = layoutCandidates().filter((file) => project.exists(file));
    if (layouts.some((file) => project.read(file)?.includes("skryensya.css"))) return { wired: true, instruction: "" };
    const layout = layouts[0];
    return {
      wired: false,
      instruction: layout
        ? `Import the stylesheet once, at the top of ${layout}:\n    import "${relativeImport(layout, cssFile)}";`
        : `Import ${cssFile} once from your root layout (app/layout.tsx) or, with the pages router, from pages/_app.tsx.`,
    };
  },

  notes(project, binding) {
    if (binding !== "react" || !usesAppRouter(project)) return [];
    return [
      "App Router: a component that holds state or listens to events must be rendered from a Client Component. Put \"use client\" at the top of the file that imports it.",
    ];
  },
};
