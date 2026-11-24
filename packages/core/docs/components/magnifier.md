# magnifier

Category: content. Stylesheet: `@skryensya/core/components/magnifier.css`. Signatures: `Magnifier`.

## Magnifier

**Use when**

- a picture has detail too small to read at its size on the page, and the reader should look closer without leaving it: a product photo, a map, a diagram, a frame of video
- looking closer should follow where the reader points, rather than open the picture somewhere else

**Avoid when**

- the content is text or markup rather than an image, video or canvas; the lens reads pixels, so it cannot see markup; let the browser zoom or give the text more room
- the reader needs the whole picture large, or on touch first; open it in a Lightbox instead of moving a small lens over it
- the picture is a playing video; it moves on its own and carries the detail away from under the lens, and the lens covers the player's controls; pause and show the frame as an image to look at it up close

Alternatives: `Lightbox`, `ImageFrame`.

- React: `import { Magnifier } from "@skryensya/react/magnifier"`.
- HTML: a `<div>` with `data-sk-magnifier`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `zoom` | number | `2` |
| `dispersion` | "subtle" \| "strong" | `"subtle"` |
| `filter` | "none" \| "red" \| "green" \| "blue" \| "cyan" \| "magenta" \| "yellow" | `"none"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `magnifier/image-frame`; its copy is placeholder, replace it)

```tsx
import { ImageFrame } from "@skryensya/react/image-frame";
import { Magnifier } from "@skryensya/react/magnifier";

export function MagnifierExample() {
  return (
    <Magnifier zoom={3}>
      <ImageFrame
        aspect="16/9"
        src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
        alt="La plaza al atardecer"
      />
    </Magnifier>
  );
}
```

```html
<div
  class="sk-magnifier"
  data-sk-magnifier
  data-zoom="3"
  data-dispersion="subtle"
  data-filter="none"
>
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
  <canvas class="sk-magnifier__lens" aria-hidden="true"></canvas>
</div>
```

Stylesheets: `@skryensya/core/components/magnifier.css`, `@skryensya/core/patterns/image-frame.css`, `@skryensya/core/patterns/media-overlay.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-magnifier-bg`, `--sk-magnifier-lens-shadow`, `--sk-magnifier-size`.
