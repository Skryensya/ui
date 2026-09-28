import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

/*
 * The site kit as two fixed files, `kit.js` and `kit.css`, in `kit-dist/`. The publisher names them
 * by their content hash when it uploads, so the files themselves need no hash in their names.
 * Svelte, because the vanilla enhancers are Svelte components underneath (decision 24).
 */
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [svelte()],
  build: {
    outDir: fileURLToPath(new URL("../kit-dist", import.meta.url)),
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: true,
    cssMinify: true,
    assetsInlineLimit: 1_000_000,
    lib: { entry: fileURLToPath(new URL("entry.ts", import.meta.url)), formats: ["es"], fileName: () => "kit.js" },
    rollupOptions: { output: { assetFileNames: (asset) => (asset.names?.[0]?.endsWith(".css") ? "kit.css" : "[name][extname]") } },
  },
});
