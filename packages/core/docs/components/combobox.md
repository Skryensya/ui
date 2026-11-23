# combobox

Category: forms. Stylesheet: `@skryensya/core/components/combobox.css`. Signatures: `Combobox`.

## Combobox

**Use when**

- the list is long: typing to filter gets there before scanning it
- each option needs a description under its label, not only text
- several have to be chosen and seen as removable chips

**Avoid when**

- the options fit in view: a select already handles choosing from a known list
- the value is free and does not come from a list: that is an input with suggestions

Alternatives: `Select`, `Select.native`.

- React: `import { Combobox } from "@skryensya/react/combobox"`.
- HTML: a `<div>` with `data-sk-combobox`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `placeholder` | string |  |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `multiple` | boolean | `false` |
| `max` | number |  |
| `allowCustomValue` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `error` | text |  |
| `hint` | text |  |
| `items` | a list of items (below) | yes |
| `label` | text | yes |

Each item in `items`, keyed by `value`: `disabled` (boolean), `value` (string), `description` (text), `label` (text, required).

**Example** (canonical tree `combobox/filterable`; its copy is placeholder, replace it)

```tsx
import { Combobox } from "@skryensya/react/combobox";
import { items } from "./combobox-items";

export function ComboboxExample() {
  return (
    <Combobox
      name="country"
      placeholder="Buscar país"
      label="País"
      hint="Escribe para filtrar la lista"
      items={items}
    />
  );
}
```

`combobox-items.ts`:

```ts
export const items = [
  { value: "cl", label: "Chile", description: "América del Sur" },
  { value: "mx", label: "México" },
  { value: "pt", disabled: true, label: "Portugal" },
];
```

```html
<div class="sk-combobox sk-form-field" data-sk-combobox>
  <label
    class="sk-combobox__label sk-form-field__label"
    data-sk-combobox-label
  >
    País
  </label>
  <div class="sk-form-field__hint" data-sk-combobox-hint>
    Escribe para filtrar la lista
  </div>
  <div class="sk-combobox__control sk-anchor" data-sk-combobox-control>
    <div class="sk-combobox__value" data-sk-combobox-value>
      <input
        class="sk-combobox__input"
        data-sk-combobox-input
        name="country"
        placeholder="Buscar país"
      >
    </div>
    <button
      class="sk-combobox__clear sk-button sk-interactive"
      data-sk-combobox-clear
      type="button"
      data-icon-only
      data-size="xs"
      data-variant="ghost"
    >
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
    <button
      class="sk-combobox__trigger sk-button sk-interactive"
      data-sk-combobox-trigger
      type="button"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span data-state="closed">
        <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
      </span>
      <span data-state="open">
        <span data-sk-icon="chevron-up" data-sk-icon-size="md"></span>
      </span>
    </button>
  </div>
  <div
    class="sk-combobox__status sk-visually-hidden"
    data-sk-combobox-status
    role="status"
    aria-atomic="true"
  ></div>
  <div
    class="sk-combobox__positioner sk-anchored"
    data-sk-combobox-positioner
  >
    <div
      class="sk-combobox__content sk-scrollbar"
      data-sk-combobox-content
    >
      <div
        class="sk-combobox__item sk-interactive"
        data-sk-combobox-item
        data-value="cl"
        data-value-text="Chile"
        data-description="América del Sur"
      >
        <span class="sk-combobox__item-copy">
          <span class="sk-combobox__item-label" data-sk-combobox-item-text>
            Chile
          </span>
          <span class="sk-combobox__item-description">
            América del Sur
          </span>
        </span>
        <span
          class="sk-combobox__item-indicator"
          data-sk-combobox-item-indicator
        >
          ✓
        </span>
      </div>
      <div
        class="sk-combobox__item sk-interactive"
        data-sk-combobox-item
        data-value="mx"
        data-value-text="México"
      >
        <span class="sk-combobox__item-copy">
          <span class="sk-combobox__item-label" data-sk-combobox-item-text>
            México
          </span>
        </span>
        <span
          class="sk-combobox__item-indicator"
          data-sk-combobox-item-indicator
        >
          ✓
        </span>
      </div>
      <div
        class="sk-combobox__item sk-interactive"
        data-sk-combobox-item
        data-value="pt"
        data-disabled
        data-value-text="Portugal"
      >
        <span class="sk-combobox__item-copy">
          <span class="sk-combobox__item-label" data-sk-combobox-item-text>
            Portugal
          </span>
        </span>
        <span
          class="sk-combobox__item-indicator"
          data-sk-combobox-item-indicator
        >
          ✓
        </span>
      </div>
      <div
        class="sk-combobox__empty"
        data-sk-combobox-empty
        role="presentation"
      >
        No results.
      </div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/combobox.css`, `@skryensya/core/components/form-field.css`, `@skryensya/core/components/tag.css`, `@skryensya/core/patterns/anchored.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:comboboxinputvaluechange` | `onInputValueChange` | { inputValue: string } |
| `sk:comboboxvaluechange` | `onValueChange` | { value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-combobox-bg`, `--sk-combobox-border-color`, `--sk-combobox-content-bg`, `--sk-combobox-content-border-color`, `--sk-combobox-content-max-block-size`, `--sk-combobox-content-radius`, `--sk-combobox-content-shadow`, `--sk-combobox-content-wash`, `--sk-combobox-disabled-bg`, `--sk-combobox-disabled-fg`, `--sk-combobox-fg`, `--sk-combobox-invalid-border-color`, `--sk-combobox-item-padding`, `--sk-combobox-padding-x`, `--sk-combobox-radius`, `--sk-combobox-readonly-bg`, `--sk-combobox-shadow`, `--sk-combobox-wash`.
