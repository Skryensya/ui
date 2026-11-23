# scroll-stack

Category: layout. Stylesheet: `@skryensya/core/components/scroll-stack.css`. Signatures: `ScrollStack`.

## ScrollStack

**Use when**

- two sections tell one story as the page scrolls and the second should read as arriving on top of the first: a hero and what follows it, a scene and its detail
- a quiet, elegant transition between two blocks is wanted; the back recedes a little and the front settles, nothing more
- the page has to stay a plain document where the effect is unavailable: with no scroll-driven animation, or with reduced motion, the two sections simply follow one another
- the front section is a heading and what follows it, and each piece should arrive in turn as it rises: give the front slot several children

**Avoid when**

- there are more than two layers, or the sections are a sequence of equal steps; this stacks exactly one over one, and Procedure or Steps fits an ordered series
- the back section is taller than the scrolling box; it is held in place while covered, so what does not fit would never be seen
- the motion is the content (a story told by scroll position); this is a cover, built to be ignored, and not a scroll-driven scene
- each section should scroll on its own inside a fixed frame; that is a set of regions, and Resizable or a Grid with overflow fits it

Alternatives: `Hero`, `Procedure`, `Resizable`.

- React: `import { ScrollStack } from "@skryensya/react/scroll-stack"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `back` | node | yes |
| `front` | node | yes |

**Example** (canonical tree `scroll-stack/default`; its copy is placeholder, replace it)

```tsx
import { ScrollStack } from "@skryensya/react/scroll-stack";
import { Text } from "@skryensya/react/typography";

export function ScrollStackExample() {
  return (
    <ScrollStack
      back={<Text>The section that stays behind.</Text>}
      front={<Text>The section that rises over it.</Text>}
    />
  );
}
```

```html
<div class="sk-scroll-stack">
  <div class="sk-scroll-stack__back">
    <p
      class="sk-text"
      data-tone="primary"
      data-size="body"
      data-weight="body"
    >
      The section that stays behind.
    </p>
  </div>
  <div class="sk-scroll-stack__front">
    <span class="sk-scroll-stack__runway" aria-hidden="true"></span>
    <div class="sk-scroll-stack__content">
      <p
        class="sk-text"
        data-tone="primary"
        data-size="body"
        data-weight="body"
      >
        The section that rises over it.
      </p>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/scroll-stack.css`, `@skryensya/core/components/typography.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-scroll-stack-content-gap`, `--sk-scroll-stack-content-padding`, `--sk-scroll-stack-front-bg`, `--sk-scroll-stack-front-docked-radius`, `--sk-scroll-stack-front-radius`, `--sk-scroll-stack-front-shadow`, `--sk-scroll-stack-offset`, `--sk-scroll-stack-recede-blur`, `--sk-scroll-stack-recede-dim`, `--sk-scroll-stack-recede-opacity`, `--sk-scroll-stack-recede-radius`, `--sk-scroll-stack-recede-shift`, `--sk-scroll-stack-recede-scale`, `--sk-scroll-stack-reveal-blur`, `--sk-scroll-stack-reveal-opacity`, `--sk-scroll-stack-reveal-shift`, `--sk-scroll-stack-zoom`.
