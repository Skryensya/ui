# form-field

Category: forms. Stylesheet: `@skryensya/core/components/form-field.css`. Signatures: `FormField`.

## FormField

**Use when**

- a control needs a label, and it almost always does
- a validation message has to be shown next to the control
- a short hint is needed before the user types
- the label has to exist for the screen reader but the composition already says it visually: labelVisuallyHidden clips it without dropping the for

**Avoid when**

- the control carries no label at all; then the control itself carries aria-label and there is no FormField (labelVisuallyHidden is NOT this: the slot is still required)
- the aim is to mark it invalid without saying why; the error's presence is what invalidates, and color is never the only signal
- the control already brings its own label wired by its machine, like NumberField or Combobox; wrapping it would add a second `for` competing with the first

Alternatives: `Callout`, `Input`.

- React: `import { FormField } from "@skryensya/react/form-field"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `required` | boolean | `false` |
| `disabled` | boolean | `false` |
| `labelVisuallyHidden` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | node | yes |
| `hint` | node |  |
| `error` | node |  |
| `children` | signature | yes |

**Example** (canonical tree `form-field/with-hint-and-error`; its copy is placeholder, replace it)

```tsx
import { FormField } from "@skryensya/react/form-field";
import { Input } from "@skryensya/react/input";

export function FormFieldExample() {
  return (
    <FormField
      required
      label="Email"
      hint="Sólo la usamos para las boletas."
      error="Ingresa una dirección laboral."
    >
      <Input type="email" name="email" />
    </FormField>
  );
}
```

```html
<div class="sk-form-field" required>
  <label class="sk-form-field__label" for="email">
    Email
    <span class="sk-form-field__required" aria-hidden="true">*</span></label>
  <div class="sk-form-field__hint" id="email-hint">
    Sólo la usamos para las boletas.
  </div>
  <input
    class="sk-input"
    type="email"
    name="email"
    id="email"
    required
    aria-describedby="email-hint email-error"
    aria-invalid="true"
  >
  <div class="sk-form-field__error" id="email-error">
    Ingresa una dirección laboral.
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/form-field.css`, `@skryensya/core/components/input.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-form-field-disabled-fg`, `--sk-form-field-error-fg`, `--sk-form-field-error-font-size`, `--sk-form-field-error-gap`, `--sk-form-field-error-line-height`, `--sk-form-field-gap`, `--sk-form-field-hint-fg`, `--sk-form-field-hint-font-size`, `--sk-form-field-hint-line-height`, `--sk-form-field-label-fg`, `--sk-form-field-label-font-size`, `--sk-form-field-label-font-weight`, `--sk-form-field-required-fg`.
