# command-palette

Category: actions. Stylesheet: `@skryensya/core/components/command-palette.css`. Signatures: `CommandPalette`.

## CommandPalette

**Use when**

- there are many destinations or actions and typing the name gets there before browsing them
- frequent users of the product want to get there without navigating

**Avoid when**

- the options are few and fit in view: that is a Menu
- it is the only way to reach something: a palette complements navigation, it does not replace it
- a form field that filters a known list is needed: that is a Combobox

Alternatives: `Menu`, `Combobox`, `Dialog`.

- React: `import { CommandPalette } from "@skryensya/react/command-palette"`.
- HTML: a `<dialog>` with `data-sk-command-palette`, enhanced by Vanilla's mount.

- Requires the options: `label`, `paletteId`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `paletteId` (React: `id`) | string |  |
| `closeLabel` | string | `"Close"` |
| `placeholder` | string | `"Search…"` |
| `emptyLabel` | string | `"No results."` |
| `open` | boolean | `false` |
| `vaul` | boolean | `true` |
| `entries` (React: `items`) | string |  |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `footer` | node |  |

**Example** (canonical tree `command-palette/open`; its copy is placeholder, replace it)

```tsx
import { CommandPalette } from "@skryensya/react/command-palette";

export function CommandPaletteExample() {
  return <CommandPalette label="Buscar" id="demo-palette" open />;
}
```

```html
<dialog
  class="sk-command-palette sk-dialog"
  data-sk-command-palette
  data-appearance="plain"
  aria-label="Buscar"
  id="demo-palette"
  open
  data-sk-dialog-vaul
  data-edge="block-end"
>
  <div aria-hidden="true" data-part="handle"></div>
  <div class="sk-command-palette__search">
    <span data-sk-icon="search" data-sk-icon-size="md"></span>
    <input
      class="sk-command-palette__input"
      data-sk-command-palette-input
      placeholder="Search…"
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      aria-expanded="false"
      aria-autocomplete="list"
      aria-controls="sk-command-palette-listbox"
    >
    <form method="dialog">
      <button
        class="sk-command-palette__close sk-button sk-dialog__close sk-interactive"
        aria-label="Close"
        type="submit"
        value="cancel"
        data-icon-only
        data-size="sm"
        data-variant="ghost"
      >
        <span data-sk-icon="close" data-sk-icon-size="md"></span>
      </button>
    </form>
  </div>
  <ul
    class="sk-command-palette__list sk-scrollbar"
    data-sk-command-palette-list
    role="listbox"
    aria-label="Resultados"
    id="sk-command-palette-listbox"
  ></ul>
  <p
    class="sk-command-palette__empty"
    data-sk-command-palette-empty
    data-empty-label="No results."
    hidden
  >
    No results.
  </p>
</dialog>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/command-palette.css`, `@skryensya/core/components/dialog.css`, `@skryensya/core/patterns/dialog-vaul.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:commandpalettecommand` | `onCommand` | { command: string, entry: CommandPaletteCommand } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-command-palette-border-color`, `--sk-command-palette-footer-bg`, `--sk-command-palette-footer-fg`, `--sk-command-palette-inline-size`, `--sk-command-palette-list-max-block-size`, `--sk-command-palette-list-min-block-size`, `--sk-command-palette-option-bg-selected`.
