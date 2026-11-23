# image-frame

Category: content. Stylesheet: `@skryensya/core/patterns/image-frame.css`. Signatures: `ImageFrame`.

## ImageFrame

**Use when**

- it crops an image or a video to a fixed aspect ratio
- the photo has to fill a box without distorting
- which part of the image survives the crop has to be decided

**Avoid when**

- it is a person's round identity: that is an Avatar
- there is no media to show, neither src nor authored content; an empty frame is an empty box, not a placeholder
- the content has not loaded yet and a silhouette is needed: that is Placeholder, not an ImageFrame with no src

Alternatives: `Avatar.image`, `Avatar.initials`, `Placeholder`.

- React: `import { ImageFrame } from "@skryensya/react/image-frame"`.
- HTML: a `<div>`, no JavaScript needed.

- Exactly one of: `src`, `children`.

**Options**

| Option | Values | Default |
|---|---|---|
| `aspect` | "auto" \| "1/1" \| "4/3" \| "3/2" \| "16/9" \| "3/4" \| "2/3" \| "9/16" | `"auto"` |
| `fit` | "cover" \| "contain" \| "fill" \| "none" \| "scale-down" | `"cover"` |
| `position` | "center" \| "top" \| "bottom" \| "left" \| "right" \| "top-left" \| "top-right" \| "bottom-left" \| "bottom-right" | `"center"` |
| `radius` | "none" \| "top" \| "control" \| "surface" \| "pill" | `"surface"` |
| `border` | "none" \| "subtle" \| "default" | `"none"` |
| `src` | string |  |
| `alt` | string |  |
| `frameElement` (React: `as`) | "div" \| "figure" | `"div"` |
| `appearance` | "plain" \| "brutalist" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `caption` | one of `MediaOverlay` |  |
| `children` | node |  |

**Accessible name**

- An authored image needs an alt, empty when decorative. The frame never invents one. Give one of: `alt`.

**Example** (canonical tree `image-frame/src`; its copy is placeholder, replace it)

```tsx
import { ImageFrame } from "@skryensya/react/image-frame";

export function ImageFrameExample() {
  return (
    <ImageFrame
      aspect="16/9"
      src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
      alt="La plaza al atardecer"
    />
  );
}
```

```html
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
```

Stylesheets: `@skryensya/core/patterns/image-frame.css`, `@skryensya/core/patterns/media-overlay.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-image-frame-aspect`, `--sk-image-frame-bg`, `--sk-image-frame-border-color`, `--sk-image-frame-border-width`, `--sk-image-frame-fit`, `--sk-image-frame-position`, `--sk-image-frame-radius`.
