import { definePreference, oneOf } from "@skryensya/core/storage";

export type ComponentPreviewBinding = "vanilla" | "react";
export type ComponentPreviewSource = "html" | "js";
export type ComponentPreviewViewport = "auto" | "menu" | "overlay";

/**
 * How big the stage pretends to be.
 *
 * `free` is the stage as it has always been: full width, height fitted to the content. The
 * presets give the frame a chosen inline size so media queries inside the iframe resolve against
 * that viewport, not the docs column.
 *
 * Distinct from {@link ComponentPreviewViewport}, which reserves stage headroom for things painted
 * out of flow (menus, dialogs). That one answers "how much room does this demo need"; this one
 * answers "what screen is the reader pretending to hold".
 *
 * The small presets sit deliberately on either side of the system's own breakpoints (`compact`
 * 36rem, `desktop` 52rem): mobile is below both, tablet is between them. `xl` sits above both
 * (and above the 72rem layout-grid band): a large desktop, shown zoomed out so the 1440 px
 * viewport still fits the docs column.
 */
export type ComponentPreviewScreen = "free" | "xl" | "tablet" | "mobile";

/*
 * THE DOCS' OWN PREVIEW STAGE, not a component of the kit: the isolated iframe a live demo renders
 * in, its lifecycle and the shared preferences around it. It lived in core as `ComponentPreview`
 * until the pages moved to `UsagePreview`; what is left is this site's apparatus.
 */

/**
 * Stable anatomy for a rendered component demo followed by its implementation source.
 *
 * The docs own the surface and authored DOM. The stage may be an iframe with an inline
 * `srcdoc`; the opt-in Vanilla enhancer only switches authored binding and source panels.
 *
 * Binding preference is shared across every preview on the page: one Vanilla | React choice.
 */
export const componentPreviewParts = {
  root: "sk-component-preview",
  header: "sk-component-preview__header",
  title: "sk-component-preview__title",
  note: "sk-component-preview__note",
  actions: "sk-component-preview__actions",
  reload: "sk-component-preview__reload",
  bindingTabs: "sk-component-preview__binding-tabs",
  screenTabs: "sk-component-preview__screen-tabs",
  stage: "sk-component-preview__stage",
  resizer: "sk-component-preview__resizer",
  loading: "sk-component-preview__loading",
  frameBody: "sk-component-preview__frame-body",
  binding: "sk-component-preview__binding",
  sourceTabs: "sk-component-preview__source-tabs",
  code: "sk-component-preview__code",
} as const;

export type ComponentPreviewPart = keyof typeof componentPreviewParts;
export type ComponentPreviewPartClass = (typeof componentPreviewParts)[ComponentPreviewPart];

/** Data attributes consumed by the opt-in Vanilla enhancer. */
export const componentPreviewAttrs = {
  root: "data-sk-component-preview",
  bindingTabs: "data-sk-component-preview-binding-tabs",
  /** One of the two plain buttons inside `bindingTabs`; its `data-value` is "vanilla" | "react". */
  bindingOption: "data-sk-component-preview-binding-option",
  /** The group wrapping the screen-preset buttons; carries the current `data-value`. */
  screenTabs: "data-sk-component-preview-screen-tabs",
  /** One of the buttons inside `screenTabs`; its `data-value` is "free" | "xl" | "tablet" | "mobile". */
  screenOption: "data-sk-component-preview-screen-option",
  binding: "data-sk-component-preview-binding",
  /** Document-level shared Vanilla | React preference (`<html>`). */
  documentBinding: "data-sk-component-preview-pref",
  /**
   * Document-level shared screen preset (`<html>`), the same shape as `documentBinding`.
   *
   * Shared for the same reason the binding is: the reader is asking one question of the PAGE
   * ("how does this hold up on a phone"), not of one demo, and answering it per preview would mean
   * setting it again on every example they scroll past. Absent means `free`.
   */
  documentScreen: "data-sk-component-preview-screen-pref",
  /**
   * On the root: this preview's screen preset is its OWN, not the page's shared one. It never reads
   * or writes {@link componentPreviewAttrs.documentScreen}, so a pattern that only makes sense
   * starting from a phone (Vaul, say) can open there without seeding that as every OTHER preview's
   * default for a first-time reader who happens to land here first.
   */
  screenLocal: "data-sk-component-preview-screen-local",
  /**
   * A `sk-tabs` group of file panels (HTML/CSS/TS, or Componente/data). One shared
   * "Ver código"/"Ocultar código" control sits above its tab strip as a DIRECT CHILD  -  plain
   * `@skryensya/core/code-preview` markup (`codePreviewParts.more`/`toggle`/`toggleIcon`,
   * `codePreviewAttrs.toggle`/`toggleLabel`/`expandedLabel`), not a parallel vocabulary of this
   * component's own: every file's own per-panel toggle stays hidden (component-preview.css), and
   * `connectSourceToggle` (`@skryensya/vanilla/component-preview`) finds the shared one purely by
   * that DIRECT-CHILD position (`:scope > .sk-code-preview__more`, never nested under
   * `.sk-tabs__content` the way a per-file one is) and forwards its click to every panel's own
   * toggle in one pass. Reusing the identical attributes is what makes the control read as the
   * SAME one whether a page has one file or several, Vanilla or React.
   */
  sourceTabs: "data-sk-component-preview-source-tabs",
  source: "data-sk-component-preview-source",
  flush: "data-sk-component-preview-flush",
  frameReady: "data-sk-component-preview-frame-ready",
  frameError: "data-sk-component-preview-frame-error",
  /**
   * The Vanilla stage's authored document, held inert until the enhancer promotes it to `srcdoc`.
   * `loading="lazy"` on the `<iframe>` does nothing for `srcdoc` content - that HTML is already
   * inline in the page, so the parser starts fetching whatever it references (the frame runtime, its
   * own module graph) the moment it is parsed, on every preview on the page, regardless of scroll
   * position. Authoring the document here instead, and promoting it only once
   * {@link componentPreviewParts.stage} enters the shared `IntersectionObserver`'s band (the same one
   * `releaseComponentPreviewStages`/`restoreComponentPreviewStages` already use), is what actually
   * defers it.
   */
  doc: "data-sk-component-preview-doc",
  viewport: "data-sk-component-preview-viewport",
  scroll: "data-sk-component-preview-scroll",
  reload: "data-sk-component-preview-reload",
  /**
   * On the stage, and only for a preset: `free` is the absence of the attribute, not a value, so
   * every rule that reserves, fits or scrolls keeps working unchanged when no preset is chosen.
   * A preset owns both axes, so the frame runtime stops auto-fitting and scrolls its own document
   * exactly as it does for a reader-dragged height.
   */
  screen: "data-sk-component-preview-screen",
  /** The drag handle on the stage's bottom edge. */
  resizer: "data-sk-component-preview-resizer",
  /**
   * On the stage: its height is the reader's, not the content's. The frame runtime stops
   * auto-fitting and starts scrolling; removing it restores the content fit.
   */
  resized: "data-sk-component-preview-resized",
  /** On the root while a drag is in flight, so the stage stops swallowing the pointer. */
  resizing: "data-sk-component-preview-resizing",
} as const;

export type ComponentPreviewAttr = keyof typeof componentPreviewAttrs;
export type ComponentPreviewAttrName = (typeof componentPreviewAttrs)[ComponentPreviewAttr];

/** Bubbles on `document` when the shared binding preference changes. */
export const componentPreviewBindingChangeEvent = "sk:componentpreviewbindingchange";

/** Bubbles on `document` when the shared screen preset changes. */
export const componentPreviewScreenChangeEvent = "sk:componentpreviewscreenchange";

/**
 * The two shared preferences, declared where their types live.
 *
 * Both are DOCUMENTATION-surface preferences, declared once here so the slot name and its guard
 * are never re-typed in the scripts that read them.
 */
export const componentPreviewBindingPreference = definePreference<ComponentPreviewBinding>({
  slot: "binding",
  fallback: "vanilla",
  parse: oneOf(["vanilla", "react"]),
});

export const componentPreviewScreenPreference = definePreference<ComponentPreviewScreen>({
  slot: "screen",
  fallback: "free",
  parse: oneOf(["free", "xl", "tablet", "mobile"]),
});
