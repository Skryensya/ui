# icon

Category: content. Stylesheet: `@skryensya/core/patterns/icon.css`. Signatures: `Icon`.

## Icon

**Use when**

- it reinforces an action that already has text; without a label, decorative
- it is the only content of a square control, and then the CONTROL carries the accessible name, not the icon
- the name is a role the system names: delete, visibility, chevron-down

**Avoid when**

- it is a product concept (an invoice, an airplane): that is passed as icon data in the React binding, not as a stable name
- it would get a label inside a button that already has text; the accessible name would be duplicated
- a button-shaped control is needed: that is Button (iconOnly) or StateButton, not an Icon alone

Alternatives: `Button.action`, `StateButton`.

- React: `import { Icon } from "@skryensya/react/icon"`.
- HTML: a `<span>`, no JavaScript needed.

- Requires the options: `name`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | "chevron-up" \| "chevron-down" \| "chevron-left" \| "chevron-right" \| "arrow-up" \| "arrow-down" \| "arrow-left" \| "arrow-right" \| "vote-up" \| "vote-down" \| "like" \| "dislike" \| "favorite" \| "external-link" \| "add" \| "remove" \| "close" \| "check" \| "search" \| "edit" \| "delete" \| "copy" \| "code" \| "filter" \| "refresh" \| "zoom-out" \| "zoom-in" \| "expand-all" \| "collapse-all" \| "fit" \| "minimize" \| "maximize" \| "restore" \| "more" \| "menu" \| "info" \| "success" \| "warning" \| "danger" \| "placeholder" \| "play" \| "pause" \| "volume" \| "volume-muted" \| "captions" \| "fullscreen" \| "fullscreen-exit" \| "replay" \| "track-previous" \| "track-next" \| "calendar" \| "clock" \| "upload" \| "download" \| "file" \| "file-text" \| "folder" \| "folder-open" \| "home" \| "settings" \| "user" \| "visibility" \| "visibility-off" \| "mask" \| "language" \| "appearance" \| "mode-system" \| "mode-light" \| "mode-dark" \| "screen-desktop" \| "screen-tablet" \| "screen-mobile" \| "component-accordion" \| "component-app-shell" \| "component-annotation" \| "component-diagram" \| "component-avatar" \| "component-expressive-avatar" \| "component-back-to-top" \| "component-badge" \| "component-box" \| "component-breadcrumb" \| "component-button" \| "component-callout" \| "component-card" \| "component-canvas" \| "component-carousel" \| "component-changelog" \| "component-checkbox" \| "component-clipboard" \| "component-listbox" \| "component-color-picker" \| "component-combobox" \| "component-comment-thread" \| "component-data-grid" \| "component-date-picker" \| "component-comparison-table" \| "component-description-list" \| "component-dialog" \| "component-dialog-stack" \| "component-drawer" \| "component-empty-state" \| "component-fade-edge" \| "component-feed" \| "component-drop-zone" \| "component-footer" \| "component-form-field" \| "component-grid" \| "component-heading" \| "component-hero" \| "component-icon" \| "component-image-frame" \| "component-media-overlay" \| "component-morph-stack" \| "component-lightbox" \| "component-inline" \| "component-input" \| "component-kbd" \| "component-layout-grid" \| "component-link" \| "component-list" \| "component-loader" \| "component-marquee" \| "component-megamenu" \| "component-menu" \| "component-app-bar" \| "component-menubar" \| "component-message" \| "component-meter" \| "component-navbar" \| "component-number-field" \| "component-pagination" \| "component-placeholder" \| "component-password-input" \| "component-search-field" \| "component-otp-input" \| "component-popover" \| "component-presence" \| "component-procedure" \| "component-timeline" \| "component-progress" \| "component-qr-code" \| "component-quote" \| "component-questionnaire" \| "component-radio-group" \| "component-rating" \| "component-segmented" \| "component-select" \| "component-resizable" \| "component-compare-slider" \| "component-magnifier" \| "component-gallery" \| "component-video-player" \| "component-audio-player" \| "component-scroll-expand" \| "component-scroll-stack" \| "component-separator" \| "component-sidebar" \| "component-skip-link" \| "component-slider" \| "component-button-group" \| "component-stack" \| "component-stat" \| "component-state-button" \| "component-steps" \| "component-switch" \| "component-table" \| "component-table-pager" \| "component-tags-input" \| "component-tabs" \| "component-tag" \| "component-text" \| "component-tile-link" \| "component-tile-checkbox" \| "component-tile-switch" \| "component-tile-radio-group" \| "component-expandable-tile" \| "component-tile-button" \| "component-toast" \| "component-toc" \| "component-toolbar" \| "component-tooltip" \| "component-tour" \| "component-tree-view" \| "component-treegrid" \| "component-user-select" \| "component-window" \| "component-wrapper" \| "component-hotkey" \| "component-scrollbar" \| "component-vaul" \| "brand-github" \| "brand-gitlab" \| "brand-x" \| "brand-facebook" \| "brand-instagram" \| "brand-linkedin" \| "brand-youtube" \| "brand-tiktok" \| "brand-discord" \| "brand-whatsapp" \| "brand-telegram" \| "brand-reddit" \| "brand-threads" \| "brand-bluesky" \| "brand-mastodon" \| "brand-figma" \| "brand-slack" \| "brand-google" \| "brand-apple" \| "brand-twitch" \| "brand-pinterest" \| "brand-dribbble" \| "brand-spotify" \| "brand-medium" |  |
| `size` | "sm" \| "md" \| "lg" | `"md"` |
| `label` | string |  |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-icon-size`.
