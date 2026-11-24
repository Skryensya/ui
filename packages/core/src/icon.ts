import type { ComponentContract } from "./contract.js";
/*
 * The icon contract. Types and vocabulary, no geometry, no DOM, no dependencies.
 *
 * Core names ROLES and never a provider (decision 2). "chevron-down" is a position the system
 * references; which drawing occupies it is decided by the consumer when binding an IconSet, exactly
 * like a brand decides which hue occupies --palette-blue-600. A core module called `lucide` would be
 * a tenant with a proper name, and it would also break the package's empty dependencies.
 *
 * What is NOT here, and why (decision 15):
 *   - providers with hasIcon/getIcon: a runtime service needs the whole catalogue in memory, which
 *     is exactly what the allowlist was meant to avoid. A set is an index, not a service.
 *   - manifest and type generators: the consumer's object literal IS the manifest, and `satisfies`
 *     gives the same error generated types would. Removing dead code is the bundler's job.
 */

/**
 * Normalized SVG geometry: the children of an `<svg>`, without the element.
 *
 * The binding writes the `<svg>` (viewBox, a11y, class); the set contributes only what goes inside.
 * That split is what keeps accessibility and the class name out of the set's reach.
 */
export type IconData = {
  /**
   * Markup that is a child of the `<svg>`. TRUSTED: authored in the project or generated at build
   * time, never from a user or an API; the renderer injects it without sanitizing. See the cost
   * stated in decision 15.
   */
  body: string;
  /**
   * The literal viewBox `body` was drawn in. Never a rendered size, that is decided by
   * `--sk-icon-size`.
   *
   * It is a string and not a width/height pair because a viewBox does not always start at `0 0`:
   * Material draws in `0 -960 960 960`. Storing two numbers and assembling `0 0 w h` was a lossy
   * encoding that only worked by coincidence, while the only sets were Lucide (`0 0 24 24`) and
   * Phosphor (`0 0 256 256`).
   */
  viewBox: string;
  /**
   * Presentation attributes for the outer `<svg>`. This is where the geometry's intent lives: an
   * outline set sets `{ fill: "none", stroke: "currentColor", "stroke-width": "2" }` and a solid one
   * sets `{ fill: "currentColor" }`.
   *
   * It belongs to the set and not to CSS on purpose: a CSS declaration beats a presentation
   * attribute, so a `fill: currentColor` in patterns/icon.css would turn every outline set solid.
   */
  attrs?: Readonly<Record<string, string>>;
};

/**
 * The stable vocabulary: the roles the system references and that survive a change of set.
 *
 * It covers an app's most common cases, not just what the foundational components consume: a
 * vocabulary that only reached `chevron-down` would force every project to re-declare `search` or
 * `delete` as its own icon, and then the name of the system's most common role would be different in
 * every app, which is exactly what a stable vocabulary exists to prevent.
 *
 * Every name here is a ROLE, never a drawing (decision 2, one tier up). That is why `delete` and not
 * `trash`, `edit` and not `pencil`, `search` and not `magnifying-glass`, `more` and not `dots`,
 * `visibility` and not `eye`: the name has to stay true when another set draws the role differently.
 * The `chevron-*` and `arrow-*` ones are the deliberate exception, they name a direction, and the
 * distinction between the two (chevron reveals, arrow moves) has no other short name.
 *
 * `danger`, not `error`: the system already says danger in --color-text-danger, --color-action-danger
 * and BadgeTone, and a word does not coexist with its synonym.
 *
 * The limit stays the same: a PRODUCT concept (invoice, warehouse, airplane-tilt) does not get in no
 * matter how common it is in an app, it is passed as `data` and belongs to the consumer. And every
 * name here is an obligation for every set author, because IconSet is complete: adding one is
 * additive for the consumer and new work for whoever draws.
 */
export const stableIconNames = [
  // dirección, chevron revela y adjunta, arrow mueve y navega
  "chevron-up",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  /* VOTING, and why it is a role of its own and not "the fat arrow". The `arrow-*` ones above name a
   * DIRECTION and are the vocabulary's deliberate exception; this names an ACTION, and that is why it
   * works as a stable name where `arrow-big-up` would not: that is the name Lucide gives the drawing,
   * Phosphor calls it `arrow-fat-up` and Material does not even draw an arrow, it draws a thumb.
   * Three drawings, one role, which is exactly the case this list exists to resolve (`delete` and not
   * `trash`). A set decides what occupies it; the system asks for "voting". */
  "vote-up",
  "vote-down",
  /* LIKING, a different role from voting and not a synonym: a vote ranks (up moves a comment above
   * others), a like reacts. A CommentVote in `voteStyle: "like"` is the first to ask for it. Every set
   * happens to draw a thumb here, which is also why no set may draw a thumb for `vote-up` any more:
   * the two faces of one control have to look different in every set. */
  "like",
  "dislike",
  /* Keeping something to come back to: a wishlist, a saved item, a favourite. A heart in most sets, a star in
   * some: the role is the keeping, not the drawing. Not `like`, which is approval of what someone else said. */
  "favorite",
  "external-link",

  // acción
  "add",
  "remove",
  "close",
  "check",
  "search",
  "edit",
  "delete",
  "copy",
  /* Source, as a role: a set may draw angle brackets, a terminal prompt or a file with brackets on
   * it, and "this is code" stays true of all three. Not "brackets", which names the drawing. */
  "code",
  "filter",
  "refresh",
  /* Zooms the view out, it does not name a magnifying glass: a set may draw a minus in a circle or
   * arrows pointing inward, and the role stays true. */
  "zoom-out",
  /* Its pair, for a canvas's zoom control. */
  "zoom-in",
  "expand-all",
  "collapse-all",
  /* Fits the whole of something into the view it is shown in: a canvas's "show me all of it". A set
   * may draw four outward corners or a frame; not "maximize", which is about the WINDOW. */
  "fit",
  /* The three stages of a Window, the reason "fit" is not "maximize". Each names what the control
   * DOES to the window, not a drawing: a set may draw a bar, an underscore or arrows. `restore` is
   * the way back from either of the other two, which is why it is one role and not two. */
  "minimize",
  "maximize",
  "restore",
  "more",
  "menu",

  // state, the four tones the system already names
  "info",
  "success",
  "warning",
  "danger",

  /* THE ROLE THAT NAMES NO ROLE, which is precisely the role it names. It stands in for a glyph that
   * has not been chosen: an anatomy diagram whose subject must not say anything of its own, a slot a
   * consumer will fill, a specimen that is about structure and not about content.
   *
   * Every set draws it as an empty dashed box (Lucide `SquareDashed`, Phosphor `rectangle-dashed`,
   * Material `select`), and the emptiness IS the drawing, so the name survives the change of set
   * more easily than any other name here. It is the icon twin of the `placeholder` primitive: both
   * are the shape of something that is not there yet. */
  "placeholder",

  /* MEDIA, the roles a player's controls speak. Each names what the control DOES, never the drawing: `play`
   * is "start the media" whether a set draws a triangle or a filled one, `volume-muted` is "the sound is off"
   * whether it crosses a speaker or silences it with a slash. `fullscreen` is not `maximize`, which is the
   * WINDOW's stage (a Window grows inside the page); this one takes the whole screen. `replay` is what the
   * play button becomes when the media has ended, a role of its own because "start again" is not "refresh".
   * `track-previous` and `track-next` move along a list of tracks (an audio player's playlist); they are not
   * `chevron-left` and `chevron-right`, which name a direction on a page, nor `arrow-*`, and a set draws a bar
   * beside a triangle, a double triangle or anything else that says "the track before/after this one". */
  "play",
  "pause",
  "volume",
  "volume-muted",
  "captions",
  "fullscreen",
  "fullscreen-exit",
  "replay",
  "track-previous",
  "track-next",

  // contenido y sistema
  "calendar",
  "clock",
  "upload",
  "download",
  "file",
  "file-text",
  "folder",
  "folder-open",
  "home",
  "settings",
  "user",
  "visibility",
  "visibility-off",
  /* The symbol drawn IN PLACE of a character that is being hidden (an OTP box with `mask`). It names the
   * ROLE, "a hidden character", and not the asterisk most sets draw for it: Lucide and Phosphor draw
   * an asterisk, Material an asterisk too. Another set could draw a dot or a bullet. */
  "mask",
  /* An app's language / locale selection. It is a ROLE, not a drawing: it names "pick the language of
   * this", and it stays true whether a set draws it as two crossed writing strokes (Lucide), an "A文"
   * pair (Material, Phosphor) or anything else. That is why `language` and not `translate`, which is
   * the name two of the three sets give the drawing, nor `globe`, which would say "region / web"
   * before "change the language". The three published sets cover it. */
  "language",
  /* Visual appearance / presentation. This intentionally names the reader-facing setting, not a
   * specific drawing like `palette`: sets can choose a palette, swatches or style cards, and the
   * role remains "change how this looks". */
  "appearance",

  // color mode (the ThemeToggle's faces)
  "mode-system",
  "mode-light",
  "mode-dark",

  /* screen class. It is a ROLE like the rest: it names the SIZE of screen, not the device drawn. A set
   * may draw `screen-desktop` as a monitor or as a laptop and `screen-mobile` as a phone or as a hand
   * holding a phone, and all three names stay true. That is why `screen-desktop` and not `monitor`,
   * which would be the drawing, exactly like `delete` and not `trash`.
   *
   * `screen-desktop` is NOT a synonym of `mode-system`, even though Lucide and Phosphor draw both as
   * a monitor: one says "the system decides the mode" and the other "large screen". Two roles that
   * share a drawing today are still two roles, and a set may separate them tomorrow. */
  "screen-desktop",
  "screen-tablet",
  "screen-mobile",

  /* THE KIT'S OWN COMPONENTS, one mark each: what a catalogue, a sidebar or a command palette draws
   * beside "Accordion" or "QR code". A role like the rest: `component-carousel` names "the Carousel
   * component", and a set draws it as slides, a gallery or a play strip. They are here and not in each
   * app because every app that lists the kit's components needs them, and a list drawn half by the set
   * and half by fixed geometry stops following the set. A new component adds its name here, and every
   * mapped set (iconify-presets.ts) has to draw it; the test says which one does not.
   *
   * Components whose mark is already a role (Calendar → `calendar`, CodePreview → `code`) reuse it. */
  "component-accordion",
  "component-app-shell",
  "component-annotation",
  "component-diagram",
  "component-avatar",
  "component-expressive-avatar",
  "component-back-to-top",
  "component-badge",
  "component-box",
  "component-breadcrumb",
  "component-button",
  "component-callout",
  "component-card",
  "component-canvas",
  "component-carousel",
  "component-changelog",
  "component-checkbox",
  "component-clipboard",
  "component-listbox",
  "component-color-picker",
  "component-combobox",
  "component-comment-thread",
  "component-data-grid",
  "component-date-picker",
  "component-comparison-table",
  "component-description-list",
  "component-dialog",
  "component-dialog-stack",
  "component-drawer",
  "component-empty-state",
  "component-fade-edge",
  "component-feed",
  "component-drop-zone",
  "component-footer",
  "component-form-field",
  "component-grid",
  "component-heading",
  "component-hero",
  "component-icon",
  "component-image-frame",
  "component-media-overlay",
  "component-morph-stack",
  "component-lightbox",
  "component-inline",
  "component-input",
  "component-kbd",
  "component-layout-grid",
  "component-link",
  "component-list",
  "component-loader",
  "component-marquee",
  "component-megamenu",
  "component-menu",
  "component-app-bar",
  "component-menubar",
  "component-message",
  "component-meter",
  "component-navbar",
  "component-number-field",
  "component-pagination",
  "component-placeholder",
  "component-password-input",
  "component-search-field",
  "component-otp-input",
  "component-popover",
  "component-presence",
  "component-procedure",
  "component-timeline",
  "component-progress",
  "component-qr-code",
  "component-quote",
  "component-questionnaire",
  "component-radio-group",
  "component-rating",
  "component-segmented",
  "component-select",
  "component-resizable",
  "component-compare-slider",
  "component-magnifier",
  "component-gallery",
  "component-video-player",
  "component-audio-player",
  "component-scroll-expand",
  "component-scroll-stack",
  "component-separator",
  "component-sidebar",
  "component-skip-link",
  "component-slider",
  "component-button-group",
  "component-stack",
  "component-stat",
  "component-state-button",
  "component-steps",
  "component-switch",
  "component-table",
  "component-table-pager",
  "component-tags-input",
  "component-tabs",
  "component-tag",
  "component-text",
  "component-tile-link",
  "component-tile-checkbox",
  "component-tile-switch",
  "component-tile-radio-group",
  "component-expandable-tile",
  "component-tile-button",
  "component-toast",
  "component-toc",
  "component-toolbar",
  "component-tooltip",
  "component-tour",
  "component-tree-view",
  "component-treegrid",
  "component-user-select",
  "component-window",
  "component-wrapper",
  "component-hotkey",
  "component-scrollbar",
  "component-vaul",
] as const;

export type StableIconName = (typeof stableIconNames)[number];

/*
 * BRAND MARKS, the logos a footer, a share row or a sign-in screen links to. Not roles: a logo IS its
 * drawing, so the name is the brand's. Optional in a set like the component marks, and bound by
 * `iconSetFromIconify(..., { brands: true })` (`skryensya icons <set> --brands`): the collection's own logo
 * where it has one, so it shares the set's stroke, and Tabler's otherwise (iconify-brands.ts). A brand here
 * has to be in Tabler, which the generator checks.
 */
export const brandIconNames = [
  "brand-github",
  "brand-gitlab",
  "brand-x",
  "brand-facebook",
  "brand-instagram",
  "brand-linkedin",
  "brand-youtube",
  "brand-tiktok",
  "brand-discord",
  "brand-whatsapp",
  "brand-telegram",
  "brand-reddit",
  "brand-threads",
  "brand-bluesky",
  "brand-mastodon",
  "brand-figma",
  "brand-slack",
  "brand-google",
  "brand-apple",
  "brand-twitch",
  "brand-pinterest",
  "brand-dribbble",
  "brand-spotify",
  "brand-medium",
] as const;

export type BrandIconName = (typeof brandIconNames)[number];

export const isBrandIconName = (name: string): name is BrandIconName => name.startsWith("brand-");

/**
 * The binding of each role to a geometry; an icon set is a brand.
 *
 * Complete over the interface roles: a set that does not cover them leaves a foundational component
 * without its icon at runtime, just like a brand missing a ramp position leaves a broken color. The
 * `component-*` marks are the exception, optional, so an app that never lists the kit's components does
 * not carry 116 drawings it never shows (`skryensya icons <set> --components` adds them).
 *
 * Core ships none: a real set is the project's dependency (an `@iconify-json/<set>`), bound to the roles
 * by `iconSetFromIconify` in `@skryensya/core/iconify` and written into the project by `skryensya icons`,
 * so only the roles reach a bundle. A hand-written object literal is a set too.
 */
export type IconSet = Readonly<Record<InterfaceIconName, IconData>> & Readonly<Partial<Record<ComponentIconName | BrandIconName, IconData>>>;

/** The marks of the kit's own components (`component-carousel`…), for an app that lists them. */
export type ComponentIconName = Extract<StableIconName, `component-${string}`>;

/** The roles every set must draw: everything but the component marks, which a set carries only when asked. */
export type InterfaceIconName = Exclude<StableIconName, ComponentIconName>;

export const isComponentIconName = (name: string): name is ComponentIconName => name.startsWith("component-");

/**
 * The pattern's three sizes, which the renderer writes as `data-size`.
 *
 * There is no numeric escape hatch: an arbitrary size is requested by re-declaring the hook, which is
 * how every arbitrary value in the system is requested, `.hero .sk-icon { --sk-icon-size: 2rem; }`. A
 * numeric prop that wrote width/height would lose against the CSS inline-size anyway.
 */
export type IconSize = "sm" | "md" | "lg";

/**
 * The icon "box", the `<svg>` the binding writes around a set's geometry, computed ONCE, as data.
 *
 * The same contract was being encoded four times: React's `<Icon>`, vanilla's `buildIcon`, and the
 * docs' `iconMarkup`/`iconDataMarkup`. The rules that matter, the box always owns the class, the
 * viewBox, the size and the accessibility, so a set can never override them; a set's `attrs` supply
 * fill/stroke and nothing else; a label turns a decorative icon into content, lived in only one of
 * the four (vanilla). This centralises them so every renderer stays a thin adapter to its own output
 * target (JSX, a DOM node, a string): pure data in, two ordered attribute groups plus the body out.
 *
 * `presentation` is the set's own attrs (fill/stroke/…), with any box-owned key stripped out so a set
 * can't seize the viewBox or accessibility. `box` is what the binding owns, and it comes LAST at every
 * call site so it wins. An adapter that also carries consumer attributes (React's `{...props}`,
 * vanilla's authored attributes) places them BETWEEN the two groups, after presentation, so they may
 * override fill/stroke; before box, so they never override the contract.
 */
export type RenderIconBoxInput = {
  /** The geometry to wrap. */
  icon: IconData;
  /** Written as `data-icon`; omit to skip it (React re-renders on context change and needs no marker). */
  dataIcon?: string | undefined;
  /** Emitted as `data-size` only when provided. React defaults to `"md"`, so it is always present there. */
  size?: IconSize | undefined;
  /**
   * The accessible name. `undefined`/`null` → decorative (`aria-hidden`). Any string, INCLUDING the
   * empty string, → content (`role="img"` + `aria-label`), matching an authored `data-sk-icon-label=""`.
   */
  label?: string | null | undefined;
  /** Extra classes beyond `sk-icon`, already joined. `sk-icon` is always present and always first. */
  className?: string | undefined;
};

/** The resolved box: two ordered attribute groups (set-owned, then box-owned) and the inner geometry. */
export type IconBox = {
  presentation: [string, string][];
  box: [string, string][];
  body: string;
};

/** The attributes the box owns outright, a set that names one of these in `attrs` is ignored. */
const BOX_OWNED = new Set([
  "class",
  "viewbox",
  "data-icon",
  "data-size",
  "aria-hidden",
  "aria-label",
  "role",
  "focusable",
]);

export function renderIconBox({ icon, dataIcon, size, label, className }: RenderIconBoxInput): IconBox {
  const presentation = Object.entries(icon.attrs ?? {}).filter(([k]) => !BOX_OWNED.has(k.toLowerCase()));

  const box: [string, string][] = [];
  if (dataIcon !== undefined) box.push(["data-icon", dataIcon]);
  box.push(["class", className ? `sk-icon ${className}` : "sk-icon"]);
  if (size) box.push(["data-size", size]);
  // the viewBox is where the geometry was drawn, taken from the set as-is, never a rendered size, and
  // never `0 0 w h` (Material draws in "0 -960 960 960").
  box.push(["viewBox", icon.viewBox]);
  // a label makes the icon content; without one it is decorative. A control with text already names the
  // action, so decorative is the right default.
  if (label !== undefined && label !== null) {
    box.push(["role", "img"], ["aria-label", label]);
  } else {
    box.push(["aria-hidden", "true"]);
  }
  // an svg is not a tab stop; historic IE/Edge made it one and this is still the cure.
  box.push(["focusable", "false"]);

  return { presentation, box, body: icon.body };
}

/*
 * The contract. An icon is the clearest case of the two bindings meeting at different depths:
 * React renders the `<svg>` itself, while authored markup writes a PLACEHOLDER; `<span
 * data-sk-icon="delete">`; the enhancer replaces with the real element once a set is bound.
 *
 * They converge because both go through `renderIconBox` above: the same box attributes, the same
 * viewBox from the set, the same decorative-by-default accessibility. The placeholder is not a
 * lesser form, it is the only form authored markup can take; the system ships no geometry
 * (decision 15), so the drawing cannot exist until a set is chosen.
 *
 * `name` is a stable icon name, a ROLE the system names: `delete`, never `trash`.
 */
export const iconContract = {
  id: "icon",
  category: "content",
  css: "@skryensya/core/patterns/icon.css",
  parts: { root: "sk-icon" },
  hooks: [
    "--sk-icon-size",
  ],

  options: {
    /**
     * The stable name: a ROLE the system names, never the drawing. Constrained to the vocabulary
     * itself, so a name no set is obliged to draw fails validation instead of crashing at mount;
     * which is what `inbox` did the first time this contract was exercised.
     */
    /* A role or a brand logo; a logo draws only where the set was bound with its brands. */
    name: { type: "enum", values: [...stableIconNames, ...brandIconNames], attr: "data-sk-icon" },
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-sk-icon-size" },
    /**
     * The accessible name. Absent means decorative, which is the right default: a control with a
     * visible label already names itself, and a second name is noise.
     */
    label: { type: "string", attr: "data-sk-icon-label" },
  },

  signatures: {
    Icon: {
      intent: ["icon", "glyph", "pictogram", "decorative-mark"],
      host: { element: "span" },
      options: ["name", "size", "label"],
      requires: ["name"],
      slots: {},
      /*
       * The placeholder carries no part class: the class belongs to the `<svg>` the binding writes,
       * and a set never controls the class, the size or the accessibility (decision 15).
       */
      template: { element: "span", host: true },
      react: { from: "@skryensya/react/icon", name: "Icon" },
    },
  },
} as const satisfies ComponentContract;
