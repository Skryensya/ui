# wrapper

Category: layout. Stylesheet: `@skryensya/core/patterns/wrapper.css`. Signatures: `Wrapper`.

## Wrapper

**Use when**

- the page needs a centered measure so the text does not stretch edge to edge
- a header, a body and a footer should share the same width ceiling: all three use the same wrapperSize
- the content needs side gutters but no ceiling; that is wrapperSize full, which keeps the inline padding and only drops the maximum

**Avoid when**

- the content should touch the edges (a full-bleed image or band); full still leaves gutters, so there is no wrapper there, or LayoutGrid with data-width="full-width" is used
- some children should be narrower or wider than the rest; that is LayoutGrid, not nested Wrappers
- it is already inside another Wrapper; nesting them adds both inline paddings and the outer ceiling wins anyway
- the region needs a background, border or padding of its own; Wrapper only measures and centers, that is a Box (inside or outside the Wrapper)

Alternatives: `LayoutGrid`, `Box`.

- React: `import { Wrapper } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

- Never inside: `Wrapper`.

**Options**

| Option | Values | Default |
|---|---|---|
| `wrapperSize` (React: `size`) | "sm" \| "md" \| "lg" \| "full" | `"md"` |
| `gutter` | "none" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `gutterExpanded` | "none" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `wrapperElement` (React: `as`) | "div" \| "section" \| "article" \| "aside" \| "header" \| "footer" \| "nav" \| "main" | `"div"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `layout/declared-expanded-spacing`; its copy is placeholder, replace it)

```tsx
import { Badge } from "@skryensya/react/badge";
import { Box, Grid, Stack, Wrapper } from "@skryensya/react/layout";
import { Text } from "@skryensya/react/typography";

export function WrapperExample() {
  return (
    <Wrapper gutter="md" gutterExpanded="lg">
      <Box padding="md" paddingExpanded="xl" surface="raised">
        <Grid gap="sm" gapExpanded="lg" columns="2" responsive>
          <Stack gap="sm">
            <Text>Móvil</Text>
            <Text>Escritorio</Text>
          </Stack>
          <Stack gap="xs" gapExpanded="md">
            <Badge>Uno</Badge>
            <Badge>Dos</Badge>
          </Stack>
        </Grid>
      </Box>
    </Wrapper>
  );
}
```

```html
<div
  class="sk-wrapper"
  data-size="md"
  data-gutter="md"
  data-gutter-expanded="lg"
>
  <div
    class="sk-box"
    data-padding="md"
    data-padding-expanded="xl"
    data-surface="raised"
    data-border="none"
    data-appearance="plain"
  >
    <div
      class="sk-grid"
      data-gap="sm"
      data-gap-expanded="lg"
      data-columns="2"
      data-responsive
    >
      <div class="sk-stack" data-gap="sm">
        <p
          class="sk-text"
          data-tone="primary"
          data-size="body"
          data-weight="body"
        >
          Móvil
        </p>
        <p
          class="sk-text"
          data-tone="primary"
          data-size="body"
          data-weight="body"
        >
          Escritorio
        </p>
      </div>
      <div class="sk-stack" data-gap="xs" data-gap-expanded="md">
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
          data-tone="neutral"
          data-size="md"
        >
          Dos
        </span>
      </div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/badge.css`, `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/box.css`, `@skryensya/core/patterns/layout.css`, `@skryensya/core/patterns/wrapper.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-wrapper-max`, `--sk-wrapper-padding-inline`.
