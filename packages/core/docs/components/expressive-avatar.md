# expressive-avatar

Category: content. Stylesheet: `@skryensya/core/components/expressive-avatar.css`. Signatures: `ExpressiveAvatar`.

## ExpressiveAvatar

**Use when**

- a character, assistant or mascot needs to express a visible state
- the same identity has a complete image for each expression

**Avoid when**

- a compact, static identity token is enough; use Avatar
- the image is editorial content rather than an expressive identity; use ImageFrame

Alternatives: `Avatar.initials`.

- React: `import { ExpressiveAvatar } from "@skryensya/react/expressive-avatar"`.
- HTML: a `<span>`, no JavaScript needed.

- Requires the options: `name`, `src`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `size` | "sm" \| "md" \| "lg" \| "xl" | `"md"` |
| `appearance` | "plain" \| "brutalist" | `"plain"` |
| `expression` | string | `"base"` |
| `src` | string |  |
| `loading` | "eager" \| "lazy" | `"lazy"` |
| `decoding` | "async" \| "auto" \| "sync" | `"async"` |

**Example** (canonical tree `expressive-avatar/default`; its copy is placeholder, replace it)

```tsx
import { ExpressiveAvatar } from "@skryensya/react/expressive-avatar";

export function ExpressiveAvatarExample() {
  return (
    <ExpressiveAvatar name="Robin" src="/expressive-avatar/states/base.webp" />
  );
}
```

```html
<span
  class="sk-expressive-avatar"
  aria-label="Robin"
  data-size="md"
  data-appearance="plain"
  data-expression="base"
  role="img"
>
  <img
    class="sk-expressive-avatar__image"
    src="/expressive-avatar/states/base.webp"
    loading="lazy"
    decoding="async"
    alt
    aria-hidden="true"
  >
</span>
```

Stylesheets: `@skryensya/core/components/expressive-avatar.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-expressive-avatar-size`, `--sk-expressive-avatar-bg`, `--sk-expressive-avatar-image-rendering`.
