import { relativeImport, type Project } from "../project.js";
import type { FrameworkAdapter } from "./types.js";

const CSS_FILE = "src/styles/skryensya.css";

const layouts = (project: Project): string[] => [
  ...project.files("src/layouts", [".astro"]),
  ...project.files("src/pages", [".astro"]),
];

export const astro: FrameworkAdapter = {
  id: "astro",
  label: "Astro",
  priority: 100,

  detect: (project) => project.has("astro"),

  // React needs its integration registered in the Astro config; without it the vanilla binding is
  // the one that works with no setup, so it is the honest default.
  defaultBinding: (project) => (project.has("@astrojs/react") ? "react" : "vanilla"),

  cssFile: () => CSS_FILE,

  wiring(project, cssFile) {
    const files = layouts(project);
    if (files.some((file) => project.read(file)?.includes("skryensya.css"))) return { wired: true, instruction: "" };
    const layout = project.files("src/layouts", [".astro"])[0] ?? files[0];
    return {
      wired: false,
      instruction: layout
        ? `Import the stylesheet once, in the frontmatter of ${layout}:\n    import "${relativeImport(layout, cssFile)}";`
        : `Import ${cssFile} once, in the frontmatter of your base layout.`,
    };
  },

  notes(project, binding) {
    if (binding === "vanilla") {
      return [
        "Vanilla mounts its components itself. Load the auto-loader once, in a <script> of your base layout:\n    import \"@skryensya/vanilla/auto\";",
      ];
    }
    return [
      ...(project.has("@astrojs/react") ? [] : ["The React binding needs Astro's React integration. Run: npx astro add react"]),
      "An interactive React component needs a client directive to run in the browser: <Button client:load>…</Button>.",
    ];
  },
};
