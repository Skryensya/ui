# tags-input

Category: forms. Stylesheet: `@skryensya/core/components/tags-input.css`. Signatures: `TagsInput`.

## TagsInput

**Use when**

- several values are typed into one field: keywords, recipients, labels, skills
- the vocabulary is the person's own, so whatever they type is a valid value
- the values are short enough to read as chips; a long phrase in a chip is a truncation

**Avoid when**

- the values must come from a known list; that is a Combobox, and choosing this instead means accepting typos as data
- there is one value; that is an Input
- the chips are not a field at all but applied filters or keywords to display; that is Tag
- what is being added comes from the platform rather than the keyboard; that is FileUpload

Alternatives: `Combobox`, `Tag`, `Input`.

- React: `import { TagsInput } from "@skryensya/react/tags-input"`.
- HTML: a `<div>` with `data-sk-tags-input`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `placeholder` | string |  |
| `removeLabel` | string | `"Remove"` |
| `max` | number |  |
| `delimiter` | string | `","` |
| `allowDuplicates` | boolean | `false` |
| `editable` | boolean | `true` |
| `name` | string |  |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `invalid` | boolean | `false` |
| `required` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `defaultValue`) | a list of items (below) |  |

Each item in `items`: `label` (text, required).

**Example** (canonical tree `tags-input/tags`; its copy is placeholder, replace it)

```tsx
import { TagsInput } from "@skryensya/react/tags-input";
import { defaultValue } from "./tags-input-defaultValue";

export function TagsInputExample() {
  return (
    <TagsInput
      label="Temas"
      placeholder="Agrega un tema"
      removeLabel="Quitar"
      name="topics"
      defaultValue={defaultValue}
    />
  );
}
```

`tags-input-defaultValue.ts`:

```ts
export const defaultValue = ["react", "svelte"];
```

```html
<div
  class="sk-tags-input"
  data-sk-tags-input
  data-delimiter=","
  data-name="topics"
>
  <div class="sk-tags-input__control" data-sk-tags-input-control>
    <div class="sk-tags-input__value" data-sk-tags-input-value>
      <span class="sk-tags-input__items" data-sk-tags-input-items>
        <span
          class="sk-tags-input__item"
          data-sk-tags-input-item
          data-value="react"
        >
          <span
            class="sk-tags-input__item-preview sk-tag"
            data-sk-tags-input-item-preview
            data-removable
          >
            <span
              class="sk-tags-input__item-text sk-tag__label"
              data-sk-tags-input-item-text
            >
              react
            </span>
            <button
              class="sk-tags-input__item-remove sk-tag__remove sk-button sk-interactive"
              data-sk-tags-input-item-remove
              aria-label="Quitar"
              type="button"
              data-appearance="plain"
              data-variant="ghost"
              data-tone="neutral"
              data-size="sm"
              data-icon-only
              data-sk-button
            >
              <span data-sk-icon="close" data-sk-icon-size="md"></span>
            </button>
          </span>
          <input
            class="sk-tags-input__item-input"
            data-sk-tags-input-item-input
            type="text"
            hidden
          >
        </span>
        <span
          class="sk-tags-input__item"
          data-sk-tags-input-item
          data-value="svelte"
        >
          <span
            class="sk-tags-input__item-preview sk-tag"
            data-sk-tags-input-item-preview
            data-removable
          >
            <span
              class="sk-tags-input__item-text sk-tag__label"
              data-sk-tags-input-item-text
            >
              svelte
            </span>
            <button
              class="sk-tags-input__item-remove sk-tag__remove sk-button sk-interactive"
              data-sk-tags-input-item-remove
              aria-label="Quitar"
              type="button"
              data-appearance="plain"
              data-variant="ghost"
              data-tone="neutral"
              data-size="sm"
              data-icon-only
              data-sk-button
            >
              <span data-sk-icon="close" data-sk-icon-size="md"></span>
            </button>
          </span>
          <input
            class="sk-tags-input__item-input"
            data-sk-tags-input-item-input
            type="text"
            hidden
          >
        </span>
      </span>
      <input
        class="sk-tags-input__input"
        data-sk-tags-input-input
        aria-label="Temas"
        placeholder="Agrega un tema"
        type="text"
        autocomplete="off"
      >
    </div>
    <button
      class="sk-tags-input__clear sk-button sk-interactive"
      data-sk-tags-input-clear
      type="button"
      data-icon-only
      data-size="xs"
      data-variant="ghost"
    >
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
  </div>
  <input
    class="sk-tags-input__hidden"
    data-sk-tags-input-hidden
    type="text"
    hidden
  >
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/tag.css`, `@skryensya/core/components/tags-input.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tagsinputvaluechange` | `onValueChange` | { value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-tag-bg`, `--sk-tag-fg`, `--sk-tags-input-bg`, `--sk-tags-input-border-color`, `--sk-tags-input-border-width`, `--sk-tags-input-clear-offset`, `--sk-tags-input-disabled-bg`, `--sk-tags-input-disabled-border-color`, `--sk-tags-input-gap`, `--sk-tags-input-input-min-size`, `--sk-tags-input-invalid-border-color`, `--sk-tags-input-padding-x`, `--sk-tags-input-padding-y`, `--sk-tags-input-radius`, `--sk-tags-input-readonly-bg`, `--sk-tags-input-readonly-border-color`, `--sk-tags-input-shadow`, `--sk-tags-input-wash`.
