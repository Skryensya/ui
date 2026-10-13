import { relativeImport } from "../project.js";
import type { FrameworkAdapter } from "./types.js";

const EXTENSIONS = ["tsx", "jsx", "ts", "js"] as const;
const ROOTS = EXTENSIONS.map((ext) => `src/routes/__root.${ext}`);

export const tanstackStart: FrameworkAdapter = {
  id: "tanstack-start",
  label: "TanStack Start",
  priority: 100,

  detect: (project) => project.has("@tanstack/react-start") || project.has("@tanstack/start"),

  defaultBinding: () => "react",

  cssFile: () => "src/styles/skryensya.css",

  wiring(project, cssFile) {
    const roots = ROOTS.filter((file) => project.exists(file));
    if (roots.some((file) => project.read(file)?.includes("skryensya.css"))) return { wired: true, instruction: "" };
    const root = roots[0];
    return {
      wired: false,
      instruction: root
        ? `Import the stylesheet once, at the top of ${root}:\n    import "${relativeImport(root, cssFile)}";`
        : `Import ${cssFile} once from your root route (src/routes/__root.tsx).`,
    };
  },

  notes: () => [],
};
