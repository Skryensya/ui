# presence

Category: layout. Stylesheet: `@skryensya/core/components/presence.css`. Signatures: `Presence`.

## Presence

**Use when**

- content appears and disappears with a state, and its exit has to be seen instead of cut off at once
- in React, the content renders conditionally and the exit has to finish before it unmounts

**Avoid when**

- the content is a dialog, popover, menu or tooltip; those already animate their own entry and exit
- what opens and closes is a section with a header; that is Details or Accordion, which animate the height
- the content does not change visibility; the animation would only delay reading

Alternatives: `Details`, `Accordion`, `Dialog`, `Popover`.

- React: `import { Presence } from "@skryensya/react/presence"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `present` | boolean | `true` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `presence/closed`; its copy is placeholder, replace it)

```tsx
import { Presence } from "@skryensya/react/presence";
import { Text } from "@skryensya/react/typography";

export function PresenceExample() {
  return (
    <Presence present={false}>
      <Text>Contenido que sale con una animación</Text>
    </Presence>
  );
}
```

```html
<div class="sk-presence" data-state="closed" hidden>
  <p
    class="sk-text"
    data-tone="primary"
    data-size="body"
    data-weight="body"
  >
    Contenido que sale con una animación
  </p>
</div>
```

Stylesheets: `@skryensya/core/components/presence.css`, `@skryensya/core/components/typography.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-presence-enter-distance`, `--sk-presence-enter-duration`, `--sk-presence-enter-easing`, `--sk-presence-exit-distance`, `--sk-presence-exit-duration`, `--sk-presence-exit-easing`.
