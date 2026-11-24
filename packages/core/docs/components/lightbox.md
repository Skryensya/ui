# lightbox

Category: overlays. Stylesheet: `@skryensya/core/components/lightbox.css`. Signatures: `Lightbox`, `Lightbox.Trigger`.

## Lightbox

**Use when**

- photos are shown as thumbnails and the reader needs to see them large, one at a time, without leaving the page: a gallery, a product's photos, a report's screenshots
- the image has detail only readable up close (a plan, a screenshot with small text, a product photo): the viewer brings zoom by buttons and keyboard, and by pinch and double tap on touch
- an image has to open from code, with no thumbnail on the page: the handle opens, closes and navigates with the same focus and scroll-lock cycle as a click
- a long gallery: only the current image and its two neighbours load, never the whole gallery

**Avoid when**

- the image reads fine at its size on the page: enlarging it adds a step nobody asked for; that is ImageFrame
- what should be shown large is not an image but a diagram or a drawing to explore inside the page: that is Canvas, which does not cover the page
- the modal's content is text, a form or actions: that is Dialog; a Lightbox has no body beyond the image and its caption
- the images have to be browsed on the page itself, several in view: that is Carousel

Alternatives: `ImageFrame`, `Canvas`, `Dialog`, `Carousel`.

- React: `import { Lightbox } from "@skryensya/react/lightbox"`.
- HTML: a `<dialog>` with `data-sk-lightbox`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `lightboxId` (React: `id`) | string |  |
| `label` | string | `"Image viewer"` |
| `closeLabel` | string | `"Close"` |
| `previousLabel` | string | `"Previous image"` |
| `nextLabel` | string | `"Next image"` |
| `zoomInLabel` | string | `"Zoom in"` |
| `zoomOutLabel` | string | `"Zoom out"` |
| `resetZoomLabel` | string | `"Reset zoom"` |
| `magnifierLabel` | string | `"Magnifier"` |
| `magnifier` | boolean | `false` |
| `errorLabel` | string | `"This image could not be loaded."` |
| `counterLabel` | string | `"Image {index} of {count}"` |
| `loop` | boolean | `false` |
| `zoom` | boolean | `true` |
| `maxZoom` | number | `4` |
| `counter` (React: `showCounter`) | boolean | `true` |
| `caption` (React: `showCaption`) | boolean | `true` |
| `closeOnBackdrop` (React: `closeOnBackdropClick`) | boolean | `true` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `video` | node |  |

## Lightbox.Trigger

**Use when**

- a thumbnail on the page has to open its image in a Lightbox: the link points at the full image, so it still opens without JavaScript
- several thumbnails form a gallery: they all name the same Lightbox in `opens`, and page order is gallery order

**Avoid when**

- the image opens from a button that is not a thumbnail ("View photos"): that is a Button calling the Lightbox's handle
- the thumbnail has to lead to another page and not to the image: that is a Link

Alternatives: `Button.action`, `Link`.

- React: `import { Lightbox } from "@skryensya/react/lightbox"`, then `<Lightbox.Trigger>`.
- HTML: a `<a>`, no JavaScript needed.

- Requires the options: `opens`, `triggerSrc`.

**Options**

| Option | Values | Default |
|---|---|---|
| `opens` | string |  |
| `triggerSrc` (React: `src`) | string |  |
| `triggerAlt` (React: `alt`) | string |  |
| `triggerTitle` (React: `title`) | string |  |
| `triggerDescription` (React: `description`) | string |  |
| `triggerCredit` (React: `credit`) | string |  |
| `triggerWidth` (React: `width`) | number |  |
| `triggerHeight` (React: `height`) | number |  |
| `triggerThumbnail` (React: `thumbnailSrc`) | string |  |
| `triggerVideo` (React: `video`) | boolean | `false` |
| `triggerVideoLoop` (React: `videoLoop`) | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-lightbox-backdrop-bg`, `--sk-lightbox-bg`, `--sk-lightbox-fg`, `--sk-lightbox-muted-fg`, `--sk-lightbox-control-bg`, `--sk-lightbox-control-border-color`, `--sk-lightbox-caption-bg`, `--sk-lightbox-caption-max-block-size`, `--sk-lightbox-chrome-distance`, `--sk-lightbox-gutter`, `--sk-lightbox-image-radius`, `--sk-lightbox-image-shadow`, `--sk-lightbox-nav-room`, `--sk-lightbox-trigger-radius`.
