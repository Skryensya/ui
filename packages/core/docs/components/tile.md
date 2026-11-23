# tile

Category: content. Stylesheet: `@skryensya/core/components/tile.css`. Signatures: `ExpandableTile`, `ExpandableTileContent`, `ExpandableTileTrigger`, `TileButton`, `TileCheckbox`, `TileChevron`, `TileContent`, `TileLink`, `TileRadioGroup`, `TileSwitch`.

## ExpandableTile

**Use when**

- there is detail not everyone needs, and hiding it lowers the page's noise
- there are several sections and only one matters at a time; there an Accordion is built from these

**Avoid when**

- the content is what the person came to read; hiding it adds a click and nothing else
- it floats over the page; that is a Popover or a Dialog

Alternatives: `Accordion`.

- React: `import { ExpandableTile } from "@skryensya/react/tile"`.
- HTML: a `<section>` with `data-sk-expandable-tile`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `defaultOpen` | boolean | `false` |
| `disabled` | boolean | `false` |
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ExpandableTileTrigger`, `ExpandableTileContent` | yes |

**Example** (canonical tree `tile/expandable`; its copy is placeholder, replace it)

```tsx
import {
  ExpandableTile,
  ExpandableTileContent,
  ExpandableTileTrigger,
} from "@skryensya/react/tile";

export function ExpandableTileExample() {
  return (
    <ExpandableTile>
      <ExpandableTileTrigger>Detalle del envío</ExpandableTileTrigger>
      <ExpandableTileContent>
        Sale el martes desde Valparaíso.
      </ExpandableTileContent>
    </ExpandableTile>
  );
}
```

```html
<section
  class="sk-tile sk-tile--expandable"
  data-sk-expandable-tile
  data-appearance="plain"
  data-scope="tile"
  data-part="root"
>
  <button
    class="sk-tile__trigger sk-tile--interactive sk-interactive"
    type="button"
    data-scope="tile"
    data-part="trigger"
  >
    Detalle del envío
  </button>
  <div
    class="sk-tile__expandable-content"
    data-scope="tile"
    data-part="content"
  >
    Sale el martes desde Valparaíso.
  </div>
</section>
```

Stylesheets: `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/switch.css`, `@skryensya/core/components/tile.css`.

## ExpandableTileContent

**Use when**

- it is the body that folds inside its ExpandableTile

**Avoid when**

- it is outside an ExpandableTile; nothing opens it

- React: `import { ExpandableTileContent } from "@skryensya/react/tile"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `ExpandableTile`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## ExpandableTileTrigger

**Use when**

- it is the header that opens and closes its ExpandableTile

**Avoid when**

- it is outside an ExpandableTile; it has nothing to point at

- React: `import { ExpandableTileTrigger } from "@skryensya/react/tile"`.
- HTML: a `<button>`, no JavaScript needed.

- Goes inside: `ExpandableTile`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## TileButton

**Use when**

- the whole card triggers an action: choosing a plan, starting a flow

**Avoid when**

- the action is choosing among several and the choice shows; that is TileCheckbox or a RadioGroup
- it navigates; that is a TileLink

Alternatives: `TileLink`, `Button.action`.

- React: `import { TileButton } from "@skryensya/react/tile"`.
- HTML: a `<button>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `disabled` | boolean | `false` |
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `tile/button`; its copy is placeholder, replace it)

```tsx
import { TileButton } from "@skryensya/react/tile";

export function TileButtonExample() {
  return <TileButton padding="md">Empezar de cero</TileButton>;
}
```

```html
<button
  class="sk-tile sk-tile--interactive sk-interactive"
  data-padding="md"
  data-appearance="plain"
  type="button"
  data-scope="tile"
  data-part="root"
>
  Empezar de cero
</button>
```

Stylesheets: `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/switch.css`, `@skryensya/core/components/tile.css`.

## TileCheckbox

**Use when**

- several options are chosen and each is a card with content of its own
- the whole card should be the click target, not only the little box

**Avoid when**

- it is a single option in a text list; that is a Checkbox
- only one can be chosen; that is a TileRadioGroup

Alternatives: `Checkbox`, `TileRadioGroup`.

- React: `import { TileCheckbox } from "@skryensya/react/tile"`.
- HTML: a `<label>` with `data-sk-tile-checkbox`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` | string |  |
| `defaultChecked` | boolean | `false` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `tile/checkbox`; its copy is placeholder, replace it)

```tsx
import { TileCheckbox } from "@skryensya/react/tile";

export function TileCheckboxExample() {
  return (
    <TileCheckbox padding="md" name="canales" value="correo">
      Avisarme por correo
    </TileCheckbox>
  );
}
```

```html
<label
  class="sk-tile sk-tile--interactive sk-interactive"
  data-sk-tile-checkbox
  data-padding="md"
  data-appearance="plain"
  data-name="canales"
  data-value="correo"
  data-scope="tile"
>
  <input type="checkbox" data-part="input">
  <span class="sk-tile__content" data-part="content">
    Avisarme por correo
  </span>
  <span
    class="sk-checkbox__control sk-interactive"
    aria-hidden="true"
    data-part="indicator"
  >
    <span class="sk-checkbox__indicator" data-state="checked">
      <span data-sk-icon="check" data-sk-icon-size="sm"></span>
    </span>
    <span class="sk-checkbox__indicator" data-state="indeterminate">
      <span data-sk-icon="remove" data-sk-icon-size="sm"></span>
    </span>
  </span>
</label>
```

Stylesheets: `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/switch.css`, `@skryensya/core/components/tile.css`.

## TileChevron

**Use when**

- an expandable tile or an accordion section needs to show that it opens and closes

**Avoid when**

- it is outside an expandable trigger: it is not a general-purpose icon
- the state needs announcing; the trigger's aria-expanded already says it

- React: `import { TileChevron } from "@skryensya/react/tile"`.
- HTML: a `<span>`, no JavaScript needed.

- Goes inside: `ExpandableTileTrigger`, `Accordion.Trigger`.

## TileContent

**Use when**

- a Tile needs the shared anatomy of title and description

**Avoid when**

- it is outside a Tile; it is not standalone content

- React: `import { TileContent } from "@skryensya/react/tile"`.
- HTML: a `<span>`, no JavaScript needed.

- Goes inside: `TileLink`, `TileButton`, `TileCheckbox`, `TileSwitch`, `ExpandableTileTrigger`, `Accordion.Trigger`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `description` | node |  |
| `title` | node | yes |

## TileLink

**Use when**

- the whole card goes to the same place and the whole of it should be clickable
- a grid of destinations: projects, articles, sections

**Avoid when**

- there is more than one action inside; two nested targets are a trap, not a card
- it navigates nowhere; that is a TileButton

Alternatives: `TileButton`.

- React: `import { TileLink } from "@skryensya/react/tile"`.
- HTML: a `<a>`, no JavaScript needed.

- Requires the options: `href`.

**Options**

| Option | Values | Default |
|---|---|---|
| `href` | string |  |
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `tile/link`; its copy is placeholder, replace it)

```tsx
import { TileLink } from "@skryensya/react/tile";

export function TileLinkExample() {
  return <TileLink padding="md" href="/proyectos/atlas">Atlas</TileLink>;
}
```

```html
<a
  class="sk-tile sk-tile--interactive sk-interactive"
  data-padding="md"
  data-appearance="plain"
  href="/proyectos/atlas"
  data-scope="tile"
  data-part="root"
>
  Atlas
</a>
```

Stylesheets: `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/switch.css`, `@skryensya/core/components/tile.css`.

## TileRadioGroup

**Use when**

- a single option is chosen and each one needs explaining: plans, shipping methods
- the options are best compared side by side before deciding

**Avoid when**

- the options are one word each; that is a RadioGroup or a Segmented
- several can be chosen; that is TileCheckbox

Alternatives: `RadioGroup`, `Segmented`.

- React: `import { TileRadioGroup } from "@skryensya/react/tile"`.
- HTML: a `<div>` with `data-sk-tile-radio-group`, enhanced by Vanilla's mount.

- Requires the options: `name`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `defaultValue` | string |  |
| `orientation` | "horizontal" \| "vertical" |  |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `disabled` (boolean), `value` (string), `label` (node, required).

**Example** (canonical tree `tile/radio-group`; its copy is placeholder, replace it)

```tsx
import { TileRadioGroup } from "@skryensya/react/tile";
import { items } from "./tile-items";

export function TileRadioGroupExample() {
  return <TileRadioGroup padding="md" name="envio" items={items} />;
}
```

`tile-items.ts`:

```ts
export const items = [
  { value: "estandar", children: "Estándar, 3 a 5 días" },
  { value: "express", children: "Express, al día siguiente" },
];
```

```html
<div data-sk-tile-radio-group data-name="envio" data-scope="tile">
  <label
    class="sk-tile sk-tile--interactive sk-interactive"
    data-padding="md"
    data-appearance="plain"
    data-scope="tile"
    data-part="item"
  >
    <input value="estandar" type="radio" data-part="input">
    <span class="sk-tile__content" data-scope="tile" data-part="content">
      Estándar, 3 a 5 días
    </span>
    <span
      class="sk-tile__selection-indicator"
      aria-hidden="true"
      data-scope="tile"
      data-part="indicator"
    ></span>
  </label>
  <label
    class="sk-tile sk-tile--interactive sk-interactive"
    data-padding="md"
    data-appearance="plain"
    data-scope="tile"
    data-part="item"
  >
    <input value="express" type="radio" data-part="input">
    <span class="sk-tile__content" data-scope="tile" data-part="content">
      Express, al día siguiente
    </span>
    <span
      class="sk-tile__selection-indicator"
      aria-hidden="true"
      data-scope="tile"
      data-part="indicator"
    ></span>
  </label>
</div>
```

Stylesheets: `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/switch.css`, `@skryensya/core/components/tile.css`.

## TileSwitch

**Use when**

- the card turns something on or off and the effect is immediate: a preference, an integration

**Avoid when**

- the change only applies when the form is submitted; there a Checkbox tells the truth
- it is one option among several; that is a TileRadioGroup

Alternatives: `Switch`, `TileCheckbox`.

- React: `import { TileSwitch } from "@skryensya/react/tile"`.
- HTML: a `<label>` with `data-sk-tile-switch`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` | string |  |
| `defaultChecked` | boolean | `false` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `tile/switch`; its copy is placeholder, replace it)

```tsx
import { TileSwitch } from "@skryensya/react/tile";

export function TileSwitchExample() {
  return (
    <TileSwitch padding="md" name="resumen" value="semanal">
      Resumen semanal
    </TileSwitch>
  );
}
```

```html
<label
  class="sk-tile sk-tile--interactive sk-interactive"
  data-sk-tile-switch
  data-padding="md"
  data-appearance="plain"
  data-name="resumen"
  data-value="semanal"
  data-scope="tile"
>
  <input type="checkbox" role="switch" data-part="input">
  <span class="sk-tile__content" data-part="content">Resumen semanal</span>
  <span
    class="sk-switch__control"
    aria-hidden="true"
    data-part="indicator"
  >
    <span class="sk-switch__thumb"></span>
  </span>
</label>
```

Stylesheets: `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/switch.css`, `@skryensya/core/components/tile.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tilecheckedchange` | `onCheckedChange` | { checked: boolean \| "indeterminate" } |
| `sk:tileopenchange` | `onOpenChange` | { open: boolean } |
| `sk:tilevaluechange` | `onValueChange` | { value: string \| null } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-checkbox-group-gap`, `--sk-checkbox-group-indent`, `--sk-color-border-selected`, `--sk-color-border-strong`, `--sk-color-border-subtle`, `--sk-color-focus`, `--sk-color-selection-selected`, `--sk-color-text-disabled`, `--sk-color-text-primary`, `--sk-color-text-secondary`, `--sk-font-body-sm`, `--sk-font-heading-sm`, `--sk-space-2`, `--sk-space-3`, `--sk-space-4`, `--sk-tile-border-color`, `--sk-tile-brutalist-edge`, `--sk-tile-brutalist-offset-block`, `--sk-tile-brutalist-offset-inline`, `--sk-tile-brutalist-shadow`, `--sk-tile-depth`, `--sk-tile-padding`, `--sk-tile-radius`, `--sk-tile-shadow`, `--sk-tile-title-weight`.
