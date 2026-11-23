# badge

Category: content. Stylesheet: `@skryensya/core/components/badge.css`. Signatures: `Badge`, `BadgeDot`, `BadgeHolder`.

## Badge

**Use when**

- a count or a short status attached to something else: unread, quantity, a status label
- the tone communicates a system role: success, warning, danger

**Avoid when**

- the user can remove it or act on it; that is a Tag
- it is colored paragraph text; a badge is a capsule, not emphasis
- there is no visible text, only a dot; that is BadgeDot

Alternatives: `Tag`, `BadgeDot`.

- React: `import { Badge } from "@skryensya/react/badge"`.
- HTML: a `<span>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "accent" \| "success" \| "warning" \| "danger" | `"neutral"` |
| `size` | "xs" \| "sm" \| "md" | `"md"` |
| `appearance` | "plain" \| "brutalist" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `badge/danger`; its copy is placeholder, replace it)

```tsx
import { Badge } from "@skryensya/react/badge";

export function BadgeExample() {
  return <Badge tone="danger">3</Badge>;
}
```

```html
<span
  class="sk-badge"
  data-appearance="plain"
  data-tone="danger"
  data-size="md"
>
  3
</span>
```

Stylesheets: `@skryensya/core/components/badge.css`.

## BadgeDot

**Use when**

- a compact dot communicates presence, something new, or a status next to another control

**Avoid when**

- there is visible text or a count; that is a Badge

Alternatives: `Badge`.

- React: `import { BadgeDot } from "@skryensya/react/badge"`.
- HTML: a `<span>`, no JavaScript needed.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "accent" \| "success" \| "warning" \| "danger" | `"neutral"` |
| `label` | string |  |
| `pulse` | boolean | `false` |

**Example** (canonical tree `badge/dot`; its copy is placeholder, replace it)

```tsx
import { BadgeDot } from "@skryensya/react/badge";

export function BadgeDotExample() {
  return <BadgeDot tone="success" label="En línea" />;
}
```

```html
<span
  class="sk-badge"
  data-tone="success"
  aria-label="En línea"
  data-dot
  role="status"
></span>
```

Stylesheets: `@skryensya/core/components/badge.css`.

## BadgeHolder

**Use when**

- a Badge or BadgeDot is anchored to the corner of a button or an avatar

**Avoid when**

- the badge sits in normal flow; it needs no anchor

Alternatives: `Badge`, `BadgeDot`.

- React: `import { BadgeHolder } from "@skryensya/react/badge"`.
- HTML: a `<span>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Button.action`, `Button.navigation`, `Avatar.initials`, `Avatar.image`, `Badge`, `BadgeDot` | yes |

**Example** (canonical tree `badge/holder`; its copy is placeholder, replace it)

```tsx
import { Avatar } from "@skryensya/react/avatar";
import { BadgeDot, BadgeHolder } from "@skryensya/react/badge";

export function BadgeHolderExample() {
  return (
    <BadgeHolder>
      <Avatar name="Ada Lovelace">AL</Avatar>
      <BadgeDot tone="success" label="En línea" />
    </BadgeHolder>
  );
}
```

```html
<span class="sk-badge-holder">
  <span
    class="sk-avatar"
    data-size="md"
    data-appearance="plain"
    aria-label="Ada Lovelace"
    role="img"
  >
    <span class="sk-avatar__fallback" aria-hidden="true">AL</span>
  </span>
  <span
    class="sk-badge"
    data-tone="success"
    aria-label="En línea"
    data-dot
    role="status"
  ></span>
</span>
```

Stylesheets: `@skryensya/core/components/avatar.css`, `@skryensya/core/components/badge.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-badge-bg`, `--sk-badge-border`, `--sk-badge-dot-color`, `--sk-badge-dot-ring-color`, `--sk-badge-dot-ring-width`, `--sk-badge-dot-size`, `--sk-badge-fg`, `--sk-badge-font-size`, `--sk-badge-font-weight`, `--sk-badge-line-height`, `--sk-badge-padding-x`, `--sk-badge-padding-y`, `--sk-badge-radius`.
