/*
 * WHAT BOTH STORYBOOKS SHARE, the React one (this app) and the Vanilla one (`apps/storybook-vanilla`):
 * the toolbar, the page the stories sit on, and the stories themselves. Only the renderer differs,
 * and each app supplies its own behind the `@story` alias (see `main-shared.ts`).
 */

export const globalTypes = {
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

export const initialGlobals = { locale: "en", mode: "auto" };

export const parameters = {
  /* Padded, not centered: a centered story is shrink-wrapped, and everything that sizes to its
     container (a canvas, a table, a navbar) collapses to nothing. The docs stage is full width too. */
  layout: "padded",
  backgrounds: { disable: true },
  controls: { expanded: true },
};

/*
 * Mode is `color-scheme` on the root, which is what arms every `light-dark()` in the semantic tier;
 * the page background, ink and family follow the way the docs page around a preview sets them.
 */
export function applyPage(globals: Record<string, unknown>): void {
  const root = document.documentElement;
  root.style.colorScheme = globals.mode === "auto" ? "" : String(globals.mode);
  document.body.style.background = "var(--color-bg-canvas)";
  document.body.style.color = "var(--color-text-primary)";
  document.body.style.fontFamily = "var(--font-family-body)";
}
