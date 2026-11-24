# scroll-expand

Category: layout. Stylesheet: `@skryensya/core/components/scroll-expand.css`. Signatures: `ScrollExpand`.

## ScrollExpand

**Use when**

- one box is the point of the section and should open from a small window to fill the whole box as the page scrolls: a photo with its caption, a film, a piece of interface, a map
- what the box holds (the smaller words, a few figures) should not be on screen in the small window but arrive, one piece after another, as it opens: put each piece as a child of the reveal slot
- big words stand above the window before it opens and should make way for it (put them in the lead slot, which fades out as the window opens)
- the page has to stay a plain document where the effect is unavailable: with no scroll-driven animation, or with reduced motion, the lead, the container and what follows simply follow one another

**Avoid when**

- two sections tell one story and the second should arrive on top of the first; that is ScrollStack
- what the box holds must be readable from the first frame; the reveal is not on screen while the window is small, and the backdrop's edges are cut off until it opens
- the motion is the content (a story told by scroll position); this is a reveal, built to be passed through, and not a scroll-driven scene
- there are many containers in a row; each would hold the page for a box-height of scroll, and a Carousel or a Grid fits a set

Alternatives: `ScrollStack`, `Hero`, `Carousel`.

- React: `import { ScrollExpand } from "@skryensya/react/scroll-expand"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `direction` | "expand" \| "contract" | `"expand"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `reveal` | node |  |
| `lead` | node |  |
| `after` | node |  |

**Example** (canonical tree `scroll-expand/default`; its copy is placeholder, replace it)

```tsx
import { ScrollExpand } from "@skryensya/react/scroll-expand";
import { Heading, Text } from "@skryensya/react/typography";

export function ScrollExpandExample() {
  return (
    <ScrollExpand
      lead={<Heading>Open wide</Heading>}
      reveal={<Text>What arrives as it opens.</Text>}
      after={<Text>What follows.</Text>}
    >
      <Text>What fills the container.</Text>
    </ScrollExpand>
  );
}
```

```html
<div class="sk-scroll-expand" data-direction="expand">
  <div class="sk-scroll-expand__track">
    <span class="sk-scroll-expand__clock" aria-hidden="true"></span>
    <div class="sk-scroll-expand__stage">
      <div class="sk-scroll-expand__lead">
        <h2 class="sk-heading" data-size="h2">Open wide</h2>
      </div>
      <div class="sk-scroll-expand__container">
        <div class="sk-scroll-expand__backdrop">
          <p
            class="sk-text"
            data-tone="primary"
            data-size="body"
            data-weight="body"
          >
            What fills the container.
          </p>
        </div>
        <div class="sk-scroll-expand__reveal">
          <p
            class="sk-text"
            data-tone="primary"
            data-size="body"
            data-weight="body"
          >
            What arrives as it opens.
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="sk-scroll-expand__after">
    <p
      class="sk-text"
      data-tone="primary"
      data-size="body"
      data-weight="body"
    >
      What follows.
    </p>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/scroll-expand.css`, `@skryensya/core/components/typography.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-scroll-expand-bg`, `--sk-scroll-expand-container-bg`, `--sk-scroll-expand-inset-block`, `--sk-scroll-expand-inset-inline`, `--sk-scroll-expand-lead-shift`, `--sk-scroll-expand-radius`, `--sk-scroll-expand-reveal-blur`, `--sk-scroll-expand-reveal-shift`, `--sk-scroll-expand-scrim`.
