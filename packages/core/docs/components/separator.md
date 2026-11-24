# separator

Category: layout. Stylesheet: `@skryensya/core/components/separator.css`. Signatures: `LabelledSeparator`, `Separator`.

## LabelledSeparator

**Use when**

- there is a word between the two halves: or, since 2019, older

**Avoid when**

- the word is a heading for what follows; that is a Heading, and the rule is decoration on top
- it runs vertically: a label in a vertical rule is rotated text, a different component

Alternatives: `Separator`, `Heading`.

- React: `import { LabelledSeparator } from "@skryensya/react/separator"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "subtle" \| "default" \| "strong" | `"default"` |
| `spacing` | "none" \| "sm" \| "md" \| "lg" | `"md"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `separator/labelled`; its copy is placeholder, replace it)

```tsx
import { LabelledSeparator } from "@skryensya/react/separator";

export function LabelledSeparatorExample() {
  return <LabelledSeparator>o</LabelledSeparator>;
}
```

```html
<div
  class="sk-separator"
  data-tone="default"
  data-spacing="md"
  role="separator"
  aria-labelledby="o"
>
  <span class="sk-separator__rule" aria-hidden="true"></span>
  <span class="sk-separator__label" id="o">o</span>
  <span class="sk-separator__rule" aria-hidden="true"></span>
</div>
```

Stylesheets: `@skryensya/core/components/separator.css`.

## Separator

**Use when**

- a rule divides two blocks that are about different things
- a vertical hairline sits between two things placed side by side (it takes its height from whatever holds it)
- the line is only paint - a card's internal edge - which is what decorative is for

**Avoid when**

- the rule can be dragged to resize what it divides; that is a Window Splitter, with a keyboard contract of its own (@skryensya/core/splitter)
- the separation is between rows of a list, a menu or a toolbar; those families draw their own
- what is wanted is space, not a line; that is the gap of whatever holds the two blocks

Alternatives: `LabelledSeparator`, `Stack`.

- React: `import { Separator } from "@skryensya/react/separator"`.
- HTML: a `<hr>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `orientation` | "horizontal" \| "vertical" | `"horizontal"` |
| `tone` | "subtle" \| "default" \| "strong" | `"default"` |
| `spacing` | "none" \| "sm" \| "md" \| "lg" | `"md"` |
| `decorative` | boolean | `false` |

**Example** (canonical tree `separator/rule`; its copy is placeholder, replace it)

```tsx
import { Separator } from "@skryensya/react/separator";

export function SeparatorExample() {
  return <Separator tone="strong" />;
}
```

```html
<hr
  class="sk-separator"
  data-orientation="horizontal"
  aria-orientation="horizontal"
  data-tone="strong"
  data-spacing="md"
>
```

Stylesheets: `@skryensya/core/components/separator.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-separator-color`, `--sk-separator-label-fg`, `--sk-separator-label-font-size`, `--sk-separator-label-gap`, `--sk-separator-spacing`, `--sk-separator-thickness`.
