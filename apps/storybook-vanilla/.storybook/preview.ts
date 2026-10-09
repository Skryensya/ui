import type { Decorator, Preview } from "@storybook/html-vite";
import { applyPage, globalTypes, initialGlobals, parameters } from "@skryensya/storybook-kit/shared";

/* The same base sheets as the React Storybook; each stories file brings its component sheets. */
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss"; // brings the state layer and the icon pattern with it
import "@skryensya/core/dimensions/radius.scss";
import "@skryensya/core/dimensions/press-scale.scss";
import "@skryensya/core/patterns/scrollbar.css"; // the scroll boxes of the examples use it

const withPage: Decorator = (Story, { globals }) => {
  applyPage(globals);
  return Story();
};

const preview: Preview = { decorators: [withPage], globalTypes, initialGlobals, parameters };

export default preview;
