# dialog

Category: overlays. Stylesheet: `@skryensya/core/components/dialog.css`. Signatures: `Dialog`.

## Dialog

**Use when**

- something has to be decided before going on: confirming a deletion, completing a short step
- the footer's action row should sit at the start or the end of the inline axis (`footerAlign`; the end by default)
- the rest of the page should be inert meanwhile
- on mobile the same dialog can be asked for as a sheet from the bottom (the vaul option)
- a destructive confirmation or a blocking error that needs immediate attention (the alert option)

**Avoid when**

- it is auxiliary information that does not block; that is a Tooltip or a Popover
- it is a list of actions hanging from a button; that is a Menu
- the content is long or navigable: that needs a page, not a modal box
- the panel has to take a whole edge at full height: that is Vaul.drawer

Alternatives: `Popover`, `Tooltip`, `Menu`, `Vaul.drawer`.

- React: `import { Dialog } from "@skryensya/react/dialog"`.
- HTML: a `<dialog>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `closeLabel` | string | `"Close"` |
| `open` | boolean | `false` |
| `vaul` | boolean | `false` |
| `alert` | boolean | `false` |
| `footerAlign` | "start" \| "end" |  |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `footer` | node |  |
| `title` | text | yes |

**Example** (canonical tree `dialog/confirm`; its copy is placeholder, replace it)

```tsx
import { Dialog } from "@skryensya/react/dialog";

export function DialogExample() {
  return (
    <Dialog open title="Borrar el despliegue">
      Esto quita las tres réplicas y no se puede deshacer.
    </Dialog>
  );
}
```

```html
<dialog
  class="sk-dialog"
  data-appearance="plain"
  open
  aria-labelledby="borrar-el-despliegue"
>
  <header class="sk-dialog__header">
    <h2 class="sk-dialog__title" id="borrar-el-despliegue">
      Borrar el despliegue
    </h2>
    <form method="dialog">
      <button
        class="sk-dialog__close sk-button sk-interactive"
        aria-label="Close"
        type="submit"
        value="cancel"
        data-icon-only
        data-size="sm"
        data-variant="ghost"
      >
        <span data-sk-icon="close" data-sk-icon-size="sm"></span>
      </button>
    </form>
  </header>
  <div class="sk-dialog__body" id="sk-form-field-body">
    Esto quita las tres réplicas y no se puede deshacer.
  </div>
</dialog>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/dialog.css`, `@skryensya/core/patterns/dialog-vaul.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-dialog-backdrop-bg`, `--sk-dialog-bg`, `--sk-dialog-border-color`, `--sk-dialog-border-width`, `--sk-dialog-brutalist-offset`, `--sk-dialog-elevation`, `--sk-dialog-exit-duration`, `--sk-dialog-exit-easing`, `--sk-dialog-fg`, `--sk-dialog-footer-border-color`, `--sk-dialog-footer-gap`, `--sk-dialog-footer-justify`, `--sk-dialog-header-border-color`, `--sk-dialog-inline-size`, `--sk-dialog-padding`, `--sk-dialog-radius`, `--sk-dialog-wash`.
