# box

Category: layout. Stylesheet: `@skryensya/core/patterns/box.css`. Signatures: `Box`.

## Box

**Use when**

- a group needs padding, a surface or a border around it
- a surfaced group exists on one side of the expanded line only; that is show compact or show expanded

**Avoid when**

- things only need to be spaced apart; that is a Stack, Inline or Grid with no box
- a page column needs centering; that is Wrapper

Alternatives: `Stack`, `Inline`, `Grid`, `Wrapper`.

- React: `import { Box } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

- At least one of: `padding`, `surface`, `border`, `appearance`, `measure`.

**Options**

| Option | Values | Default |
|---|---|---|
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" | `"none"` |
| `paddingExpanded` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `surface` | "none" \| "sunken" \| "surface" \| "raised" | `"none"` |
| `border` | "none" \| "subtle" \| "default" | `"none"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |
| `measure` | "sm" \| "md" \| "lg" |  |
| `radius` | "none" \| "control" \| "surface" |  |
| `show` | "compact" \| "expanded" |  |
| `boxElement` (React: `as`) | "div" \| "section" \| "article" \| "aside" \| "header" \| "footer" \| "nav" \| "main" | `"div"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `layout/box-grid`; its copy is placeholder, replace it)

```tsx
import { Badge } from "@skryensya/react/badge";
import { Box, Grid } from "@skryensya/react/layout";

export function BoxExample() {
  return (
    <Box padding="md" surface="surface" border="subtle">
      <Grid gap="sm" columns="2">
        <Badge>Uno</Badge>
        <Badge tone="success">Dos</Badge>
      </Grid>
    </Box>
  );
}
```

```html
<div
  class="sk-box"
  data-padding="md"
  data-surface="surface"
  data-border="subtle"
  data-appearance="plain"
>
  <div class="sk-grid" data-gap="sm" data-columns="2">
    <span
      class="sk-badge"
      data-appearance="plain"
      data-tone="neutral"
      data-size="md"
    >
      Uno
    </span>
    <span
      class="sk-badge"
      data-appearance="plain"
      data-tone="success"
      data-size="md"
    >
      Dos
    </span>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/badge.css`, `@skryensya/core/patterns/box.css`, `@skryensya/core/patterns/layout.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-box-bg`, `--sk-box-border-color`, `--sk-box-border-width`, `--sk-box-brutalist-edge`, `--sk-box-brutalist-offset-block`, `--sk-box-brutalist-offset-inline`, `--sk-box-brutalist-shadow`, `--sk-box-padding`, `--sk-box-radius`, `--sk-box-shadow`, `--sk-box-wash`.
