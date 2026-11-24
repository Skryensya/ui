# select

Category: forms. Stylesheet: `@skryensya/core/components/select.css`. Signatures: `Select`, `Select.native`.

## Select

**Use when**

- the options need markup, not only text
- a controlled collection, custom positioning or the sk:selectvaluechange event is needed

**Avoid when**

- a standard choice is enough: appearance stopped being a reason to replace the native control
- the person types to filter; that is Combobox
- there are a few fixed options in view; that is Segmented or RadioGroup

Alternatives: `Select.native`, `Combobox`, `Segmented`, `RadioGroup`.

- React: `import { Select } from "@skryensya/react/select"`.
- HTML: a `<div>` with `data-sk-select`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `placeholder` | string | `""` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `variant` | "outline" \| "ghost" |  |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `options`) | a list of items (below) | yes |
| `label` | text |  |

Each item in `items`, keyed by `value`: `disabled` (boolean), `value` (string), `label` (text, required).

**Example** (canonical tree `select/enhanced`; its copy is placeholder, replace it)

```tsx
import { Select } from "@skryensya/react/select";
import { options } from "./select-options";

export function SelectExample() {
  return (
    <Select name="plan" defaultValue="starter" label="Plan" options={options} />
  );
}
```

`select-options.ts`:

```ts
export const options = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
];
```

```html
<div
  class="sk-select"
  data-sk-select
  data-value="starter"
  data-placeholder
>
  <select
    data-sk-select-hidden
    name="plan"
    aria-hidden="true"
    tabindex="-1"
    style="border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;"
  >
    <option selected value="starter">Starter</option>
    <option value="pro">Pro</option>
  </select>
  <div class="sk-select__control" data-sk-select-control>
    <label class="sk-select__label" data-sk-select-label>Plan</label>
    <button
      class="sk-select__trigger sk-anchor sk-interactive"
      data-sk-select-trigger
      type="button"
    >
      <span class="sk-select__value" data-sk-select-value></span>
      <span
        class="sk-select__indicator"
        data-sk-select-indicator
        aria-hidden="true"
      >
        <span data-state="closed">
          <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
        </span>
        <span data-state="open">
          <span data-sk-icon="chevron-up" data-sk-icon-size="md"></span>
        </span>
      </span>
    </button>
  </div>
  <div class="sk-select__positioner sk-anchored" data-sk-select-positioner>
    <div class="sk-select__panel">
      <ul class="sk-select__content sk-scrollbar" data-sk-select-content>
        <li
          class="sk-select__item sk-interactive"
          data-sk-select-item
          data-value="starter"
        >
          <span class="sk-select__item-text" data-sk-select-item-text>
            Starter
          </span>
          <span
            class="sk-select__item-indicator"
            data-sk-select-item-indicator
          >
            <span data-sk-icon="check" data-sk-icon-size="md"></span>
          </span>
        </li>
        <li
          class="sk-select__item sk-interactive"
          data-sk-select-item
          data-value="pro"
        >
          <span class="sk-select__item-text" data-sk-select-item-text>
            Pro
          </span>
          <span
            class="sk-select__item-indicator"
            data-sk-select-item-indicator
          >
            <span data-sk-icon="check" data-sk-icon-size="md"></span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/select.css`, `@skryensya/core/patterns/anchored.css`.

## Select.native

**Use when**

- a standard choice from a known list, inside a form
- the keyboard, the submission and the accessibility should belong to the browser

**Avoid when**

- each option needs markup of its own: an icon, a description, two lines
- the sk:selectvaluechange event or a controlled collection is needed
- the person types to filter a long list; that is Combobox
- there are a few fixed options and they fit in view; that is Segmented or RadioGroup

Alternatives: `Select`, `Combobox`, `Segmented`, `RadioGroup`.

- React: `import { NativeSelect } from "@skryensya/react/select-native"`.
- HTML: a `<select>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `options`) | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `disabled` (boolean), `value` (string), `label` (text, required).

**Example** (canonical tree `select/native`; its copy is placeholder, replace it)

```tsx
import { NativeSelect } from "@skryensya/react/select-native";
import { options } from "./select-options";

export function NativeSelectExample() {
  return <NativeSelect name="plan" aria-label="Plan" options={options} />;
}
```

`select-options.ts`:

```ts
export const options = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
];
```

```html
<select
  class="sk-select-native sk-scrollbar"
  name="plan"
  aria-label="Plan"
>
  <button type="button">
    <selectedcontent></selectedcontent>
  </button>
  <option value="starter">Starter</option>
  <option value="pro">Pro</option>
</select>
```

Stylesheets: `@skryensya/core/components/select.css`, `@skryensya/core/patterns/anchored.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:selectvaluechange` | `onValueChange` | { value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-select-bg`, `--sk-select-border-color`, `--sk-select-border-width`, `--sk-select-content-bg`, `--sk-select-content-border-color`, `--sk-select-content-max-block-size`, `--sk-select-content-padding`, `--sk-select-content-shadow`, `--sk-select-content-wash`, `--sk-select-disabled-bg`, `--sk-select-disabled-border-color`, `--sk-select-disabled-fg`, `--sk-select-fg`, `--sk-select-font-size`, `--sk-select-height`, `--sk-select-item-disabled-fg`, `--sk-select-item-fg`, `--sk-select-item-padding`, `--sk-select-item-radius`, `--sk-select-padding-x`, `--sk-select-radius`, `--sk-select-shadow`, `--sk-select-state-opacity`, `--sk-select-wash`.
