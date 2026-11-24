# button

Category: actions. Stylesheet: `@skryensya/core/components/button.css`. Signatures: `Button.action`, `Button.navigation`.

## Button.action

**Use when**

- it performs an action in place: it changes something here instead of going somewhere
- it submits a form
- it confirms or dismisses a dialog
- it destroys something or is hard to undo: `tone: danger`, and the emphasis says which of the two moments it is
- it is THE action of the view: `tone: accent`, and one per region
- a delete inside a row of actions: `variant: ghost` + `tone: danger`, which reads as destructive without becoming the confirm button
- the confirm that delete opens: `variant: solid` + `tone: danger`, one per dialog
- it sits on media or on a surface of unknown color: `variant: soft`
- the button stays on: `pressed`, a real toggle (bold in a toolbar, a vote, play/pause). Absent when it is not a toggle; `false` when it is one and it is off

**Avoid when**

- it takes the visitor to another page or URL, even if it looks the same: that is Button.navigation
- the action is secondary, inside running text: that is a Link
- two `solid` + `accent` visible at once: if everything is the main action, nothing is
- a tone on a button that acts on nothing: a disclosure or a toggle is neutral, not accent
- `danger` on something undone with one click: the tone lies about the cost
- `success` or `warning` is wanted: a button performs an action and there is no warning action; a Badge or a Callout reports that
- `pressed` on something that does not stay on: a button that fires and springs back is not a toggle, and announcing it as one lies about what it does
- `pressed` to mark the chosen item of an exclusive group: that is Segmented or RadioGroup, which also give arrow keys

Alternatives: `Button.navigation`, `Link`.

- React: `import { Button } from "@skryensya/react/button"`.
- HTML: a `<button>` with `data-sk-button`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `variant` | "solid" \| "soft" \| "ghost" | `"solid"` |
| `tone` | "neutral" \| "accent" \| "danger" | `"neutral"` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |
| `size` | "xs" \| "sm" \| "md" \| "lg" | `"md"` |
| `iconOnly` | boolean | `false` |
| `pressed` | boolean |  |
| `disabled` | boolean | `false` |
| `type` | "button" \| "submit" \| "reset" | `"button"` |
| `loading` | boolean | `false` |
| `loadingText` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `post` | node |  |
| `pre` | node |  |

**Accessible name**

- A square control shows no text, so the host owns the accessible name; the icon child is decorative. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `button/action`; its copy is placeholder, replace it)

```tsx
import { Button } from "@skryensya/react/button";

export function ButtonExample() {
  return <Button tone="accent">Guardar</Button>;
}
```

```html
<button
  class="sk-button sk-interactive"
  data-sk-button
  data-variant="solid"
  data-tone="accent"
  data-appearance="plain"
  data-size="md"
  type="button"
>
  <span class="sk-button__label">Guardar</span>
  <span class="sk-button__loader sk-loader" aria-hidden="true"></span>
</button>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/loader.css`.

## Button.navigation

**Use when**

- it takes the visitor to another page or URL and has to look like a button
- a main call to action that is a link
- the same two axes as Button.action: a link can be quiet (`ghost`) and still be the main action (`accent`)

**Avoid when**

- the destination is not available: a link is not disabled, the content is rendered unlinked instead
- the link lives inside a paragraph: that is a Link
- `tone: danger` on a link: navigating destroys nothing; the destructive part is the action the destination page offers

Alternatives: `Button.action`, `Link`.

- React: `import { Button } from "@skryensya/react/button"`.
- HTML: a `<a>` with `data-sk-button`, enhanced by Vanilla's mount.

- Requires the options: `href`.

**Options**

| Option | Values | Default |
|---|---|---|
| `variant` | "solid" \| "soft" \| "ghost" | `"solid"` |
| `tone` | "neutral" \| "accent" \| "danger" | `"neutral"` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |
| `size` | "xs" \| "sm" \| "md" \| "lg" | `"md"` |
| `iconOnly` | boolean | `false` |
| `href` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `post` | node |  |
| `pre` | node |  |

**Accessible name**

- A square control shows no text, so the host owns the accessible name; the icon child is decorative. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `button/navigation`; its copy is placeholder, replace it)

```tsx
import { Button } from "@skryensya/react/button";

export function ButtonExample() {
  return <Button tone="accent" href="/docs">Documentación</Button>;
}
```

```html
<a
  class="sk-button sk-interactive"
  data-sk-button
  data-variant="solid"
  data-tone="accent"
  data-appearance="plain"
  data-size="md"
  href="/docs"
>
  Documentación
</a>
```

Stylesheets: `@skryensya/core/components/button.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-button-accent`, `--sk-button-bg`, `--sk-button-border-color`, `--sk-button-border-width`, `--sk-button-brutalist-edge`, `--sk-button-brutalist-offset-block`, `--sk-button-brutalist-offset-inline`, `--sk-button-brutalist-shadow`, `--sk-button-depth`, `--sk-button-fg`, `--sk-button-font-size`, `--sk-button-font-weight`, `--sk-button-gap`, `--sk-button-height`, `--sk-button-ink`, `--sk-button-padding-x`, `--sk-button-radius`, `--sk-button-shadow`, `--sk-button-tactile-press-duration`, `--sk-button-tactile-press-easing`, `--sk-button-wash`, `--sk-button-width`.
