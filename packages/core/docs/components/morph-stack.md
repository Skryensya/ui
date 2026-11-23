# morph-stack

Category: content. Stylesheet: `@skryensya/core/components/morph-stack.css`. Signatures: `MorphStack`.

## MorphStack

**Use when**

- a picture has layers (an interface over its structure over its data) and a gesture should pull them apart so the reader sees how they sit
- a card, a feature tile or a hero wants one image that reveals depth on hover or focus, and stays a plain picture otherwise
- the open state is the product's to decide (a selected plan, a step of a tour): write state and the stack opens and closes itself

**Avoid when**

- there are fewer than three plates or more than five; a longer series is Carousel or Procedure
- the layers carry the information a reader needs (a chart and its legend): it is hidden at rest and absent on touch screens, so it would not be found
- the page should open it on a tap; hover is not trusted on a touch screen, so write state yourself from your own control

Alternatives: `ScrollStack`, `Carousel`.

- React: `import { MorphStack } from "@skryensya/react/morph-stack"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `state` | "auto" \| "auto-inverse" \| "rest" \| "expanded" | `"auto"` |
| `turn` | "start" \| "end" | `"start"` |
| `perspective` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `back` | node | yes |
| `deepest` | node |  |
| `front` | node | yes |
| `middle` | node | yes |
| `nearest` | node |  |

**Example** (canonical tree `morph-stack/five`; its copy is placeholder, replace it)

```tsx
import { MorphStack } from "@skryensya/react/morph-stack";
import { Text } from "@skryensya/react/typography";

export function MorphStackExample() {
  return (
    <MorphStack
      deepest={<Text>The layer deepest down.</Text>}
      back={<Text>The layer behind.</Text>}
      middle={<Text>The picture at rest.</Text>}
      front={<Text>The layer in front.</Text>}
      nearest={<Text>The layer nearest the viewer.</Text>}
    />
  );
}
```

```html
<div class="sk-morph-stack" data-state="auto" data-turn="start">
  <div class="sk-morph-stack__stage">
    <div class="sk-morph-stack__deepest">
      <p
        class="sk-text"
        data-tone="primary"
        data-size="body"
        data-weight="body"
      >
        The layer deepest down.
      </p>
    </div>
    <div class="sk-morph-stack__back">
      <p
        class="sk-text"
        data-tone="primary"
        data-size="body"
        data-weight="body"
      >
        The layer behind.
      </p>
    </div>
    <div class="sk-morph-stack__middle">
      <p
        class="sk-text"
        data-tone="primary"
        data-size="body"
        data-weight="body"
      >
        The picture at rest.
      </p>
    </div>
    <div class="sk-morph-stack__front">
      <p
        class="sk-text"
        data-tone="primary"
        data-size="body"
        data-weight="body"
      >
        The layer in front.
      </p>
    </div>
    <div class="sk-morph-stack__nearest">
      <p
        class="sk-text"
        data-tone="primary"
        data-size="body"
        data-weight="body"
      >
        The layer nearest the viewer.
      </p>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/morph-stack.css`, `@skryensya/core/components/typography.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-morph-stack-back-opacity`, `--sk-morph-stack-gap`, `--sk-morph-stack-perspective`, `--sk-morph-stack-rotate-x`, `--sk-morph-stack-rotate-z`, `--sk-morph-stack-scale`, `--sk-morph-stack-size`, `--sk-morph-stack-slide-x`, `--sk-morph-stack-slide-y`, `--sk-morph-stack-stagger`.
