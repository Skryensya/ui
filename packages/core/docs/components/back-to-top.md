# back-to-top

Category: navigation. Stylesheet: `@skryensya/core/components/back-to-top.css`. Signatures: `BackToTop`.

## BackToTop

**Use when**

- the page is long and someone who scrolled far wants to get back to the top without dragging the scroll by hand
- it appears on its own past a scroll threshold and leaves on its own back at the top: it takes no corner when it is not needed
- the platform does the scrolling (scrollTo): smooth, unless less motion is asked for, and then instant
- the scroller may not be the document: `scroller` points it at a panel with its own overflow

**Avoid when**

- the whole page fits on one screen: there is nowhere to come back from
- the point is to skip the chrome at the top and reach the content: that is SkipLink, first in focus order and a real anchor
- the destination is a specific section and not the start of the scroller: that is an anchor link in the text, or Toc
- focus always has to travel back up too: give it a `target` with the id of something focusable at the start, or see SkipLink
- scroll position has to be restored between pages: that is the router's job, not a button's

Alternatives: `SkipLink`, `Toc`.

- React: `import { BackToTop } from "@skryensya/react/back-to-top"`.
- HTML: a `<button>` with `data-sk-back-to-top`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `threshold` | number | `400` |
| `scroller` | string |  |
| `target` | string |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `back-to-top/default`; its copy is placeholder, replace it)

```tsx
import { BackToTop } from "@skryensya/react/back-to-top";

export function BackToTopExample() {
  return <BackToTop threshold={0}>Volver arriba</BackToTop>;
}
```

```html
<button
  class="sk-back-to-top sk-button sk-interactive"
  data-sk-back-to-top
  data-appearance="plain"
  data-threshold="0"
  type="button"
  hidden
  data-variant="soft"
>
  <span class="sk-back-to-top__icon" aria-hidden="true">
    <span data-sk-icon="chevron-up" data-sk-icon-size="sm"></span>
  </span>
  <span class="sk-back-to-top__label">Volver arriba</span>
</button>
```

Stylesheets: `@skryensya/core/components/back-to-top.css`, `@skryensya/core/components/button.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-back-to-top-bg`, `--sk-back-to-top-border-color`, `--sk-back-to-top-border-color-hover`, `--sk-back-to-top-brutalist-offset`, `--sk-back-to-top-depth`, `--sk-back-to-top-enter-scale`, `--sk-back-to-top-fg`, `--sk-back-to-top-radius`, `--sk-back-to-top-shadow`, `--sk-back-to-top-size`, `--sk-back-to-top-travel`, `--sk-back-to-top-wash`.
