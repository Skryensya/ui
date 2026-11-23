# loader

Category: feedback. Stylesheet: `@skryensya/core/components/loader.css`. Signatures: `Loader`, `Loader.status`.

## Loader

**Use when**

- there is a wait of unknown length
- with a label, it IS the announced state; without one, it accompanies text that already says it

**Avoid when**

- the progress is known; that is a Progress with its value
- the content has a shape and can be prefigured; that is a Placeholder

Alternatives: `Placeholder`, `Progress`, `Loader.status`.

- React: `import { Loader } from "@skryensya/react/loader"`.
- HTML: a `<span>` with `data-sk-loader`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `size` | "sm" \| "md" \| "lg" | `"md"` |
| `variant` | "ring" \| "sweep" \| "bars" \| "dots" \| "arc" \| "comet" \| "orbit" \| "clock" \| "spokes" \| "ticks" \| "compass" \| "beads" | `"ring"` |
| `speed` | "fast" \| "normal" \| "slow" | `"normal"` |
| `label` | string |  |

**Example** (canonical tree `loader/labelled`; its copy is placeholder, replace it)

```tsx
import { Loader } from "@skryensya/react/loader";

export function LoaderExample() {
  return <Loader variant="dots" label="Cargando resultados" />;
}
```

```html
<span
  class="sk-loader"
  data-sk-loader
  data-size="md"
  data-variant="dots"
  data-speed="normal"
  aria-label="Cargando resultados"
  role="status"
  aria-atomic="true"
></span>
```

Stylesheets: `@skryensya/core/components/loader.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Loader.status

**Use when**

- the wait is already visible (there are skeletons, or a bar) and it still needs announcing
- the loading state has to exist for a screen reader without drawing anything

**Avoid when**

- nothing else shows the wait; then a visible Loader is needed
- the progress is measurable; that is a Progress, which already announces itself

Alternatives: `Loader`, `Progress`, `Placeholder`.

- React: `import { LoaderStatus } from "@skryensya/react/loader"`.
- HTML: a `<span>`, no JavaScript needed.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |

**Example** (canonical tree `loader/status-only`; its copy is placeholder, replace it)

```tsx
import { LoaderStatus } from "@skryensya/react/loader";

export function LoaderStatusExample() {
  return <LoaderStatus label="Cargando el catálogo" />;
}
```

```html
<span
  class="sk-visually-hidden"
  aria-label="Cargando el catálogo"
  role="status"
  aria-atomic="true"
></span>
```

Stylesheets: `@skryensya/core/components/loader.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-loader-cycle`, `--sk-loader-duration`, `--sk-loader-easing`, `--sk-loader-oscillation-easing`, `--sk-loader-size`, `--sk-loader-step`, `--sk-loader-stroke-width`, `--sk-loader-tempo`, `--sk-loader-tick-angle`, `--sk-loader-tick-count`, `--sk-loader-track-color`.
