import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

/* Which binding this Storybook shows, in its own chrome: the two are separate apps. */
addons.setConfig({ theme: create({ base: "light", brandTitle: "skryensya/ui · React" }) });
