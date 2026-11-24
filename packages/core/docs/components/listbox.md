# listbox

Category: forms. Stylesheet: `@skryensya/core/components/listbox.css`. Signatures: `Listbox`.

## Listbox

**Use when**

- whoever uses the screen has to see every option while choosing: a view, a few filters, the items they are about to act on
- more than one can be chosen, and checking and unchecking without opening anything is faster than a dropdown
- the list is browsed with the keyboard (arrows, type-ahead) and focus has to stay in one place
- laid in a row (horizontal) only when several can be chosen: a row of days, a few toggled filters

**Avoid when**

- it is a form field that gets submitted: Listbox has no input and no name; that is Select, RadioGroup or a group of Checkboxes
- the options are many or the space is small: an always-open listbox takes as much room as its options; that is Select or Combobox
- a single choice laid in a row: that is Segmented
- each row navigates to another page or runs an action: that is NavList or Menu, not a choice

Alternatives: `Segmented`, `Select`, `Combobox`, `RadioGroup`, `Menu`.

- React: `import { Listbox } from "@skryensya/react/listbox"`.
- HTML: a `<div>` with `data-sk-listbox`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `selectionMode` | "single" \| "multiple" \| "extended" | `"single"` |
| `orientation` | "vertical" \| "horizontal" | `"vertical"` |
| `indicator` | "check" \| "none" | `"check"` |
| `disabled` | boolean | `false` |
| `deselectable` | boolean | `false` |
| `loopFocus` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |
| `items` | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `value` (string), `disabled` (boolean), `defaultSelected` (boolean), `label` (text, required), `description` (text).

**Example** (canonical tree `listbox/multiple`; its copy is placeholder, replace it)

```tsx
import { Listbox } from "@skryensya/react/listbox";
import { items } from "./listbox-items";

export function ListboxExample() {
  return <Listbox selectionMode="multiple" label="Etiquetas" items={items} />;
}
```

`listbox-items.ts`:

```ts
export const items = [
  { value: "bug", defaultSelected: true, label: "Bug" },
  { value: "docs", label: "Documentación" },
  { value: "design", defaultSelected: true, label: "Diseño" },
  { value: "legacy", disabled: true, label: "Legado" },
];
```

```html
<div
  class="sk-listbox"
  data-sk-listbox
  data-selection-mode="multiple"
  data-orientation="vertical"
  data-indicator="check"
>
  <span class="sk-listbox__label" data-sk-listbox-label>Etiquetas</span>
  <ul class="sk-listbox__content" data-sk-listbox-content>
    <li
      class="sk-listbox__item sk-interactive"
      data-sk-listbox-item
      data-value="bug"
      data-default-selected
    >
      <span class="sk-listbox__item-text" data-sk-listbox-item-text>
        Bug
      </span>
      <span
        class="sk-listbox__item-indicator"
        data-sk-listbox-item-indicator
        aria-hidden="true"
      >
        <span data-sk-icon="check" data-sk-icon-size="sm"></span>
      </span>
    </li>
    <li
      class="sk-listbox__item sk-interactive"
      data-sk-listbox-item
      data-value="docs"
    >
      <span class="sk-listbox__item-text" data-sk-listbox-item-text>
        Documentación
      </span>
      <span
        class="sk-listbox__item-indicator"
        data-sk-listbox-item-indicator
        aria-hidden="true"
      >
        <span data-sk-icon="check" data-sk-icon-size="sm"></span>
      </span>
    </li>
    <li
      class="sk-listbox__item sk-interactive"
      data-sk-listbox-item
      data-value="design"
      data-default-selected
    >
      <span class="sk-listbox__item-text" data-sk-listbox-item-text>
        Diseño
      </span>
      <span
        class="sk-listbox__item-indicator"
        data-sk-listbox-item-indicator
        aria-hidden="true"
      >
        <span data-sk-icon="check" data-sk-icon-size="sm"></span>
      </span>
    </li>
    <li
      class="sk-listbox__item sk-interactive"
      data-sk-listbox-item
      data-value="legacy"
      data-disabled
    >
      <span class="sk-listbox__item-text" data-sk-listbox-item-text>
        Legado
      </span>
      <span
        class="sk-listbox__item-indicator"
        data-sk-listbox-item-indicator
        aria-hidden="true"
      >
        <span data-sk-icon="check" data-sk-icon-size="sm"></span>
      </span>
    </li>
  </ul>
</div>
```

Stylesheets: `@skryensya/core/components/listbox.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:listboxvaluechange` | `onValueChange` | { value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-listbox-bg`, `--sk-listbox-border-color`, `--sk-listbox-gap`, `--sk-listbox-item-description-fg`, `--sk-listbox-item-disabled-fg`, `--sk-listbox-item-fg`, `--sk-listbox-item-padding`, `--sk-listbox-item-radius`, `--sk-listbox-item-selected-bg`, `--sk-listbox-item-selected-fg`, `--sk-listbox-label-fg`, `--sk-listbox-max-block-size`, `--sk-listbox-padding`, `--sk-listbox-radius`.
