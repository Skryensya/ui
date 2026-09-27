/* This Storybook's own stories, generated from the docs demos: see `@skryensya/storybook-kit/generate`. */
import { fileURLToPath } from "node:url";
import { generateStories } from "@skryensya/storybook-kit/generate";

await generateStories({
  app: fileURLToPath(new URL("..", import.meta.url)),
  check: process.argv.includes("--check"),
});
