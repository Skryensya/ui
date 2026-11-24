import type { Decorator, Preview } from "@storybook/react-vite";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import { themes } from "storybook/theming";
import { applyPage, docsParameters, fitStoryContainer, globalTypes, initialGlobals, parameters, storyContainer, type StoryContainer } from "@skryensya/storybook-kit/shared";
import { useEffect, useRef, type ReactNode } from "react";

/*
 * Only what every story shares: the font, the tokens and the tier-3 dimension switches. Each generated stories file imports its own component sheets, the
 * `sheetsForTree` closure of its trees, so a story never depends on another having loaded first.
 */
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss"; // brings the state layer and the icon pattern with it
import "@skryensya/core/dimensions/radius.scss";
import "@skryensya/core/dimensions/press-scale.scss";
import "@skryensya/core/patterns/scrollbar.css"; // the scroll boxes of the examples use it
import { IconSetProvider } from "@skryensya/react/icon";
import { icons } from "../src/icons";
import "../src/icons.css";

/* The width the story's content gets (see `storyContainer` in the kit). */
function Container({ size, children }: { size: StoryContainer; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => (size === "xl" && box.current ? fitStoryContainer(box.current) : undefined), [size]);
  return (
    <div ref={box} data-sk-story-container={size}>
      {children}
    </div>
  );
}

const withPage: Decorator = (Story, { globals, parameters }) => {
  applyPage(globals);
  return (
    <IconSetProvider set={icons}>
      <Container size={storyContainer(globals, parameters)}>
        <Story />
      </Container>
    </IconSetProvider>
  );
};

/* Foundations first, then the components A to Z, then the playground. Inline because Storybook reads `storySort` from this file statically; names are not compared, so a component's stories keep the order the generator wrote. */
const preview: Preview = { decorators: [withPage], globalTypes, initialGlobals, parameters: { ...parameters, options: { storySort: { method: "alphabetical", order: ["Foundations", "Components", "Playground"], locales: "en" } }, docs: docsParameters(themes, DocsContainer) } };

export default preview;
