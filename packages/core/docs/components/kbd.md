# kbd

Category: content. Stylesheet: `@skryensya/core/components/kbd.css`. Signatures: `Kbd`.

## Kbd

**Use when**

- a key or a combination the user can press is shown

**Avoid when**

- it is code text or a command; that goes in a Code block / typography
- it is an actionable control; that is Button or StateButton

Alternatives: `Code`.

- React: `import { Kbd } from "@skryensya/react/kbd"`.
- HTML: a `<kbd>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "accent" | `"neutral"` |
| `appearance` | "plain" \| "brutalist" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `kbd/brutalist`; its copy is placeholder, replace it)

```tsx
import { Kbd } from "@skryensya/react/kbd";

export function KbdExample() {
  return <Kbd appearance="brutalist">K</Kbd>;
}
```

```html
<kbd class="sk-kbd" data-appearance="brutalist" data-tone="neutral">K</kbd>
```

Stylesheets: `@skryensya/core/components/kbd.css`, `@skryensya/core/components/kbd.brutalist.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-kbd-bg`, `--sk-kbd-border-color`, `--sk-kbd-border-width`, `--sk-kbd-fg`, `--sk-kbd-icon`, `--sk-kbd-font-family`, `--sk-kbd-font-size`, `--sk-kbd-line-height`, `--sk-kbd-min-size`, `--sk-kbd-padding-x`, `--sk-kbd-radius`, `--sk-kbd-shadow`, `--sk-kbd-wash`.
