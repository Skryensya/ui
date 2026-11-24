# number-field

Category: forms. Stylesheet: `@skryensya/core/components/number-field.css`. Signatures: `NumberField`.

## NumberField

**Use when**

- the value is a number that is typed: a quantity, an amount, a number of nights
- adjusting one step at a time is a frequent action and deserves buttons
- locale formatting (thousands, decimals, currency) is needed without losing the raw value

**Avoid when**

- the value is approximate and seeing it move helps; that is a Slider
- there are a few discrete options; that is a Segmented or a RadioGroup
- it is text that only looks like a number (a RUT, a phone number, a code); that is an Input

Alternatives: `Slider`, `Segmented`, `RadioGroup`, `Input`.

- React: `import { NumberField } from "@skryensya/react/number-field"`.
- HTML: a `<div>` with `data-sk-number-field`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `defaultValue` | string |  |
| `locale` | string | `"en"` |
| `min` | number |  |
| `max` | number |  |
| `step` | number |  |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `decrementLabel` | string | `"Decrease"` |
| `incrementLabel` | string | `"Increase"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `hint` | text |  |
| `label` | text | yes |

**Example** (canonical tree `number-field/quantity`; its copy is placeholder, replace it)

```tsx
import { NumberField } from "@skryensya/react/number-field";

export function NumberFieldExample() {
  return <NumberField name="noches" min={1} max={14} step={1} label="Noches" />;
}
```

```html
<div class="sk-number-field" data-sk-number-field lang="en">
  <label class="sk-number-field__label" data-sk-number-field-label>
    Noches
  </label>
  <div class="sk-number-field__control" data-sk-number-field-control>
    <button
      class="sk-number-field__decrement sk-button sk-interactive"
      data-sk-number-field-decrement
      aria-label="Decrease"
      type="button"
      data-variant="ghost"
      data-size="sm"
      data-icon-only
    >
      <span data-sk-icon="remove" data-sk-icon-size="sm"></span>
    </button>
    <input
      class="sk-number-field__input"
      data-sk-number-field-input
      name="noches"
      min="1"
      max="14"
      step="1"
      type="text"
      inputmode="decimal"
      autocomplete="off"
    >
    <button
      class="sk-number-field__increment sk-button sk-interactive"
      data-sk-number-field-increment
      aria-label="Increase"
      type="button"
      data-variant="ghost"
      data-size="sm"
      data-icon-only
    >
      <span data-sk-icon="add" data-sk-icon-size="sm"></span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/number-field.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:numberfieldvaluechange` | `onValueChange` | { value: string, valueAsNumber: number } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-number-field-bg`, `--sk-number-field-border-color`, `--sk-number-field-border-width`, `--sk-number-field-fg`, `--sk-number-field-gap`, `--sk-number-field-hint-color`, `--sk-number-field-invalid-border-color`, `--sk-number-field-label-color`, `--sk-number-field-min-inline-size`, `--sk-number-field-radius`, `--sk-number-field-shadow`, `--sk-number-field-step-color`, `--sk-number-field-step-inset`, `--sk-number-field-step-radius`, `--sk-number-field-wash`.
