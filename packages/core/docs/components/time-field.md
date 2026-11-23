# time-field

Category: forms. Stylesheet: `@skryensya/core/components/time-field.css`. Signatures: `TimeField`.

## TimeField

**Use when**

- a time has to be typed and the format matters: a booking, a shift, opening hours
- each segment should be correctable separately without retyping everything
- the format has to follow the locale (12 or 24 hours, AM/PM before or after)

**Avoid when**

- the day is needed too; that is a DatePicker, or both together
- it is a duration, not a time of day; that is a NumberField with its unit

Alternatives: `NumberField`.

- React: `import { TimeField } from "@skryensya/react/time-field"`.
- HTML: a `<div>` with `data-sk-time-field`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `locale` | string | `"en"` |
| `hourCycle` | "h12" \| "h24" |  |
| `value` (React: `defaultValue`) | string |  |
| `minuteStep` | number | `1` |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `hourLabel` | string | `"Hour"` |
| `minuteLabel` | string | `"Minute"` |
| `periodLabel` | string | `"Period"` |
| `clearLabel` | string | `"Clear time"` |
| `optionsStep` | number | `30` |
| `optionsLabel` | string | `"Choose from list"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `hint` | text |  |
| `label` | text | yes |

**Example** (canonical tree `time-field/appointment`; its copy is placeholder, replace it)

```tsx
import { TimeField } from "@skryensya/react/time-field";

export function TimeFieldExample() {
  return (
    <TimeField
      name="hora"
      required
      label="Hora de la cita"
      hint="Atendemos entre las 9 y las 18."
    />
  );
}
```

```html
<div
  class="sk-time-field"
  data-sk-time-field
  data-name="hora"
  data-locale="en"
  data-minute-step="1"
  data-required
  data-hour-label="Hour"
  data-minute-label="Minute"
  data-period-label="Period"
  data-clear-label="Clear time"
  data-options-step="30"
  data-options-label="Choose from list"
>
  <span class="sk-time-field__label">Hora de la cita</span>
  <span class="sk-time-field__hint">Atendemos entre las 9 y las 18.</span>
</div>
```

Stylesheets: `@skryensya/core/components/select.css`, `@skryensya/core/components/time-field.css`, `@skryensya/core/patterns/anchored.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:timefieldvaluechange` | `onValueChange` | { value: string } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-select-bg`, `--sk-select-border-color`, `--sk-select-border-width`, `--sk-select-content-bg`, `--sk-select-content-border-color`, `--sk-select-content-max-block-size`, `--sk-select-content-padding`, `--sk-select-content-shadow`, `--sk-select-content-wash`, `--sk-select-disabled-bg`, `--sk-select-disabled-border-color`, `--sk-select-disabled-fg`, `--sk-select-fg`, `--sk-select-font-size`, `--sk-select-height`, `--sk-select-item-disabled-fg`, `--sk-select-item-fg`, `--sk-select-item-padding`, `--sk-select-item-radius`, `--sk-select-padding-x`, `--sk-select-radius`, `--sk-select-shadow`, `--sk-select-state-opacity`, `--sk-select-wash`, `--sk-time-field-affordance-color`, `--sk-time-field-bg`, `--sk-time-field-border-color`, `--sk-time-field-disabled-bg`, `--sk-time-field-disabled-fg`, `--sk-time-field-fg`, `--sk-time-field-gap`, `--sk-time-field-inline-size`, `--sk-time-field-invalid-border-color`, `--sk-time-field-label-color`, `--sk-time-field-placeholder-color`, `--sk-time-field-radius`, `--sk-time-field-segment-radius`, `--sk-time-field-shadow`, `--sk-time-field-wash`.
