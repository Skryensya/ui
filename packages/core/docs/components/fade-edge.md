# fade-edge

Category: layout. Stylesheet: `@skryensya/core/components/fade-edge.css`. Signatures: `FadeEdge`.

## FadeEdge

**Use when**

- a clipped edge needs to show visually that the content continues, or enters and leaves the surface
- the effect has to wrap another component without changing its semantics, focus or behaviour

**Avoid when**

- the content is not clipped; fading it only lowers contrast
- the gradient protects text over a photo; that is MediaOverlayShade inside MediaOverlay
- the fade would hide a control or information needed at rest
- the clipped edge is a Marquee's viewport; Marquee already has its own inner fade, and a FadeEdge around it also washes out the Play/Pause

Alternatives: `MediaOverlayShade`, `Marquee`.

- React: `import { FadeEdge } from "@skryensya/react/fade-edge"`.
- HTML: a `<div>` with `data-sk-fade-edge`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `mode` | "transparent" \| "color" | `"transparent"` |
| `direction` | "to-bottom" \| "to-top" \| "to-right" \| "to-left" \| "horizontal" \| "vertical" | `"to-bottom"` |
| `scrollAware` | boolean | `false` |
| `size` | string |  |
| `color` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `fade-edge/inline`; its copy is placeholder, replace it)

```tsx
import { FadeEdge } from "@skryensya/react/fade-edge";
import { Text } from "@skryensya/react/typography";
import { type CSSProperties } from "react";

export function FadeEdgeExample() {
  return (
    <FadeEdge
      direction="to-right"
      size="4rem"
      style={{ "--sk-fade-edge-size": "4rem" } as CSSProperties}
    >
      <Text>Un texto que se desvanece en el borde</Text>
    </FadeEdge>
  );
}
```

```html
<div
  class="sk-fade-edge"
  data-sk-fade-edge
  data-fade="transparent"
  data-direction="to-right"
  style="--sk-fade-edge-size: 4rem;"
>
  <p
    class="sk-text"
    data-tone="primary"
    data-size="body"
    data-weight="body"
  >
    Un texto que se desvanece en el borde
  </p>
</div>
```

Stylesheets: `@skryensya/core/components/fade-edge.css`, `@skryensya/core/components/typography.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-fade-edge-color`, `--sk-fade-edge-gutter-block`, `--sk-fade-edge-gutter-inline`, `--sk-fade-edge-axis`, `--sk-fade-edge-mask-far`, `--sk-fade-edge-mask-near`, `--sk-fade-edge-mask-ramp`, `--sk-fade-edge-ramp-far`, `--sk-fade-edge-ramp-near`, `--sk-fade-edge-ramp`, `--sk-fade-edge-size`.
