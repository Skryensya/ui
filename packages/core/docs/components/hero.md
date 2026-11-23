# hero

Category: layout. Stylesheet: `@skryensya/core/patterns/hero.css`. Signatures: `Hero`.

## Hero

**Use when**

- it opens a page or a section: it needs to stand apart visually from what follows
- the headline and the sub-line need more room and a surface of their own, not the page's background
- a real heading (Heading) always goes inside, never just large text: if the hero opens the whole page, that heading is the page's <h1>
- at most one primary action and one quieter secondary one; never a row of buttons of equal weight
- the default host is not a landmark and needs no aria-label; authored as a landmark (<section>, as="section" in React) it does need aria-label or aria-labelledby pointing at the heading inside

**Avoid when**

- it is one more section of the page, not the opening one; that is a Box or simply a Stack
- content only needs separating with padding or a border; that is a Box
- the message needs more than two actions or more than one competing headline; move the rest into its own section
- an image inside replaces the headline instead of accompanying it; the headline stays a real Heading, and the image carries its own alt
- it closes the page (secondary navigation, legal notice, credit); that is Footer

Alternatives: `Box`, `Footer`, `Stack`.

- React: `import { Hero } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

- Holds at least 1 of `Heading`: A hero states what the page or section is: its headline is a real heading, not large text, or the outline has nothing to open with.

**Options**

| Option | Values | Default |
|---|---|---|
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" | `"xl"` |
| `paddingExpanded` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `surface` | "none" \| "sunken" \| "surface" \| "raised" | `"surface"` |
| `align` | "start" \| "center" | `"start"` |
| `heroElement` (React: `as`) | "div" \| "section" \| "header" | `"div"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `hero/brutalist`; its copy is placeholder, replace it)

```tsx
import { Hero } from "@skryensya/react/layout";
import { Heading } from "@skryensya/react/typography";

export function HeroExample() {
  return (
    <Hero appearance="brutalist" padding="lg" surface="raised">
      <Heading>Lanzamiento de julio</Heading>
    </Hero>
  );
}
```

```html
<div
  class="sk-hero"
  data-appearance="brutalist"
  data-padding="lg"
  data-surface="raised"
  data-align="start"
>
  <h2 class="sk-heading" data-size="h2">Lanzamiento de julio</h2>
</div>
```

Stylesheets: `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/hero.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-hero-bg`, `--sk-hero-brutalist-offset`, `--sk-hero-min-height`, `--sk-hero-padding`, `--sk-hero-radius`, `--sk-hero-shadow`, `--sk-hero-wash`.
