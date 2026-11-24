# gallery

Category: content. Stylesheet: `@skryensya/core/components/gallery.css`. Signatures: `Gallery`.

## Gallery

**Use when**

- one thing is shown in several photos and the reader picks which to see large: a product's shots, a project's screens
- the large photo should stay in its place on the page while the thumbnails change it, with a Magnifier on it for detail

**Avoid when**

- the photos should open large over the page, one after another, with zoom; that is a Lightbox with its triggers
- there are more photos than fit in a row, or they should be browsed by swiping; that is a Carousel
- the thumbnails name panels of different content, text or forms; that is Tabs

Alternatives: `Lightbox`, `Carousel`, `Tabs`.

- React: `import { Gallery } from "@skryensya/react/gallery"`.
- HTML: a `<div>`, no JavaScript needed.

- Requires the options: `name`, `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` (React: `defaultValue`) | string |  |
| `name` | string |  |
| `label` | string |  |
| `placement` | "bottom" \| "top" \| "start" \| "end" | `"bottom"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `items`) | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `value` (string), `view` (node, required), `thumb` (node, required).

**Example** (canonical tree `gallery/photos`; its copy is placeholder, replace it)

```tsx
import { Gallery } from "@skryensya/react/gallery";
import { items } from "./gallery-items";

export function GalleryExample() {
  return (
    <Gallery
      defaultValue="tarde"
      name="canonical-gallery"
      label="Fotos de la plaza"
      items={items}
    />
  );
}
```

`gallery-items.ts`:

```ts
export const items = [
  { value: "manana" },
  { value: "tarde" },
  { value: "noche" },
];
```

```html
<div class="sk-gallery" data-default-value="tarde" data-placement="bottom">
  <div class="sk-gallery__views">
    <div class="sk-gallery__view">
      <div
        class="sk-image-frame"
        data-appearance="plain"
        data-aspect="16/9"
        data-fit="cover"
        data-position="center"
        data-radius="surface"
        data-border="none"
      >
        <img
          class="sk-image-frame__media"
          src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
          alt="La plaza por la mañana"
        >
      </div>
    </div>
    <div class="sk-gallery__view">
      <div
        class="sk-image-frame"
        data-appearance="plain"
        data-aspect="16/9"
        data-fit="cover"
        data-position="center"
        data-radius="surface"
        data-border="none"
      >
        <img
          class="sk-image-frame__media"
          src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
          alt="La plaza al atardecer"
        >
      </div>
    </div>
    <div class="sk-gallery__view">
      <div
        class="sk-image-frame"
        data-appearance="plain"
        data-aspect="16/9"
        data-fit="cover"
        data-position="center"
        data-radius="surface"
        data-border="none"
      >
        <img
          class="sk-image-frame__media"
          src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
          alt="La plaza de noche"
        >
      </div>
    </div>
  </div>
  <div
    class="sk-gallery__thumbs"
    aria-label="Fotos de la plaza"
    role="radiogroup"
  >
    <label class="sk-gallery__thumb sk-interactive">
      <input
        class="sk-gallery__thumb-input"
        name="canonical-gallery"
        value="manana"
        type="radio"
      >
      <span class="sk-gallery__thumb-face">
        <span
          class="sk-image-frame"
          data-appearance="plain"
          data-aspect="1/1"
          data-fit="cover"
          data-position="center"
          data-radius="control"
          data-border="none"
        >
          <img
            class="sk-image-frame__media"
            src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
            alt="Miniatura: La plaza por la mañana"
          >
        </span>
      </span>
    </label>
    <label class="sk-gallery__thumb sk-interactive">
      <input
        class="sk-gallery__thumb-input"
        name="canonical-gallery"
        checked
        value="tarde"
        type="radio"
      >
      <span class="sk-gallery__thumb-face">
        <span
          class="sk-image-frame"
          data-appearance="plain"
          data-aspect="1/1"
          data-fit="cover"
          data-position="center"
          data-radius="control"
          data-border="none"
        >
          <img
            class="sk-image-frame__media"
            src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
            alt="Miniatura: La plaza al atardecer"
          >
        </span>
      </span>
    </label>
    <label class="sk-gallery__thumb sk-interactive">
      <input
        class="sk-gallery__thumb-input"
        name="canonical-gallery"
        value="noche"
        type="radio"
      >
      <span class="sk-gallery__thumb-face">
        <span
          class="sk-image-frame"
          data-appearance="plain"
          data-aspect="1/1"
          data-fit="cover"
          data-position="center"
          data-radius="control"
          data-border="none"
        >
          <img
            class="sk-image-frame__media"
            src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
            alt="Miniatura: La plaza de noche"
          >
        </span>
      </span>
    </label>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/gallery.css`, `@skryensya/core/patterns/image-frame.css`, `@skryensya/core/patterns/media-overlay.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-gallery-gap`, `--sk-gallery-thumb-gap`, `--sk-gallery-thumb-min`, `--sk-gallery-thumb-radius`, `--sk-gallery-thumb-idle-opacity`, `--sk-gallery-thumb-border`, `--sk-gallery-thumb-selected-border`, `--sk-gallery-thumb-selected-width`, `--sk-gallery-rail-size`.
