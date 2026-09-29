import type { Decorator, Preview } from "@storybook/react-vite";
import { applyPage, globalTypes, initialGlobals, parameters } from "@skryensya/storybook-kit/shared";

/*
 * Only what every story shares: the font, the tokens and the tier-3 dimension switches. Each generated stories file imports its own component sheets, the
 * `sheetsForTree` closure of its trees, so a story never depends on another having loaded first.
 */
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss"; // brings the state layer and the icon pattern with it
import "@skryensya/core/dimensions/radius.scss";
import "@skryensya/core/dimensions/press-scale.scss";

const withPage: Decorator = (Story, { globals }) => {
  applyPage(globals);
  return <Story />;
};

const preview: Preview = { decorators: [withPage], globalTypes, initialGlobals, parameters };

export default preview;
