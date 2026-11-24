import type { Decorator, Preview } from "@storybook/html-vite";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import { themes } from "storybook/theming";
import { applyPage, docsParameters, fitStoryContainer, globalTypes, initialGlobals, parameters, storyContainer } from "@skryensya/storybook-kit/shared";

/* The same base sheets as the React Storybook; each stories file brings its component sheets. */
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss"; // brings the state layer and the icon pattern with it
import "@skryensya/core/dimensions/radius.scss";
import "@skryensya/core/dimensions/press-scale.scss";
import "@skryensya/core/patterns/scrollbar.css"; // the scroll boxes of the examples use it

/* The width the story's content gets (see `storyContainer` in the kit); a story renders a string or a node. */
const withPage: Decorator = (Story, { globals, parameters }) => {
  applyPage(globals);
  const size = storyContainer(globals, parameters);
  const box = document.createElement("div");
  box.setAttribute("data-sk-story-container", size);
  const story = Story();
  if (typeof story === "string") box.innerHTML = story;
  else box.append(story as Node);
  if (size === "xl") fitStoryContainer(box);
  return box;
};

/* Foundations first, then the components A to Z, then the playground. Inline because Storybook reads `storySort` from this file statically; names are not compared, so a component's stories keep the order the generator wrote. */
const preview: Preview = { decorators: [withPage], globalTypes, initialGlobals, parameters: { ...parameters, options: { storySort: { method: "alphabetical", order: ["Foundations", "Components", "Playground"], locales: "en" } }, docs: docsParameters(themes, DocsContainer) } };

export default preview;
