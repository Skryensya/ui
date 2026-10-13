import { relativeImport } from "../project.js";
import type { FrameworkAdapter } from "./types.js";

const EXTENSIONS = ["tsx", "jsx", "ts", "js"] as const;
const APP_ROOTS = ["app", "src/app"] as const;

const rootFiles = (): string[] => APP_ROOTS.flatMap((root) => EXTENSIONS.map((ext) => `${root}/root.${ext}`));

/**
 * React Router in framework mode (the one that has a `root.tsx`, a routes file and the Vite plugin
 * `@react-router/dev`). Library mode has no root and nowhere to put a global stylesheet, so it is
 * not what this adapter detects.
 */
export const reactRouter: FrameworkAdapter = {
  id: "react-router",
  label: "React Router",
  priority: 100,

  detect: (project) => project.has("@react-router/dev"),

  defaultBinding: () => "react",

  cssFile: (project) => `${APP_ROOTS.find((root) => project.isDirectory(root)) ?? "app"}/skryensya.css`,

  wiring(project, cssFile) {
    const roots = rootFiles().filter((file) => project.exists(file));
    if (roots.some((file) => project.read(file)?.includes("skryensya.css"))) return { wired: true, instruction: "" };
    const root = roots[0];
    return {
      wired: false,
      instruction: root
        ? `Import the stylesheet once, at the top of ${root}:\n    import "${relativeImport(root, cssFile)}";`
        : `Import ${cssFile} once from your root route (app/root.tsx).`,
    };
  },

  notes: () => [],
};
