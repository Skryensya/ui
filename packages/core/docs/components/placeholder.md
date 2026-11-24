# placeholder

Category: feedback. Stylesheet: `@skryensya/core/components/placeholder.css`. Signatures: `Placeholder`, `Placeholder.block`, `Placeholder.circle`, `Placeholder.paragraph`.

## Placeholder

**Use when**

- a line of text that is about to arrive is prefigured, and its typographic role is already known
- it prevents the layout shift when the data appears, because it reserves exactly the line box of the role it replaces

**Avoid when**

- what will appear is not known; there a Loader says more
- the text is a paragraph; there several loose lines are Placeholder.paragraph, which already knows how a paragraph ends
- the region is empty on purpose (no results, first visit); that is EmptyState, not a skeleton

Alternatives: `Placeholder.paragraph`, `Loader`, `EmptyState`.

- React: `import { Placeholder } from "@skryensya/react/placeholder"`.
- HTML: a `<span>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `text` | "caption" \| "sm" \| "body" \| "lg" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "display-sm" \| "display-md" \| "display-lg" | `"body"` |
| `width` | string |  |
| `shimmer` | boolean | `true` |

**Example** (canonical tree `placeholder/text`; its copy is placeholder, replace it)

```tsx
import { Placeholder } from "@skryensya/react/placeholder";
import { type CSSProperties } from "react";

export function PlaceholderExample() {
  return (
    <Placeholder
      width="72%"
      text="h3"
      style={{ "--sk-placeholder-inline-size": "72%" } as CSSProperties}
    />
  );
}
```

```html
<span
  class="sk-placeholder"
  data-text="h3"
  aria-hidden="true"
  data-shape="text"
  style="--sk-placeholder-inline-size: 72%;"
></span>
```

Stylesheets: `@skryensya/core/components/placeholder.css`.

## Placeholder.block

**Use when**

- the gap is rectangular: media, a table, a chart, a card
- the block goes inside a clipped container (ImageFrame, Box with overflow) and has to take its box and its corner: that is `fill`

**Avoid when**

- what is missing is text; a rectangle the height of a paragraph does not anticipate lines, it anticipates an image
- the frame already exists and only the src is missing; that is ImageFrame with Placeholder.block fill inside, not a loose block pretending to be the frame

Alternatives: `Placeholder.paragraph`, `ImageFrame`, `Loader`.

- React: `import { PlaceholderBlock } from "@skryensya/react/placeholder"`.
- HTML: a `<span>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `width` | string |  |
| `height` | string |  |
| `fill` | boolean | `false` |
| `shimmer` | boolean | `true` |

**Example** (canonical tree `placeholder/block`; its copy is placeholder, replace it)

```tsx
import { PlaceholderBlock } from "@skryensya/react/placeholder";
import { type CSSProperties } from "react";

export function PlaceholderBlockExample() {
  return (
    <PlaceholderBlock
      width="12rem"
      height="6rem"
      style={
        {
          "--sk-placeholder-inline-size": "12rem",
          "--sk-placeholder-block-size": "6rem",
        } as CSSProperties
      }
    />
  );
}
```

```html
<span
  class="sk-placeholder"
  aria-hidden="true"
  data-shape="block"
  style="--sk-placeholder-inline-size: 12rem; --sk-placeholder-block-size: 6rem;"
></span>
```

Stylesheets: `@skryensya/core/components/placeholder.css`.

## Placeholder.circle

**Use when**

- the gap is an avatar or a round control, and its scale can be named (sm, md, lg) so the replacement does not jump

**Avoid when**

- the final shape is not round; the skeleton must not promise a silhouette the content does not have

Alternatives: `Placeholder.block`, `Avatar.initials`.

- React: `import { PlaceholderCircle } from "@skryensya/react/placeholder"`.
- HTML: a `<span>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `size` | "sm" \| "md" \| "lg" | `"md"` |
| `shimmer` | boolean | `true` |

**Example** (canonical tree `placeholder/circle`; its copy is placeholder, replace it)

```tsx
import { PlaceholderCircle } from "@skryensya/react/placeholder";

export function PlaceholderCircleExample() {
  return <PlaceholderCircle size="sm" />;
}
```

```html
<span
  class="sk-placeholder"
  data-size="sm"
  aria-hidden="true"
  data-shape="circle"
></span>
```

Stylesheets: `@skryensya/core/components/placeholder.css`.

## Placeholder.paragraph

**Use when**

- what is missing is prose: a body, a description, a comment
- the ragged edge that makes the block read as text and not as a table is wanted

**Avoid when**

- it is a single line; there it is Placeholder and keeps the full measure
- the lines have widths that mean different things (a name, a date); those are separate Placeholders with their own width

Alternatives: `Placeholder`, `Loader`.

- React: `import { PlaceholderParagraph } from "@skryensya/react/placeholder"`.
- HTML: a `<span>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `text` | "caption" \| "sm" \| "body" \| "lg" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "display-sm" \| "display-md" \| "display-lg" | `"body"` |
| `lines` | number | `3` |
| `lastLine` | string | `"62%"` |
| `shimmer` | boolean | `true` |

**Example** (canonical tree `placeholder/paragraph`; its copy is placeholder, replace it)

```tsx
import { PlaceholderParagraph } from "@skryensya/react/placeholder";
import { type CSSProperties } from "react";

export function PlaceholderParagraphExample() {
  return (
    <PlaceholderParagraph
      text="body"
      lines={3}
      lastLine="62%"
      style={{ "--sk-placeholder-last-line": "62%" } as CSSProperties}
    />
  );
}
```

```html
<span
  class="sk-placeholder"
  data-text="body"
  aria-hidden="true"
  data-shape="paragraph"
  style="--sk-placeholder-last-line: 62%;"
>
  <span class="sk-placeholder__line"></span>
  <span class="sk-placeholder__line"></span>
  <span class="sk-placeholder__line"></span>
</span>
```

Stylesheets: `@skryensya/core/components/placeholder.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-placeholder-block-size`, `--sk-placeholder-fill`, `--sk-placeholder-font-size`, `--sk-placeholder-highlight`, `--sk-placeholder-ink`, `--sk-placeholder-inline-size`, `--sk-placeholder-last-line`, `--sk-placeholder-leading`, `--sk-placeholder-line-box`, `--sk-placeholder-line-gap`, `--sk-placeholder-phase`, `--sk-placeholder-size`, `--sk-placeholder-sweep-duration`, `--sk-placeholder-sweep-size`.
