import type { Decorator, Preview } from "@storybook/react-vite";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import { themes } from "storybook/theming";
import { applyPage, docsParameters, globalTypes, initialGlobals, parameters } from "@skryensya/storybook-kit/shared";

/*
 * Only what every story shares: the font, the tokens and the tier-3 dimension switches. Each generated stories file imports its own component sheets, the
 * `sheetsForTree` closure of its trees, so a story never depends on another having loaded first.
 */
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss"; // brings the state layer and the icon pattern with it
import "@skryensya/core/dimensions/radius.scss";
import "@skryensya/core/dimensions/press-scale.scss";
import "@skryensya/core/patterns/scrollbar.css"; // the scroll boxes of the examples use it

const withPage: Decorator = (Story, { globals }) => {
  applyPage(globals);
  return <Story />;
};

/* Foundations first, then the components A to Z, then the playground. Inline because Storybook reads `storySort` from this file statically; names are not compared, so a component's stories keep the order the generator wrote. */
const preview: Preview = { decorators: [withPage], globalTypes, initialGlobals, parameters: { ...parameters, options: { storySort: { method: "alphabetical", order: ["Foundations", "Components", "Playground"], locales: "en" } }, docs: docsParameters(themes, DocsContainer) } };

export default preview;
