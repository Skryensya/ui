# accordion

Category: content. Stylesheet: `@skryensya/core/components/accordion.css`. Signatures: `Accordion`, `Accordion.Content`, `Accordion.Item`, `Accordion.Trigger`, `Details`, `Details.Content`, `Details.Summary`, `DetailsGroup`.

## Accordion

**Use when**

- there are several long sections and which stay open is worth coordinating: an FAQ, terms
- type=single: opening one closes the previous, so the page does not grow without end
- type=multiple: several can stay open at once, and they are still one accordion
- variant=separated: each question stands on its own, like a product FAQ; every section is a card and the open one is raised

**Avoid when**

- there are a few short sections; showing them all reads faster than folding them
- the content is compared across sections; folding forces remembering instead of looking
- the sections are alternative views of the same space; that is Tabs
- it is a single collapsible surface with no coordination between siblings; that is ExpandableTile
- nothing needs to be controlled or listened to from outside: DetailsGroup does it without JavaScript

Alternatives: `Tabs`, `ExpandableTile`, `DetailsGroup`.

- React: `import { Accordion } from "@skryensya/react/accordion"`.
- HTML: a `<div>` with `data-sk-accordion`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `type` | "single" \| "multiple" | `"single"` |
| `collapsible` | boolean | `true` |
| `disabled` | boolean | `false` |
| `defaultValue` | string |  |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |
| `variant` | "framed" \| "seamless" \| "divided" \| "separated" | `"framed"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Accordion.Item` | yes |

**Example** (canonical tree `accordion/separated`; its copy is placeholder, replace it)

```tsx
import { Accordion } from "@skryensya/react/accordion";
import { TileContent } from "@skryensya/react/tile";

export function AccordionExample() {
  return (
    <Accordion type="single" variant="separated" defaultValue="envio">
      <Accordion.Item value="envio">
        <Accordion.Trigger>
          <TileContent title="¿Cuánto tarda el envío?" />
        </Accordion.Trigger>
        <Accordion.Content>Entre dos y cinco días hábiles.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="cambios">
        <Accordion.Trigger>
          <TileContent title="¿Puedo cambiar el pedido?" />
        </Accordion.Trigger>
        <Accordion.Content>
          Mientras no haya salido del almacén.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

```html
<div
  class="sk-accordion"
  data-sk-accordion
  data-type="single"
  data-appearance="plain"
  data-variant="separated"
  data-collapsible
  data-default-value="envio"
  data-scope="accordion"
  data-part="root"
>
  <section
    class="sk-tile sk-tile--expandable"
    data-value="envio"
    data-scope="tile"
    data-part="item"
  >
    <div
      class="sk-accordion__trigger-heading"
      aria-level="3"
      role="heading"
      data-part="trigger-heading"
    >
      <button
        class="sk-tile__trigger sk-tile--interactive sk-interactive"
        type="button"
        data-scope="tile"
        data-part="trigger"
      >
        <span class="sk-tile__content" data-part="content">
          <span class="sk-tile__title">¿Cuánto tarda el envío?</span>
        </span>
      </button>
    </div>
    <div
      class="sk-tile__expandable-content"
      data-scope="tile"
      data-part="content"
    >
      Entre dos y cinco días hábiles.
    </div>
  </section>
  <section
    class="sk-tile sk-tile--expandable"
    data-value="cambios"
    data-scope="tile"
    data-part="item"
  >
    <div
      class="sk-accordion__trigger-heading"
      aria-level="3"
      role="heading"
      data-part="trigger-heading"
    >
      <button
        class="sk-tile__trigger sk-tile--interactive sk-interactive"
        type="button"
        data-scope="tile"
        data-part="trigger"
      >
        <span class="sk-tile__content" data-part="content">
          <span class="sk-tile__title">¿Puedo cambiar el pedido?</span>
        </span>
      </button>
    </div>
    <div
      class="sk-tile__expandable-content"
      data-scope="tile"
      data-part="content"
    >
      Mientras no haya salido del almacén.
    </div>
  </section>
</div>
```

Stylesheets: `@skryensya/core/components/accordion.css`, `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/details.css`, `@skryensya/core/components/switch.css`, `@skryensya/core/components/tile.css`.

## Accordion.Content

**Use when**

- it is the body that folds inside its section

**Avoid when**

- it is outside an Accordion.Item; nothing opens it

- React: `import { Accordion } from "@skryensya/react/accordion"`, then `<Accordion.Content>`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Accordion.Item`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Accordion.Item

**Use when**

- it is one section of the accordion; its `value` is how the accordion names it

**Avoid when**

- it stands alone, outside an accordion; that is an ExpandableTile

Alternatives: `ExpandableTile`.

- React: `import { Accordion } from "@skryensya/react/accordion"`, then `<Accordion.Item>`.
- HTML: a `<section>`, no JavaScript needed.

- Goes inside: `Accordion`.
- Requires the options: `value`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` | string |  |
| `defaultOpen` | boolean | `false` |
| `disabled` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Accordion.Trigger`, `Accordion.Content` | yes |

## Accordion.Trigger

**Use when**

- it is the header that opens and closes its section

**Avoid when**

- it is outside an Accordion.Item; there is nothing for it to open

- React: `import { Accordion } from "@skryensya/react/accordion"`, then `<Accordion.Trigger>`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Accordion.Item`.

**Options**

| Option | Values | Default |
|---|---|---|
| `headingLevel` | number | `3` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Details

**Use when**

- a section that expands and needs no JavaScript at all
- it matters that it works before any script loads

**Avoid when**

- whether it is open has to be known from outside, or the section has to be disabled: that is Accordion.Item

Alternatives: `Accordion.Item`.

- React: `import { Details } from "@skryensya/react/details"`.
- HTML: a `<details>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `open` | boolean | `false` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |
| `size` | "sm" \| "md" | `"md"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Details.Summary`, `Details.Content` | yes |

## Details.Content

**Use when**

- it is what opening reveals

**Avoid when**

- it is outside a Details; nothing opens it

- React: `import { Details } from "@skryensya/react/details"`, then `<Details.Content>`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Details`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Details.Summary

**Use when**

- it is what the closed state shows and what opens the section

**Avoid when**

- it is outside a Details; there is nothing for it to open

- React: `import { Details } from "@skryensya/react/details"`, then `<Details.Summary>`.
- HTML: a `<summary>`, no JavaScript needed.

- Goes inside: `Details`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## DetailsGroup

**Use when**

- several sections open and close, and letting the browser handle it is enough
- only one should stay open: siblings sharing a name already do that on their own

**Avoid when**

- which one is open has to be controlled from outside, or its changes listened to: that needs Accordion

Alternatives: `Accordion`.

- React: `import { DetailsGroup } from "@skryensya/react/details"`.
- HTML: a `<section>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |
| `size` | "sm" \| "md" | `"md"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Details` | yes |

**Example** (canonical tree `accordion/details-exclusive-group`; its copy is placeholder, replace it)

```tsx
import { Details, DetailsGroup } from "@skryensya/react/details";

export function DetailsGroupExample() {
  return (
    <DetailsGroup aria-label="Configuración de despliegue">
      <Details name="deployment">
        <Details.Summary>Runtime</Details.Summary>
        <Details.Content>Node 24 sobre el pool compartido.</Details.Content>
      </Details>
      <Details name="deployment">
        <Details.Summary>Rollout</Details.Summary>
        <Details.Content>Canary en tres tramos.</Details.Content>
      </Details>
    </DetailsGroup>
  );
}
```

```html
<section
  class="sk-details-group"
  data-appearance="plain"
  data-size="md"
  aria-label="Configuración de despliegue"
>
  <details
    class="sk-details"
    data-appearance="plain"
    data-size="md"
    name="deployment"
  >
    <summary class="sk-details__summary sk-interactive">
      Runtime
      <span class="sk-details__indicator" aria-hidden="true">
        <span data-state="closed">
          <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
        </span>
        <span data-state="open">
          <span data-sk-icon="chevron-up" data-sk-icon-size="md"></span>
        </span>
      </span>
    </summary>
    <div class="sk-details__content">
      Node 24 sobre el pool compartido.
    </div>
  </details>
  <details
    class="sk-details"
    data-appearance="plain"
    data-size="md"
    name="deployment"
  >
    <summary class="sk-details__summary sk-interactive">
      Rollout
      <span class="sk-details__indicator" aria-hidden="true">
        <span data-state="closed">
          <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
        </span>
        <span data-state="open">
          <span data-sk-icon="chevron-up" data-sk-icon-size="md"></span>
        </span>
      </span>
    </summary>
    <div class="sk-details__content">Canary en tres tramos.</div>
  </details>
</section>
```

Stylesheets: `@skryensya/core/components/accordion.css`, `@skryensya/core/components/details.css`, `@skryensya/core/components/tile.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:accordionvaluechange` | `onValueChange` | { value: string \| string[] \| null } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-accordion-bg`, `--sk-accordion-border-color`, `--sk-accordion-brutalist-edge`, `--sk-accordion-brutalist-offset-block`, `--sk-accordion-brutalist-offset-inline`, `--sk-accordion-brutalist-shadow`, `--sk-accordion-content-end-padding`, `--sk-accordion-depth`, `--sk-accordion-divider-color`, `--sk-accordion-gap`, `--sk-accordion-open-bg`, `--sk-accordion-open-elevation`, `--sk-accordion-radius`, `--sk-accordion-row-padding`, `--sk-color-border-selected`, `--sk-color-border-strong`, `--sk-color-border-subtle`, `--sk-color-focus`, `--sk-color-selection-selected`, `--sk-color-text-disabled`, `--sk-color-text-primary`, `--sk-color-text-secondary`, `--sk-font-body-sm`, `--sk-font-heading-sm`, `--sk-space-2`, `--sk-space-3`, `--sk-space-4`, `--sk-tile-border-color`, `--sk-tile-brutalist-edge`, `--sk-tile-brutalist-offset-block`, `--sk-tile-brutalist-offset-inline`, `--sk-tile-brutalist-shadow`, `--sk-tile-depth`, `--sk-tile-padding`, `--sk-tile-radius`, `--sk-tile-shadow`, `--sk-tile-title-weight`, `--sk-details-bg`, `--sk-details-border-color`, `--sk-details-brutalist-edge`, `--sk-details-brutalist-offset-block`, `--sk-details-brutalist-offset-inline`, `--sk-details-brutalist-shadow`, `--sk-details-content-bg`, `--sk-details-content-fg`, `--sk-details-depth`, `--sk-details-fg`, `--sk-details-gap`, `--sk-details-heading-gap`, `--sk-details-indicator-fg`, `--sk-details-padding`, `--sk-details-summary-min-block-size`.
