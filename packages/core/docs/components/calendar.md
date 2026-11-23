# calendar

Category: forms. Stylesheet: `@skryensya/core/components/calendar.css`. Signatures: `Calendar`.

## Calendar

**Use when**

- choosing the date is the screen's task, not one more field of a form
- seeing the month helps decide: weekends, holidays, how many days are left
- there is room for an always-visible grid

**Avoid when**

- it is a field inside a form: there the calendar sits behind an input
- the date is typed faster than it is found in a grid

Alternatives: `DatePicker`.

- React: `import { Calendar } from "@skryensya/react/calendar"`.
- HTML: a `<div>` with `data-sk-calendar`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` (React: `defaultValue`) | string |  |
| `min` | string |  |
| `max` | string |  |
| `selectionMode` | "single" \| "range" | `"single"` |
| `numOfMonths` | number |  |
| `locale` | string | `"en"` |
| `timeZone` | string | `"UTC"` |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |

**Example** (canonical tree `calendar/month`; its copy is placeholder, replace it)

```tsx
import { Calendar } from "@skryensya/react/calendar";

export function CalendarExample() {
  return (
    <Calendar
      defaultValue="2026-03-12"
      min="2026-03-01"
      max="2026-03-31"
      label="Fecha de la reserva"
    />
  );
}
```

```html
<div
  class="sk-calendar"
  data-sk-calendar
  data-value="2026-03-12"
  data-min="2026-03-01"
  data-max="2026-03-31"
  data-selection-mode="single"
  data-locale="en"
  data-time-zone="UTC"
  aria-labelledby="fecha-de-la-reserva"
>
  <p class="sk-calendar__label" id="fecha-de-la-reserva">
    Fecha de la reserva
  </p>
</div>
```

Stylesheets: `@skryensya/core/components/calendar.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:calendarvaluechange` | `onValueChange` | { value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-calendar-affordance-color`, `--sk-calendar-cell-radius`, `--sk-calendar-cell-size`, `--sk-calendar-fg`, `--sk-calendar-gap`, `--sk-calendar-header-gap`, `--sk-calendar-inline-size`, `--sk-calendar-row-size`, `--sk-calendar-selected-bg`, `--sk-calendar-selected-fg`.
