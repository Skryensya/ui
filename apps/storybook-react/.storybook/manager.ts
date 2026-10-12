import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import { followMode, registerSiblingLink } from "@skryensya/storybook-kit/manager";
import { managerBase } from "@skryensya/storybook-kit/shared";

/* Which binding this Storybook shows, in its own chrome: the two are separate apps. */
addons.setConfig({ theme: create({ base: managerBase(), brandTitle: "skryensya/ui · React" }) });

/* The same story in the other binding's Storybook, in a new tab. */
registerSiblingLink({ label: "View in Vanilla", port: 6107 });

/* The chrome takes the Mode toolbar's light or dark. */
followMode({ brandTitle: "skryensya/ui · React" });
