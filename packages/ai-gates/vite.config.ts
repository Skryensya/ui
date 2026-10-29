import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

/*
 * The stage runs BOTH bindings in one page, so it needs both compilers: React for the React binding,
 * and Svelte because the Vanilla layer's enhancers are Svelte components underneath (decision 24).
 * That the vanilla path costs a compiler here is not a leak: the enhancer still renders no markup;
 * it mounts over the markup the emitter produced.
 */
export default defineConfig({
  root: "harness",
  plugins: [react(), svelte()],
  server: { port: 4180, strictPort: true },
  /* Vite's CSS minify is lightningcss, which aborts the build on a pseudo-element it cannot parse
     (`::picker(select)::-webkit-scrollbar-thumb`, which Chrome accepts); recover and keep the rule
     as authored, as core's build-css and the docs' config already do. */
  css: { lightningcss: { errorRecovery: true } },
});
