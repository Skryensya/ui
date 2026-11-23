# media-overlay

Category: content. Stylesheet: `@skryensya/core/patterns/media-overlay.css`. Signatures: `MediaOverlay`, `MediaOverlayShade`.

## MediaOverlay

**Use when**

- the text overlaps the photo or image instead of sitting below it: a title or headline over a cover image
- the wash should be as tall as the text, not a percentage of the image

**Avoid when**

- the text can go below the image; it reads better there and needs no wash
- it is a descriptive photo caption; that is a `<figcaption>` outside the frame

Alternatives: `ImageFrame`.

- React: `import { MediaOverlay } from "@skryensya/react/media-overlay"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `ImageFrame`.

**Options**

| Option | Values | Default |
|---|---|---|
| `edge` | "top" \| "bottom" \| "start" \| "end" | `"bottom"` |
| `captionElement` (React: `as`) | "div" \| "figcaption" | `"div"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## MediaOverlayShade

**Use when**

- there is text over a photo or image and it needs contrast to be read

**Avoid when**

- it is outside a MediaOverlay; it has no box to fill and paints nothing
- it darkens a dialog over the page; that is Dialog's ::backdrop, not this wash

Alternatives: `Dialog`, `FadeEdge`.

- React: `import { MediaOverlayShade } from "@skryensya/react/media-overlay"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `MediaOverlay`.

**Options**

| Option | Values | Default |
|---|---|---|
| `strength` | "subtle" \| "moderate" \| "strong" | `"moderate"` |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-media-overlay-fg`, `--sk-media-overlay-gap`, `--sk-media-overlay-padding`, `--sk-media-overlay-shade-base`, `--sk-media-overlay-shade-direction`, `--sk-media-overlay-shade-ink`, `--sk-media-overlay-shade-ink-mid`, `--sk-media-overlay-shade-mix`, `--sk-media-overlay-shade-opacity`, `--sk-media-overlay-shade-tint`, `--sk-media-overlay-shade-tint-edge`, `--sk-media-overlay-shade-tint-mid`.
