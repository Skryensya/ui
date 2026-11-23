# scroll-hint

Category: layout. Stylesheet: `@skryensya/core/components/scroll-hint.css`. Signatures: `ScrollHint`.

## ScrollHint

**Use when**

- a scrollable region needs a one-time directional invitation before the person discovers scrolling
- an animated visual cue should disappear after actual scrolling in the indicated axis

**Avoid when**

- the content fits without scrolling
- a persistent scroll-position indicator or navigation button is needed
- the hint would cover content or replace the region's accessible name and keyboard support

Alternatives: `FadeEdge`, `BackToTop`.

- React: `import { ScrollHint } from "@skryensya/react/scroll-hint"`.
- HTML: a `<div>` with `data-sk-scroll-hint`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `axis` | "horizontal" \| "vertical" | `"vertical"` |
| `scroller` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `scroll-hint/default`; its copy is placeholder, replace it)

```tsx
import { ScrollHint } from "@skryensya/react/scroll-hint";

export function ScrollHintExample() {
  return <ScrollHint axis="vertical">Desliza para ver más</ScrollHint>;
}
```

```html
<div
  class="sk-scroll-hint"
  data-sk-scroll-hint
  data-axis="vertical"
  hidden
>
  <span class="sk-scroll-hint__indicator" aria-hidden="true">
    <span class="sk-scroll-hint__mark"></span>
  </span>
  <span class="sk-scroll-hint__label">Desliza para ver más</span>
</div>
```

Stylesheets: `@skryensya/core/components/scroll-hint.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-scroll-hint-fg`, `--sk-scroll-hint-gap`, `--sk-scroll-hint-size`, `--sk-scroll-hint-travel`.
