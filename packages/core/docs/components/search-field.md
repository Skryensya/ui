# search-field

Category: forms. Stylesheet: `@skryensya/core/components/search-field.css`. Signatures: `SearchField`, `SearchField.form`.

## SearchField

**Use when**

- the query filters something already on the page as it is typed: a list, a table, a grid of cards
- whoever types needs to empty the box in one move, with a button or Escape

**Avoid when**

- the value has to be one of a known set of options; that is a Combobox
- the query is sent to another page; that is SearchField.form
- it is ordinary text entry that searches nothing; that is an Input

Alternatives: `Combobox`, `Input`.

- React: `import { SearchField } from "@skryensya/react/search-field"`.
- HTML: a `<div>` with `data-sk-search-field`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `placeholder` | string |  |
| `clearLabel` | string | `"Clear search"` |
| `labelVisuallyHidden` | boolean | `false` |
| `disabled` | boolean | `false` |
| `controlSize` | "xs" \| "sm" \| "md" \| "lg" |  |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |

**Example** (canonical tree `search-field/filter`; its copy is placeholder, replace it)

```tsx
import { SearchField } from "@skryensya/react/search-field";

export function SearchFieldExample() {
  return (
    <SearchField
      name="q"
      placeholder="Nombre o correo"
      clearLabel="Borrar búsqueda"
      label="Buscar personas"
    />
  );
}
```

```html
<div class="sk-search-field" data-sk-search-field>
  <label class="sk-search-field__label" for="buscar-personas-input">
    Buscar personas
  </label>
  <div class="sk-search-field__control">
    <span class="sk-search-field__icon">
      <span data-sk-icon="search" data-sk-icon-size="sm"></span>
    </span>
    <input
      class="sk-search-field__input sk-input"
      data-sk-search-field-input
      name="q"
      placeholder="Nombre o correo"
      type="search"
      autocomplete="off"
      id="buscar-personas-input"
    >
    <button
      class="sk-search-field__clear sk-button sk-interactive"
      data-sk-search-field-clear
      aria-label="Borrar búsqueda"
      type="button"
      data-variant="ghost"
      data-size="sm"
      data-icon-only
      hidden
    >
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/input.css`, `@skryensya/core/components/search-field.css`.

## SearchField.form

**Use when**

- the query goes to a results page: a site search, a help centre
- the box should be a `search` landmark a screen reader can jump to

**Avoid when**

- the results filter in place as the person types; that is SearchField
- it opens a palette of commands and destinations; that is a CommandPalette

Alternatives: `SearchField`, `CommandPalette`.

- React: `import { SearchField } from "@skryensya/react/search-field"`.
- HTML: a `<form>` with `data-sk-search-field`, enhanced by Vanilla's mount.

- Requires the options: `action`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `placeholder` | string |  |
| `clearLabel` | string | `"Clear search"` |
| `labelVisuallyHidden` | boolean | `false` |
| `disabled` | boolean | `false` |
| `controlSize` | "xs" \| "sm" \| "md" \| "lg" |  |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |
| `action` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |
| `submit` | text | yes |

**Example** (canonical tree `search-field/form`; its copy is placeholder, replace it)

```tsx
import { SearchField } from "@skryensya/react/search-field";

export function SearchFieldExample() {
  return (
    <SearchField
      name="q"
      clearLabel="Borrar búsqueda"
      labelVisuallyHidden
      action="/buscar"
      label="Buscar en la ayuda"
      submit="Buscar"
    />
  );
}
```

```html
<form
  class="sk-search-field"
  data-sk-search-field
  data-label-visually-hidden
  action="/buscar"
  role="search"
  method="get"
>
  <label class="sk-search-field__label" for="buscar-en-la-ayuda-input">
    Buscar en la ayuda
  </label>
  <div class="sk-search-field__control">
    <span class="sk-search-field__icon">
      <span data-sk-icon="search" data-sk-icon-size="sm"></span>
    </span>
    <input
      class="sk-search-field__input sk-input"
      data-sk-search-field-input
      name="q"
      type="search"
      autocomplete="off"
      id="buscar-en-la-ayuda-input"
    >
    <button
      class="sk-search-field__clear sk-button sk-interactive"
      data-sk-search-field-clear
      aria-label="Borrar búsqueda"
      type="button"
      data-variant="ghost"
      data-size="sm"
      data-icon-only
      hidden
    >
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
  </div>
  <button
    class="sk-search-field__submit sk-button sk-interactive"
    type="submit"
  >
    Buscar
  </button>
</form>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/input.css`, `@skryensya/core/components/search-field.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-search-field-gap`, `--sk-search-field-icon-color`, `--sk-search-field-label-color`.
