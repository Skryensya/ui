# state-button

Category: actions. Stylesheet: `@skryensya/core/components/state-button.css`. Signatures: `StateButton`.

## StateButton

**Use when**

- the control needs to show one of N named states, each with its own icon, and whoever uses it will write the behaviour that decides which one is active (copying, cycling a mode, anything)
- the states vary with the use: there is no fixed set a contract could declare in advance
- it is always icon-only: the faces are glyphs, the host carries data-icon-only out of the box, and the accessible name is aria-label or aria-labelledby on the button (never visible text)
- variant and size are Button's (data-variant / data-size), not options of this contract: ghost + sm is the most common toolbar form

**Avoid when**

- the behaviour already exists ready-made: a color-mode cycle uses the functions of @skryensya/core/theme-toggle, a copy-to-clipboard uses writeClipboard from @skryensya/core/copy-button, on this same primitive: that part should not be reinvented
- there is a single state, or two that read as on/off: that is a Switch or a simple Toggle; declaring a collection of faces for two values is not worth it
- the icon is purely decorative and does not change: that is Icon, without the states anatomy
- a button with a visible label besides the icon is needed: that is Button.action, not this anatomy of stacked faces

Alternatives: `Switch`, `Icon`, `Button.action`.

- React: `import { StateButton } from "@skryensya/react/state-button"`.
- HTML: a `<button>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `current` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `faces` | a list of items (below) | yes |

Each item in `faces`, keyed by `name`: `icon` ("chevron-up" \| "chevron-down" \| "chevron-left" \| "chevron-right" \| "arrow-up" \| "arrow-down" \| "arrow-left" \| "arrow-right" \| "vote-up" \| "vote-down" \| "like" \| "dislike" \| "external-link" \| "add" \| "remove" \| "close" \| "check" \| "search" \| "edit" \| "delete" \| "copy" \| "code" \| "filter" \| "refresh" \| "zoom-out" \| "zoom-in" \| "fit" \| "minimize" \| "maximize" \| "restore" \| "more" \| "menu" \| "info" \| "success" \| "warning" \| "danger" \| "placeholder" \| "play" \| "pause" \| "volume" \| "volume-muted" \| "captions" \| "fullscreen" \| "fullscreen-exit" \| "replay" \| "track-previous" \| "track-next" \| "calendar" \| "clock" \| "upload" \| "download" \| "file" \| "file-text" \| "folder" \| "folder-open" \| "home" \| "settings" \| "user" \| "visibility" \| "visibility-off" \| "mask" \| "language" \| "appearance" \| "mode-system" \| "mode-light" \| "mode-dark" \| "screen-desktop" \| "screen-tablet" \| "screen-mobile" \| "component-accordion" \| "component-app-shell" \| "component-annotation" \| "component-diagram" \| "component-avatar" \| "component-expressive-avatar" \| "component-back-to-top" \| "component-badge" \| "component-box" \| "component-breadcrumb" \| "component-button" \| "component-callout" \| "component-card" \| "component-canvas" \| "component-carousel" \| "component-changelog" \| "component-checkbox" \| "component-clipboard" \| "component-listbox" \| "component-color-picker" \| "component-combobox" \| "component-comment-thread" \| "component-data-grid" \| "component-date-picker" \| "component-comparison-table" \| "component-description-list" \| "component-dialog" \| "component-dialog-stack" \| "component-drawer" \| "component-empty-state" \| "component-fade-edge" \| "component-feed" \| "component-drop-zone" \| "component-footer" \| "component-form-field" \| "component-grid" \| "component-heading" \| "component-hero" \| "component-icon" \| "component-image-frame" \| "component-media-overlay" \| "component-morph-stack" \| "component-lightbox" \| "component-inline" \| "component-input" \| "component-kbd" \| "component-layout-grid" \| "component-link" \| "component-list" \| "component-loader" \| "component-marquee" \| "component-megamenu" \| "component-menu" \| "component-app-bar" \| "component-menubar" \| "component-message" \| "component-meter" \| "component-navbar" \| "component-number-field" \| "component-pagination" \| "component-placeholder" \| "component-password-input" \| "component-search-field" \| "component-otp-input" \| "component-popover" \| "component-presence" \| "component-procedure" \| "component-timeline" \| "component-progress" \| "component-qr-code" \| "component-quote" \| "component-questionnaire" \| "component-radio-group" \| "component-rating" \| "component-segmented" \| "component-select" \| "component-resizable" \| "component-compare-slider" \| "component-video-player" \| "component-audio-player" \| "component-scroll-expand" \| "component-scroll-stack" \| "component-separator" \| "component-sidebar" \| "component-skip-link" \| "component-slider" \| "component-button-group" \| "component-stack" \| "component-stat" \| "component-state-button" \| "component-steps" \| "component-switch" \| "component-table" \| "component-table-pager" \| "component-tags-input" \| "component-tabs" \| "component-tag" \| "component-text" \| "component-tile-link" \| "component-tile-checkbox" \| "component-tile-switch" \| "component-tile-radio-group" \| "component-expandable-tile" \| "component-tile-button" \| "component-toast" \| "component-toc" \| "component-toolbar" \| "component-tooltip" \| "component-tour" \| "component-tree-view" \| "component-treegrid" \| "component-user-select" \| "component-window" \| "component-wrapper" \| "component-hotkey" \| "component-scrollbar" \| "component-vaul"), `name` (string).

**Accessible name**

- StateButton is always icon-only: faces are glyphs with no visible text, so the host owns the accessible name. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `state-button/copy-idle`; its copy is placeholder, replace it)

```tsx
import { StateButton } from "@skryensya/react/state-button";
import { faces } from "./state-button-faces";

export function StateButtonExample() {
  return <StateButton current="idle" aria-label="Copiar" faces={faces} />;
}
```

`state-button-faces.ts`:

```ts
export const faces = [
  { name: "idle", icon: "copy" },
  { name: "copied", icon: "check" },
];
```

```html
<button
  class="sk-state-button sk-button sk-interactive sk-icon-toggle"
  data-current="idle"
  type="button"
  data-icon-only
  aria-label="Copiar"
>
  <span
    data-active
    data-face="idle"
    data-sk-icon="copy"
    data-sk-icon-size="md"
  ></span>
  <span data-face="copied" data-sk-icon="check" data-sk-icon-size="md"></span>
</button>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/state-button.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-state-button-rest-blur`, `--sk-state-button-rest-scale`, `--sk-state-button-transition-duration`, `--sk-state-button-transition-easing`.
