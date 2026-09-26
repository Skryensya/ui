import type { Decorator, Preview } from "@storybook/react-vite";

/*
 * Only what every story shares: the font, the tokens and the tier-3 dimension switches the
 * playground's layout loads. Each generated stories file imports its own component sheets, the
 * `sheetsForTree` closure of its trees, so a story never depends on another having loaded first.
 */
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss"; // brings the state layer and the icon pattern with it
import "@skryensya/core/dimensions/radius.scss";
import "@skryensya/core/dimensions/press-scale.scss";

/*
 * Mode is `color-scheme` on the root, which is what arms every `light-dark()` in the semantic tier;
 * the page background, ink and family follow the way the docs page around a preview sets them.
 */
const withMode: Decorator = (Story, { globals }) => {
  const root = document.documentElement;
  root.style.colorScheme = globals.mode === "auto" ? "" : String(globals.mode);
  document.body.style.background = "var(--color-bg-canvas)";
  document.body.style.color = "var(--color-text-primary)";
  document.body.style.fontFamily = "var(--font-family-body)";
  return <Story />;
};

const preview: Preview = {
  decorators: [withMode],
  globalTypes: {
    locale: {
      description: "The locale the docs trees are translated into",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "es", title: "Español" },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: "color-scheme on the root",
      toolbar: {
        title: "Mode",
        icon: "mirror",
        items: [
          { value: "auto", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: "en", mode: "auto" },
  parameters: {
    /* Padded, not centered: a centered story is shrink-wrapped, and everything that sizes to its
       container (a canvas, a table, a navbar) collapses to nothing. The docs stage is full width too. */
    layout: "padded",
    backgrounds: { disable: true },
    controls: { expanded: true },
  },
};

export default preview;
