# button-group

Category: actions. Stylesheet: `@skryensya/core/components/button-group.css`. Signatures: `ButtonGroup`, `ButtonGroupLabel`, `ButtonGroupSeparator`, `ButtonGroupText`.

## ButtonGroup

**Use when**

- a few related actions should read as one control: Archive, Report, Snooze
- a split button: one main action as a Button and its variants behind a Menu with triggerIconOnly and triggerLabel, both with the same variant, tone and size
- two icon actions are a pair, one above the other (orientation vertical): zoom in and out
- an Input, Select or ButtonGroupText joined to the Button that acts on it: search, a URL with its prefix, an amount with its currency
- a row of groups with space between them: a ButtonGroup whose children are ButtonGroups

**Avoid when**

- the buttons toggle state or pick one option; that is Segmented
- many controls should be one Tab stop with arrow keys between them; that is Toolbar
- the actions are unrelated, or there is a single action; separate Buttons in an Inline say that better
- the members have different variants or sizes; a joined shape with mixed faces reads as broken

Alternatives: `Toolbar`, `Segmented`, `Inline`.

- React: `import { ButtonGroup } from "@skryensya/react/button-group"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `orientation` | "horizontal" \| "vertical" | `"horizontal"` |
| `separator` | "inset" \| "full" \| "none" | `"inset"` |
| `label` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `button-group/split`; its copy is placeholder, replace it)

```tsx
import { Button } from "@skryensya/react/button";
import { ButtonGroup } from "@skryensya/react/button-group";
import { Menu } from "@skryensya/react/menu";
import { items } from "./menu-items";

export function ButtonGroupExample() {
  return (
    <ButtonGroup label="Guardar">
      <Button tone="accent">Guardar</Button>
      <Menu
        label="Otras formas de guardar"
        triggerLabel="Más"
        triggerTone="accent"
        triggerIconOnly
        items={items}
      />
    </ButtonGroup>
  );
}
```

`menu-items.ts`:

```ts
export const items = [
  { value: "copy", label: "Guardar una copia" },
  { value: "template", label: "Guardar como plantilla" },
];
```

```html
<div
  class="sk-button-group"
  data-orientation="horizontal"
  data-separator="inset"
  aria-label="Guardar"
  role="group"
>
  <button
    class="sk-button sk-interactive"
    data-sk-button
    data-variant="solid"
    data-tone="accent"
    data-appearance="plain"
    data-size="md"
    type="button"
  >
    <span class="sk-button__label">Guardar</span>
    <span class="sk-button__loader sk-loader" aria-hidden="true"></span>
  </button>
  <div class="sk-menu" data-sk-menu aria-label="Otras formas de guardar">
    <button
      class="sk-menu__trigger sk-button sk-interactive sk-anchor"
      data-sk-menu-trigger
      aria-label="Más"
      data-tone="accent"
      data-icon-only
      type="button"
    >
      <span aria-hidden="true">
        <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
      </span>
    </button>
    <div class="sk-menu__positioner sk-anchored" data-sk-menu-positioner>
      <div class="sk-menu__content" data-sk-menu-content>
        <div
          class="sk-menu__item sk-interactive"
          data-sk-menu-item
          data-value="copy"
        >
          <span class="sk-menu__item-label">Guardar una copia</span>
        </div>
        <div
          class="sk-menu__item sk-interactive"
          data-sk-menu-item
          data-value="template"
        >
          <span class="sk-menu__item-label">Guardar como plantilla</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button-group.css`, `@skryensya/core/components/button.css`, `@skryensya/core/components/loader.css`, `@skryensya/core/components/menu.css`, `@skryensya/core/patterns/anchored.css`.

## ButtonGroupLabel

**Use when**

- the input in the group needs a visible label joined to it; htmlFor is its id

- React: `import { ButtonGroupLabel } from "@skryensya/react/button-group"`.
- HTML: a `<label>`, no JavaScript needed.

- Goes inside: `ButtonGroup`.
- Requires the options: `htmlFor`.

**Options**

| Option | Values | Default |
|---|---|---|
| `htmlFor` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

## ButtonGroupSeparator

**Use when**

- two solid members touch: a solid fill has no border, so without this the seam disappears

- React: `import { ButtonGroupSeparator } from "@skryensya/react/button-group"`.
- HTML: a `<span>`, no JavaScript needed.

- Goes inside: `ButtonGroup`.

## ButtonGroupText

**Use when**

- static text joined to a control: a prefix like https://, a unit, a count

- React: `import { ButtonGroupText } from "@skryensya/react/button-group"`.
- HTML: a `<span>`, no JavaScript needed.

- Goes inside: `ButtonGroup`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-button-group-brutalist-offset`, `--sk-button-group-gap`, `--sk-button-group-separator-color`, `--sk-button-group-separator-inset`, `--sk-button-group-shadow`, `--sk-button-group-text-bg`, `--sk-button-group-wash`.
