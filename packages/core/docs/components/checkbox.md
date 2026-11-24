# checkbox

Category: forms. Stylesheet: `@skryensya/core/components/checkbox.css`. Signatures: `Checkbox`, `CheckboxGroup`.

## Checkbox

**Use when**

- a yes-or-no decision submitted with the form
- several independent options, each checked on its own
- accepting terms, subscribing, turning on a preference that is saved on submit

**Avoid when**

- the change takes effect immediately, with nothing to submit; that is a Switch
- ONE option of a set is chosen; that is a RadioGroup

Alternatives: `Switch`, `CheckboxGroup`.

- React: `import { Checkbox } from "@skryensya/react/selection"`.
- HTML: a `<input>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` | string |  |
| `defaultChecked` | boolean | `false` |
| `defaultIndeterminate` | boolean | `false` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

**Example** (canonical tree `checkbox/labelled`; its copy is placeholder, replace it)

```tsx
import { Checkbox } from "@skryensya/react/selection";

export function CheckboxExample() {
  return <Checkbox name="terms" required>Acepto los términos</Checkbox>;
}
```

```html
<label class="sk-checkbox" data-appearance="plain">
  <input class="sk-checkbox__input" name="terms" required type="checkbox">
  <span class="sk-checkbox__control sk-interactive" aria-hidden="true">
    <span class="sk-checkbox__indicator" data-state="checked">
      <span data-sk-icon="check" data-sk-icon-size="sm"></span>
    </span>
    <span class="sk-checkbox__indicator" data-state="indeterminate">
      <span data-sk-icon="remove" data-sk-icon-size="sm"></span>
    </span>
  </span>
  <span class="sk-checkbox__label">Acepto los términos</span>
</label>
```

Stylesheets: `@skryensya/core/components/checkbox.css`.

## CheckboxGroup

**Use when**

- a set of options that can also be checked or unchecked as a whole
- the selection has to show as partial: some yes, some no
- select all in a table, permissions, filters with a master checkbox on top

**Avoid when**

- the options have nothing in common; then they are separate Checkboxes
- ONE is chosen; that is a RadioGroup
- the parent should be able to stay indeterminate on its own: that state is DERIVED from the children, never chosen

Alternatives: `Checkbox`, `RadioGroup`.

- React: `import { CheckboxGroup } from "@skryensya/react/selection"`.
- HTML: a `<div>` with `data-sk-checkbox-group`, enhanced by Vanilla's mount.

- Requires the options: `name`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `orientation` | "vertical" \| "horizontal" | `"vertical"` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | node | yes |
| `items` | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `value` (string), `defaultChecked` (boolean), `disabled` (boolean), `label` (node, required).

**Example** (canonical tree `checkbox/group`; its copy is placeholder, replace it)

```tsx
import { CheckboxGroup } from "@skryensya/react/selection";
import { items } from "./checkbox-items";

export function CheckboxGroupExample() {
  return (
    <CheckboxGroup
      name="permissions"
      label="Permisos del repositorio"
      items={items}
    />
  );
}
```

`checkbox-items.ts`:

```ts
export const items = [
  { value: "read", defaultChecked: true, label: "Lectura" },
  { value: "write", label: "Escritura" },
  { value: "admin", label: "Administración" },
];
```

```html
<div
  class="sk-checkbox-group"
  data-sk-checkbox-group
  data-appearance="plain"
  data-orientation="vertical"
  role="group"
  aria-labelledby="permisos-del-repositorio"
>
  <label class="sk-checkbox">
    <input
      class="sk-checkbox__input"
      data-sk-checkbox-group-all
      type="checkbox"
    >
    <span class="sk-checkbox__control sk-interactive" aria-hidden="true">
      <span class="sk-checkbox__indicator" data-state="checked">
        <span data-sk-icon="check" data-sk-icon-size="sm"></span>
      </span>
      <span class="sk-checkbox__indicator" data-state="indeterminate">
        <span data-sk-icon="remove" data-sk-icon-size="sm"></span>
      </span>
    </span>
    <span class="sk-checkbox__label" id="permisos-del-repositorio">
      Permisos del repositorio
    </span>
  </label>
  <div class="sk-checkbox-group__items">
    <label class="sk-checkbox">
      <input
        class="sk-checkbox__input"
        data-sk-checkbox-group-item
        name="permissions"
        value="read"
        checked
        type="checkbox"
      >
      <span class="sk-checkbox__control sk-interactive" aria-hidden="true">
        <span class="sk-checkbox__indicator" data-state="checked">
          <span data-sk-icon="check" data-sk-icon-size="sm"></span>
        </span>
        <span class="sk-checkbox__indicator" data-state="indeterminate">
          <span data-sk-icon="remove" data-sk-icon-size="sm"></span>
        </span>
      </span>
      <span class="sk-checkbox__label">Lectura</span>
    </label>
    <label class="sk-checkbox">
      <input
        class="sk-checkbox__input"
        data-sk-checkbox-group-item
        name="permissions"
        value="write"
        type="checkbox"
      >
      <span class="sk-checkbox__control sk-interactive" aria-hidden="true">
        <span class="sk-checkbox__indicator" data-state="checked">
          <span data-sk-icon="check" data-sk-icon-size="sm"></span>
        </span>
        <span class="sk-checkbox__indicator" data-state="indeterminate">
          <span data-sk-icon="remove" data-sk-icon-size="sm"></span>
        </span>
      </span>
      <span class="sk-checkbox__label">Escritura</span>
    </label>
    <label class="sk-checkbox">
      <input
        class="sk-checkbox__input"
        data-sk-checkbox-group-item
        name="permissions"
        value="admin"
        type="checkbox"
      >
      <span class="sk-checkbox__control sk-interactive" aria-hidden="true">
        <span class="sk-checkbox__indicator" data-state="checked">
          <span data-sk-icon="check" data-sk-icon-size="sm"></span>
        </span>
        <span class="sk-checkbox__indicator" data-state="indeterminate">
          <span data-sk-icon="remove" data-sk-icon-size="sm"></span>
        </span>
      </span>
      <span class="sk-checkbox__label">Administración</span>
    </label>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/checkbox.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:checkboxgroupvaluechange` | `onValueChange` | { checked: boolean \| "indeterminate", value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-checkbox-bg`, `--sk-checkbox-border-color`, `--sk-checkbox-border-width`, `--sk-checkbox-control-size`, `--sk-checkbox-disabled-bg`, `--sk-checkbox-disabled-border-color`, `--sk-checkbox-disabled-fg`, `--sk-checkbox-fg`, `--sk-checkbox-gap`, `--sk-checkbox-group-gap`, `--sk-checkbox-group-indent`, `--sk-checkbox-label-fg`, `--sk-checkbox-radius`, `--sk-checkbox-selected-bg`, `--sk-checkbox-selected-border-color`, `--sk-checkbox-selected-fg`.
