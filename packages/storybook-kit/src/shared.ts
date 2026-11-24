/*
 * THE PREVIEW SETTINGS BOTH STORYBOOKS USE: the toolbar and the page the stories sit on. Each app
 * (`apps/storybook-react`, `apps/storybook-vanilla`) spreads these into its own `.storybook/preview`.
 */

import { createElement, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { addons } from "storybook/preview-api";
import { GLOBALS_UPDATED, SET_GLOBALS, UPDATE_GLOBALS } from "storybook/internal/core-events";
import type { DocsContextProps } from "@storybook/addon-docs/blocks";
import type { ThemeVars } from "storybook/theming";
import { palettePresets, type PalettePreset } from "../../../apps/docs/src/lib/palette-presets.ts";

/* The docs header's own accent list (`lib/palette-presets.ts`), in its order, with the library's blue first as "Default". */
const accents: PalettePreset[] = palettePresets("en");

export const globalTypes = {
  accent: {
    description: "Accent colour: the docs' own palette presets",
    toolbar: {
      title: "Accent",
      icon: "paintbrush" as const,
      items: [{ value: "", title: "Default" }, ...accents.map((preset) => ({ value: preset.id, title: preset.name }))],
      dynamicTitle: true,
    },
  },
  locale: {
    description: "The locale the docs trees are translated into",
    toolbar: {
      title: "Locale",
      icon: "globe" as const,
      items: [
        { value: "en", title: "English" },
        { value: "es", title: "Español" },
      ],
      dynamicTitle: true,
    },
  },
  container: {
    description: "The box a story sits in: the docs preview stage by default, or one of its screen widths",
    toolbar: {
      title: "Container",
      icon: "component" as const,
      items: [
        { value: "", title: "Story default" },
        { value: "site", title: "Site preview" },
        { value: "mobile", title: "Mobile, 390px" },
        { value: "tablet", title: "Tablet, 768px" },
        { value: "xl", title: "XL, 1440px" },
        { value: "full", title: "Full, no container" },
      ],
      dynamicTitle: true,
    },
  },
  mode: {
    description: "color-scheme on the root",
    toolbar: {
      title: "Mode",
      icon: "mirror" as const,
      items: [
        { value: "auto", title: "System" },
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = { locale: "en", mode: "auto", accent: "", container: "" };

export const parameters = {
  /* Padded, not centered: a centered story is shrink-wrapped, and everything that sizes to its
     container (a canvas, a table, a navbar) collapses to nothing. The docs stage is full width too. */
  layout: "padded",
  backgrounds: { disable: true },
  controls: { expanded: true },
  /* The code panel beside every story: the binding's own source (TSX in React, HTML in Vanilla),
     which each app's `tree-story` writes from the same tree the story draws. */
  docs: { codePanel: true },
};

import { applyColorMode, readAppearance, type Appearance, type ColorMode } from "@skryensya/core/theme-toggle";

const modes: Record<string, ColorMode> = { auto: "system", light: "light", dark: "dark" };

/*
 * THE STORY CONTAINER: the width a story's content gets, nothing drawn. By default the width a component has
 * inside the site's example card (`.sk-preview-card__stage`: the 76ch reading column less the card's
 * inset-md padding and 1px border, 647px at 1440 measured in the browser), or one of the site's screen widths.
 * The toolbar's Container wins; on "Story default" a story's own `parameters.container` does.
 */
export type StoryContainer = "site" | "mobile" | "tablet" | "xl" | "full";
const containers = new Set<string>(["site", "mobile", "tablet", "xl", "full"]);

/** The container a tree asks for when its story names none: an app shell is a whole page. */
export const containerForTree = (tree: { contract: string }): StoryContainer | undefined =>
  tree.contract === "app-shell" ? "full" : undefined;

export function storyContainer(globals: Record<string, unknown>, parameters: Record<string, unknown>): StoryContainer {
  const chosen = String(globals.container ?? "");
  const own = String(parameters.container ?? "");
  return (containers.has(chosen) ? chosen : containers.has(own) ? own : "site") as StoryContainer;
}

const containerStyles = `
[data-sk-story-container] {
  --sk-story-content-inline-size: calc(76ch - var(--space-inset-md) * 2 - 2px);
  box-sizing: border-box;
  inline-size: min(var(--sk-story-content-inline-size), 100%);
  margin-inline: auto;
}
[data-sk-story-container="mobile"] { --sk-story-content-inline-size: 390px; }
[data-sk-story-container="tablet"] { --sk-story-content-inline-size: 768px; }
/* The width has to be real for the layouts' own queries to fire, so it is not clamped: it zooms out to fit, as the site's XL does. */
[data-sk-story-container="xl"] { inline-size: 1440px; zoom: var(--sk-story-xl-zoom, 1); }
[data-sk-story-container="full"], [data-sk-story-stage] { display: contents; }
`;

/* One observer for every XL story on the page (a docs page draws several); a box not in the page yet measures 0 and waits for its first resize. */
let xlObserver: ResizeObserver | undefined;

/** Keeps an XL container zoomed to fit the room around it, the site's `min(1, room / 1440)`. Returns the cleanup. */
export function fitStoryContainer(container: HTMLElement): () => void {
  xlObserver ??= new ResizeObserver((entries) => {
    for (const { target } of entries) {
      const width = (target as HTMLElement).clientWidth;
      const box = target.querySelector<HTMLElement>(":scope > [data-sk-story-container]");
      if (width && box) box.style.setProperty("--sk-story-xl-zoom", String(Math.min(1, width / 1440)));
    }
  });
  const room = container.parentElement;
  if (!room) {
    /* Vanilla returns the box before it is placed: measure once it is. */
    queueMicrotask(() => container.parentElement && xlObserver!.observe(container.parentElement));
    return () => container.parentElement && xlObserver?.unobserve(container.parentElement);
  }
  xlObserver.observe(room);
  return () => xlObserver?.unobserve(room);
}

/** The appearance the page paints now: the toolbar's Mode, or the OS when it is on System. */
export function currentAppearance(): Appearance {
  const dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  return readAppearance(document.documentElement, dark);
}

/*
 * The docs page's own chrome (Storybook's wrapper, its story blocks) paints a theme of its own, light unless told
 * otherwise, so a story under dark tokens landed on a white page: light text on white. The wrapper takes the
 * tokens' canvas and ink instead, so Mode moves the page and the example together.
 */
const docsSurfaces = `
html, body {
  background: var(--color-bg-canvas);
}
body {
  min-block-size: 100vh;
}
.sbdocs-wrapper, .sbdocs-content, .docs-story {
  background: var(--color-bg-canvas) !important;
  color: var(--color-text-primary);
}
.sbdocs-wrapper {
  min-block-size: 100vh;
}
.docs-story { border-radius: var(--radius-surface); }
`;

/**
 * `parameters.docs` with a theme that follows the Mode toolbar. A `theme` parameter is read once, when the docs page
 * is first drawn, and resolves `System` against the OS: so the page ignored Mode, and kept the theme it started with
 * after a change. The container below is a React component that reads the Mode from the story context, listens to
 * the channel for the next change, and hands `DocsContainer` the matching theme. `themes` is Storybook's own
 * (`storybook/theming`) and `DocsContainer` is the addon's, handed in because only each app, not this package, has
 * them to import.
 */
export function docsParameters(themes: { light: ThemeVars; dark: ThemeVars }, DocsContainer: ComponentType<{ context: DocsContextProps; theme?: ThemeVars; children?: ReactNode }>) {
  const Container = ({ context, children }: { context: DocsContextProps; children?: ReactNode }) => {
    const first = context.componentStories()[0];
    const [mode, setMode] = useState<string>(() => String((first && context.getStoryContext(first).globals?.mode) ?? "auto"));
    const [prefersDark, setPrefersDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
    useEffect(() => {
      const take = (event?: { globals?: { mode?: unknown } }) => {
        if (event?.globals?.mode !== undefined) setMode(String(event.globals.mode));
      };
      context.channel.on(SET_GLOBALS, take);
      context.channel.on(GLOBALS_UPDATED, take);
      const media = window.matchMedia?.("(prefers-color-scheme: dark)");
      const follow = () => setPrefersDark(media?.matches ?? false);
      media?.addEventListener("change", follow);
      return () => {
        context.channel.off(SET_GLOBALS, take);
        context.channel.off(GLOBALS_UPDATED, take);
        media?.removeEventListener("change", follow);
      };
    }, [context]);
    const dark = mode === "dark" || (mode !== "light" && prefersDark);
    return createElement(DocsContainer, { context, theme: dark ? themes.dark : themes.light }, children);
  };
  return { ...parameters.docs, container: Container };
}

/** `base` for the manager's theme (`create({ base })`): the OS preference, since the toolbar lives inside it. */
export const managerBase = (): "light" | "dark" => (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");

/*
 * THE OTHER DIRECTION: an example may carry its own colour-mode control (the kit's `StateButton` + `theme-toggle`),
 * which writes `data-scheme` on the root without telling Storybook. This watches that attribute and, when it names a
 * mode the toolbar is not on, sends it to the toolbar (`UPDATE_GLOBALS`), so the Mode menu, the manager chrome and
 * the docs page follow the example. The write `applyPage` itself makes is the same mode the toolbar already has, so
 * it never echoes back.
 */
let knownMode = "auto";
let watching = false;
function watchScheme(): void {
  if (watching) return;
  watching = true;
  new MutationObserver(() => {
    const seen = document.documentElement.getAttribute("data-scheme");
    const mode = seen === "light" || seen === "dark" ? seen : seen === "system" ? "auto" : null;
    if (!mode || mode === knownMode) return;
    knownMode = mode;
    addons.getChannel().emit(UPDATE_GLOBALS, { globals: { mode } });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-scheme"] });
}

/*
 * Mode is `color-scheme` AND `data-scheme` on the root (the kit's own `applyColorMode`, the one the docs site's
 * toggle uses), which is what arms every `light-dark()` in the semantic tier and what the chrome keyed to the
 * scheme reads; the page background, ink and family follow the way the docs page around a preview sets them.
 */
export function applyPage(globals: Record<string, unknown>): void {
  knownMode = String(globals.mode);
  watchScheme();
  applyColorMode(document.documentElement, modes[String(globals.mode)] ?? "system");
  applyAccent(document.documentElement, typeof globals.accent === "string" ? globals.accent : "");
  if (!document.getElementById("sk-docs-surfaces")) {
    const style = document.createElement("style");
    style.id = "sk-docs-surfaces";
    style.textContent = docsSurfaces + containerStyles;
    document.head.append(style);
  }
  document.body.style.background = "var(--color-bg-canvas)";
  document.body.style.color = "var(--color-text-primary)";
  document.body.style.fontFamily = "var(--font-family-body)";
}

/*
 * THE ACCENT, GLOBAL, from the docs' own presets. A preset is the whole semantic accent bundle as explicit values
 * (`--color-action-accent`, the accent text, border, focus ring, wash), the same object the docs header writes onto
 * the root, so a story shows exactly what the docs page shows for that choice. "Default" removes them and gives back
 * the library's own blue.
 */
const accentProperties = [...new Set(accents.flatMap((preset) => Object.keys(preset.tokens)))];

export function applyAccent(root: HTMLElement, id: string): void {
  for (const property of accentProperties) root.style.removeProperty(property);
  const preset = accents.find((candidate) => candidate.id === id);
  if (!preset) return;
  for (const [property, value] of Object.entries(preset.tokens)) root.style.setProperty(property, value);
}

/*
 * THE FIRST PAINT. `applyPage` runs when the first story renders, which in a cold dev server is seconds after the
 * iframe appears: until then the page is Storybook's own white, and a dark Mode flashed white, then dark. The
 * iframe's address carries the toolbar's globals (`?globals=mode:dark;accent:...`), so the mode and the canvas
 * can be painted the moment this module loads (the token sheets are imported before it), and `applyPage` later
 * writes the same values.
 */
function paintFirst(): void {
  if (typeof document === "undefined" || !location.pathname.endsWith("iframe.html")) return;
  const wanted = new URLSearchParams(location.search).get("globals") ?? "";
  const mode = /(?:^|;)mode:(auto|light|dark)(?:;|$)/.exec(wanted)?.[1] ?? "auto";
  applyPage({ mode });
}
paintFirst();
