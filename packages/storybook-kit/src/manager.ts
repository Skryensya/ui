import { createElement } from "react";
import { addons, types } from "storybook/manager-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { create } from "storybook/theming";
import { Button } from "storybook/internal/components";

/* The launch glyph (an arrow leaving a box), drawn inline: it says the click leaves this Storybook for a new tab. */
const launchIcon = () =>
  createElement(
    "svg",
    { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    createElement("path", { d: "M14 4h6v6" }),
    createElement("path", { d: "M20 4 10 14" }),
    createElement("path", { d: "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" }),
  );

/*
 * THE LINK TO THE OTHER BINDING'S STORYBOOK, a toolbar button. The two Storybooks are separate apps that share
 * their story ids (the same generator writes both), so the same story is one query string away: the click opens
 * the sibling in a new tab with this tab's own `?path=` and `globals`, read at the moment of the click so it
 * follows whichever story is open. A button, not a link: Storybook's own Button has no href.
 */
export function registerSiblingLink({ label, port }: { label: string; port: number }): void {
  const origin = () => `${location.protocol}//${location.hostname}:${port}`;
  addons.register("skryensya/sibling-link", () => {
    addons.add("skryensya/sibling-link/tool", {
      type: types.TOOL,
      title: label,
      match: ({ viewMode }) => viewMode === "story" || viewMode === "docs",
      render: () =>
        createElement(
          Button,
          {
            onClick: () => window.open(`${origin()}/${location.search}`, "_blank", "noopener"),
            size: "small",
            variant: "outline",
          },
          label,
          launchIcon(),
        ),
    });
  });
}

/*
 * THE MANAGER'S OWN THEME FOLLOWS THE MODE TOOLBAR. Light and Dark set the chrome to match the examples; System
 * follows the OS, live. Registered after the first `setConfig`, so the first paint is already the OS theme.
 */
export function followMode({ brandTitle }: { brandTitle: string }): void {
  addons.register("skryensya/follow-mode", (api) => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    /* The event carries the globals it just set; `api.getGlobals()` is still the previous ones at that moment.
       The first value is the manager's own address (`?globals=mode:dark`). Only `GLOBALS_UPDATED` moves it after
       that: a reloading preview announces its initial globals again (Mode `auto`) before it reads the address, and
       taking that one flipped the whole chrome to light for the length of the reload. */
    let mode: unknown = /(?:^|[=;])mode:(auto|light|dark)/.exec(decodeURIComponent(location.search))?.[1] ?? api.getGlobals()?.mode;
    const apply = () => {
      const base = mode === "dark" || mode === "light" ? mode : media.matches ? "dark" : "light";
      api.setOptions({ theme: create({ base, brandTitle }) });
      /* A frame whose scheme differs from the page around it is painted opaque white while it loads; matching
         it keeps the blank frame between two documents transparent over the chrome. */
      document.documentElement.style.colorScheme = base;
    };
    const take = (event?: { globals?: { mode?: unknown } }) => {
      mode = event?.globals?.mode ?? mode;
      apply();
    };
    const channel = addons.getChannel();
    channel.on(GLOBALS_UPDATED, take);
    media.addEventListener("change", apply);
    apply();
  });
}
