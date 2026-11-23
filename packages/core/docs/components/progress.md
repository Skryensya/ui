# progress

Category: feedback. Stylesheet: `@skryensya/core/components/progress.css`. Signatures: `Progress`.

## Progress

**Use when**

- how much is left is known: an upload, a multi-step form, a download

**Avoid when**

- the wait is of unknown length; that is a Loader
- it is a MEASUREMENT within a range (disk, battery, rating); that is Meter

Alternatives: `Loader`, `Meter`.

- React: `import { Progress } from "@skryensya/react/progress"`.
- HTML: a `<div>`, no JavaScript needed.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` | number | `0` |
| `max` | number | `100` |
| `tone` | "accent" \| "success" \| "warning" \| "danger" | `"accent"` |
| `label` | string |  |

**Example** (canonical tree `progress/labelled`; its copy is placeholder, replace it)

```tsx
import { Progress } from "@skryensya/react/progress";

export function ProgressExample() {
  return <Progress value={62} label="Subiendo archivo" />;
}
```

```html
<div
  class="sk-progress"
  aria-valuenow="62"
  aria-valuemax="100"
  data-tone="accent"
  aria-label="Subiendo archivo"
  role="progressbar"
  aria-valuemin="0"
  style="--sk-progress-fill: 62%;"
>
  <div class="sk-progress__bar"></div>
</div>
```

Stylesheets: `@skryensya/core/components/progress.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-progress-color`, `--sk-progress-fill`.
