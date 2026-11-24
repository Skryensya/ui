# radio-group

Category: forms. Stylesheet: `@skryensya/core/components/radio-group.css`. Signatures: `Radio`, `RadioGroup`.

## Radio

**Use when**

- a matrix: each row is a question and each cell holds a radio of that row
- a standalone radio whose group is formed by the shared `name`, not by a container

**Avoid when**

- it is a list of options one below another; that is RadioGroup, which also announces the group
- the options are not exclusive; that is Checkbox

Alternatives: `RadioGroup`, `Checkbox`.

- React: `import { Radio } from "@skryensya/react/selection"`.
- HTML: a `<input>`, no JavaScript needed.

- Requires the options: `name`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `radioDefaultChecked` (React: `defaultChecked`) | boolean | `false` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

**Example** (canonical tree `radio/standalone`; its copy is placeholder, replace it)

```tsx
import { Radio } from "@skryensya/react/selection";

export function RadioExample() {
  return <Radio name="plan" defaultValue="mensual">Mensual</Radio>;
}
```

```html
<label class="sk-radio" data-appearance="plain">
  <input
    class="sk-radio__input"
    name="plan"
    data-value="mensual"
    type="radio"
  >
  <span class="sk-radio__control" aria-hidden="true">
    <span class="sk-radio__indicator"></span>
  </span>
  <span class="sk-radio__label">Mensual</span>
</label>
```

Stylesheets: `@skryensya/core/components/radio-group.css`.

## RadioGroup

**Use when**

- ONE option of a small set is chosen and all the options are worth showing
- the options exclude each other
- the value is submitted with the form (a name shared by each input)

**Avoid when**

- there are more than seven or eight options; a Select fits better there
- there are two or three and they change a view, not a value; that is a Segmented
- several can be checked at once; those are independent Checkboxes
- there is a single option; a choice of one is not a choice

Alternatives: `Checkbox`, `Segmented`, `Select`.

- React: `import { RadioGroup } from "@skryensya/react/selection"`.
- HTML: a `<div>`, no JavaScript needed.

- Requires the options: `name`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `orientation` | "vertical" \| "horizontal" | `"vertical"` |
| `spread` | boolean | `false` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `label` | string |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `value` (string), `disabled` (boolean), `label` (node, required).

**Accessible name**

- A radiogroup needs an accessible name; with no visible group label, pass label or aria-labelledby. Give one of: `label`, `aria-label`, `aria-labelledby`.

**Example** (canonical tree `radio-group/two-plans`; its copy is placeholder, replace it)

```tsx
import { RadioGroup } from "@skryensya/react/selection";
import { items } from "./radio-group-items";

export function RadioGroupExample() {
  return (
    <RadioGroup name="plan" defaultValue="mensual" label="Plan" items={items} />
  );
}
```

`radio-group-items.ts`:

```ts
export const items = [
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
];
```

```html
<div
  class="sk-radio-group"
  data-appearance="plain"
  data-value="mensual"
  data-orientation="vertical"
  aria-orientation="vertical"
  aria-label="Plan"
  role="radiogroup"
>
  <label class="sk-radio">
    <input
      class="sk-radio__input"
      name="plan"
      checked
      value="mensual"
      type="radio"
    >
    <span class="sk-radio__control" aria-hidden="true">
      <span class="sk-radio__indicator"></span>
    </span>
    <span class="sk-radio__label">Mensual</span>
  </label>
  <label class="sk-radio">
    <input class="sk-radio__input" name="plan" value="anual" type="radio">
    <span class="sk-radio__control" aria-hidden="true">
      <span class="sk-radio__indicator"></span>
    </span>
    <span class="sk-radio__label">Anual</span>
  </label>
</div>
```

Stylesheets: `@skryensya/core/components/radio-group.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-radio-bg`, `--sk-radio-border-color`, `--sk-radio-border-width`, `--sk-radio-control-size`, `--sk-radio-disabled-bg`, `--sk-radio-disabled-border-color`, `--sk-radio-disabled-fg`, `--sk-radio-fg`, `--sk-radio-gap`, `--sk-radio-group-gap`, `--sk-radio-hit-size`, `--sk-radio-selected-bg`, `--sk-radio-selected-border-color`, `--sk-radio-selected-fg`.
