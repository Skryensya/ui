# meter

Category: data. Stylesheet: `@skryensya/core/components/meter.css`. Signatures: `Meter`.

## Meter

**Use when**

- a MEASUREMENT within a known range has to be shown, with a current value: disk usage, battery level, a rating on a scale

**Avoid when**

- it is the progress of a task that starts at 0 and ends at a known 100%; that is Progress
- the progress has no known length; that is an indeterminate Loader
- a number has to be shown with no bar; that is Stat or typography

Alternatives: `Progress`, `Loader`, `Stat`.

- React: `import { Meter } from "@skryensya/react/meter"`.
- HTML: a `<div>` with `data-sk-meter`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` | number | `0` |
| `min` | number | `0` |
| `max` | number | `100` |
| `valueText` | string |  |
| `tone` | "accent" \| "success" \| "warning" \| "danger" | `"accent"` |
| `label` | string |  |

**Example** (canonical tree `meter/labelled`; its copy is placeholder, replace it)

```tsx
import { Meter } from "@skryensya/react/meter";

export function MeterExample() {
  return (
    <Meter value={68} min={0} max={100} valueText="68%" label="Uso de disco" />
  );
}
```

```html
<div class="sk-meter-group">
  <div class="sk-meter-group__header" aria-hidden="true">
    <span class="sk-meter-group__label">Uso de disco</span>
    <span class="sk-meter-group__value">68%</span>
  </div>
  <div
    class="sk-meter"
    data-sk-meter
    aria-valuenow="68"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuetext="68%"
    data-tone="accent"
    aria-label="Uso de disco"
    role="meter"
  >
    <div class="sk-meter__bar"></div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/meter.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-meter-color`, `--sk-meter-fill`.
