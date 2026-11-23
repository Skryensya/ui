# date-picker

Category: forms. Stylesheet: `@skryensya/core/components/date-picker.css`. Signatures: `DatePicker`, `DatePicker.native`.

## DatePicker

**Use when**

- the date is a field of a form, next to other fields
- it should be possible both to type it and to look it up in the calendar

**Avoid when**

- choosing the date IS the screen: there the grid is always visible
- only the month or the year matters, not the day

Alternatives: `Calendar`.

- React: `import { DatePicker } from "@skryensya/react/date-picker"`.
- HTML: a `<div>` with `data-sk-date-picker`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `min` | string |  |
| `max` | string |  |
| `selectionMode` | "single" \| "range" | `"single"` |
| `numOfMonths` | number |  |
| `locale` | string | `"en"` |
| `timeZone` | string | `"UTC"` |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `placeholder` | string |  |
| `clearLabel` | string | `"Clear"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text |  |

**Example** (canonical tree `date-picker/field`; its copy is placeholder, replace it)

```tsx
import { DatePicker } from "@skryensya/react/date-picker";

export function DatePickerExample() {
  return (
    <DatePicker
      name="reserva"
      defaultValue="2026-03-12"
      placeholder="AAAA-MM-DD"
      label="Fecha de la reserva"
    />
  );
}
```

```html
<div
  class="sk-date-picker"
  data-sk-date-picker
  data-name="reserva"
  data-value="2026-03-12"
  data-selection-mode="single"
  data-locale="en"
  data-time-zone="UTC"
>
  <label class="sk-date-picker__label">Fecha de la reserva</label>
  <div class="sk-date-picker__control sk-anchor">
    <input class="sk-date-picker__input" placeholder="AAAA-MM-DD">
    <button
      class="sk-date-picker__clear sk-button sk-interactive"
      aria-label="Clear"
      type="button"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
    <button
      class="sk-date-picker__trigger sk-button sk-interactive"
      type="button"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span data-sk-icon="calendar" data-sk-icon-size="sm"></span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/calendar.css`, `@skryensya/core/components/date-picker.css`, `@skryensya/core/patterns/anchored.css`.

## DatePicker.native

**Use when**

- an ordinary date inside a form, with no range selection
- the keyboard, the local format and the submission should belong to the browser

**Avoid when**

- a range is needed (start and end): that is DatePicker with selectionMode range
- the calendar has to be always visible: that is Calendar

Alternatives: `DatePicker`, `Calendar`.

- React: `import { NativeDatePicker } from "@skryensya/react/date-picker"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `locale` | string | `"en"` |
| `value` (React: `defaultValue`) | string |  |
| `min` | string |  |
| `max` | string |  |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |

**Example** (canonical tree `date-picker/native`; its copy is placeholder, replace it)

```tsx
import { NativeDatePicker } from "@skryensya/react/date-picker";

export function NativeDatePickerExample() {
  return <NativeDatePicker name="arrival" locale="es-DO" label="Reserva" />;
}
```

```html
<div class="sk-date-picker">
  <label class="sk-date-picker__label" id="reserva">Reserva</label>
  <div class="sk-date-picker__control">
    <input
      class="sk-date-picker__input"
      name="arrival"
      lang="es-DO"
      type="date"
      aria-labelledby="reserva"
    >
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/date-picker.css`, `@skryensya/core/patterns/anchored.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:datepickervaluechange` | `onValueChange` | { value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-date-picker-affordance-color`, `--sk-date-picker-backdrop-bg`, `--sk-date-picker-bg`, `--sk-date-picker-border-color`, `--sk-date-picker-content-bg`, `--sk-date-picker-content-border-color`, `--sk-date-picker-content-inline-size`, `--sk-date-picker-content-padding`, `--sk-date-picker-content-radius`, `--sk-date-picker-content-shadow`, `--sk-date-picker-content-wash`, `--sk-date-picker-disabled-bg`, `--sk-date-picker-disabled-fg`, `--sk-date-picker-fg`, `--sk-date-picker-gap`, `--sk-date-picker-inline-size`, `--sk-date-picker-label-color`, `--sk-date-picker-min-inline-size`, `--sk-date-picker-radius`, `--sk-date-picker-shadow`, `--sk-date-picker-wash`.
