import { relativeImport } from "../project.js";
import type { FrameworkAdapter } from "./types.js";

const EXTENSIONS = ["tsx", "jsx", "ts", "js"] as const;
const ENTRIES = ["src/main", "src/index"].flatMap((base) => EXTENSIONS.map((ext) => `${base}.${ext}`));

/**
 * Meta-frameworks that run on Vite but own their layout and routing, so "import it from main.tsx"
 * would be wrong for them. A project with one of these is NOT a plain Vite app, and saying "no
 * supported framework" is more honest than writing a stylesheet nothing will ever import.
 */
const OTHER_FRAMEWORKS = [
  "@sveltejs/kit",
  "nuxt",
  "@remix-run/dev",
  "@solidjs/start",
  "@analogjs/platform",
  "@builder.io/qwik-city",
  "@redwoodjs/core",
  "vike",
  "waku",
];

export const vite: FrameworkAdapter = {
  id: "vite",
  label: "Vite",
  // A bundler under almost every other framework here: it only wins when it is all there is.
  priority: 10,

  detect: (project) => project.has("vite") && !OTHER_FRAMEWORKS.some((name) => project.has(name)),

  defaultBinding: (project) => (project.has("react") ? "react" : "vanilla"),

  cssFile: () => "src/skryensya.css",

  wiring(project, cssFile) {
    const entries = ENTRIES.filter((file) => project.exists(file));
    const files = [...entries, ...(project.exists("index.html") ? ["index.html"] : [])];
    if (files.some((file) => project.read(file)?.includes("skryensya.css"))) return { wired: true, instruction: "" };
    const entry = entries[0];
    return {
      wired: false,
      instruction: entry
        ? `Import the stylesheet once, at the top of ${entry}:\n    import "${relativeImport(entry, cssFile)}";`
        : `Import ${cssFile} once from your app's entry module (the one index.html loads).`,
    };
  },

  notes: (_project, binding) =>
    binding === "vanilla"
      ? ["Vanilla mounts its components itself. Load the auto-loader once, in your entry module:\n    import \"@skryensya/vanilla/auto\";"]
      : [],
};
