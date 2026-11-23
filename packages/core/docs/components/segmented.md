# segmented

Category: forms. Stylesheet: `@skryensya/core/components/segmented.css`. Signatures: `Segmented`.

## Segmented

**Use when**

- two or three exclusive options that are best seen all at once
- it changes a view, not a value of the form

**Avoid when**

- there are more than three or four; a RadioGroup or a Select fits better there
- the value is submitted with the form; that is a RadioGroup
- each option needs an associated panel; those are Tabs

Alternatives: `RadioGroup`, `Select`, `Tabs`.

- React: `import { SegmentedControl } from "@skryensya/react/segmented"`.
- HTML: a `<div>` with `data-sk-segmented`, enhanced by Vanilla's mount.

- Requires the options: `value`, `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` (React: `defaultValue`) | string |  |
| `label` | string |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |
| `size` | "sm" \| "md" \| "lg" | `"sm"` |
| `iconPosition` | "inline" \| "block" | `"inline"` |
| `fill` | boolean | `false` |
| `iconLabel` | "hidden" \| "tooltip" | `"hidden"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `options`) | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `disabled` (boolean), `value` (string), `label` (node, required).

**Example** (canonical tree `segmented/view-switcher`; its copy is placeholder, replace it)

```tsx
import { SegmentedControl } from "@skryensya/react/segmented";
import { options } from "./segmented-options";

export function SegmentedControlExample() {
  return (
    <SegmentedControl defaultValue="lista" label="Vista" options={options} />
  );
}
```

`segmented-options.ts`:

```ts
export const options = [
  { value: "lista", label: "Lista" },
  { value: "grilla", label: "Grilla" },
];
```

```html
<div
  class="sk-segmented"
  data-sk-segmented
  data-value="lista"
  aria-label="Vista"
  data-appearance="plain"
  data-size="sm"
  data-icon-position="inline"
  data-icon-label="hidden"
  role="radiogroup"
>
  <span class="sk-segmented__indicator" aria-hidden="true"></span>
  <button
    class="sk-segmented__option sk-interactive"
    data-sk-segmented-option
    aria-checked="true"
    data-value="lista"
    type="button"
    role="radio"
  >
    Lista
  </button>
  <button
    class="sk-segmented__option sk-interactive"
    data-sk-segmented-option
    data-value="grilla"
    type="button"
    role="radio"
  >
    Grilla
  </button>
</div>
```

Stylesheets: `@skryensya/core/components/segmented.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:segmentedvaluechange` | `onValueChange` | { value: string } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-segmented-bg`, `--sk-segmented-block-size`, `--sk-segmented-border-color`, `--sk-segmented-border-width`, `--sk-segmented-brutalist-offset`, `--sk-segmented-gap`, `--sk-segmented-font-size`, `--sk-segmented-option-fg`, `--sk-segmented-option-padding-inline`, `--sk-segmented-padding`, `--sk-segmented-radius`, `--sk-segmented-selected-bg`, `--sk-segmented-selected-elevation`, `--sk-segmented-selected-fg`, `--sk-segmented-selected-ring`, `--sk-segmented-selected-wash`, `--sk-segmented-shadow`, `--sk-segmented-wash`.
