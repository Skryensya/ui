# avatar

Category: content. Stylesheet: `@skryensya/core/components/avatar.css`. Signatures: `Avatar.initials`, `Avatar.image`, `AvatarGroup`.

## Avatar.initials

**Use when**

- there is no photo and the person's initials are needed
- the avatar identifies someone and needs an accessible name

**Avoid when**

- it is any cropped image; that is an ImageFrame

Alternatives: `ImageFrame`.

- React: `import { Avatar } from "@skryensya/react/avatar"`.
- HTML: a `<span>`, no JavaScript needed.

- Requires the options: `name`.

**Options**

| Option | Values | Default |
|---|---|---|
| `size` | "sm" \| "md" \| "lg" \| "xl" | `"md"` |
| `appearance` | "plain" \| "brutalist" | `"plain"` |
| `name` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `avatar/initials`; its copy is placeholder, replace it)

```tsx
import { Avatar } from "@skryensya/react/avatar";

export function AvatarExample() {
  return <Avatar name="John Doe">JD</Avatar>;
}
```

```html
<span
  class="sk-avatar"
  data-size="md"
  data-appearance="plain"
  aria-label="John Doe"
  role="img"
>
  <span class="sk-avatar__fallback" aria-hidden="true">JD</span>
</span>
```

Stylesheets: `@skryensya/core/components/avatar.css`.

## Avatar.image

**Use when**

- a photo identifies a person or an entity
- the round crop needs to keep the name as alternative text

**Avoid when**

- it is a content image and not an identity; use ImageFrame

Alternatives: `Avatar.initials`, `ImageFrame`.

- React: `import { Avatar } from "@skryensya/react/avatar"`.
- HTML: a `<span>`, no JavaScript needed.

- Requires the options: `imageName`, `src`.

**Options**

| Option | Values | Default |
|---|---|---|
| `size` | "sm" \| "md" \| "lg" \| "xl" | `"md"` |
| `appearance` | "plain" \| "brutalist" | `"plain"` |
| `imageName` (React: `name`) | string |  |
| `src` | string |  |
| `srcSet` | string |  |
| `sizes` | string |  |
| `loading` | "eager" \| "lazy" | `"lazy"` |
| `decoding` | "async" \| "auto" \| "sync" | `"async"` |
| `fetchPriority` | "high" \| "low" \| "auto" |  |

**Example** (canonical tree `avatar/image`; its copy is placeholder, replace it)

```tsx
import { Avatar } from "@skryensya/react/avatar";

export function AvatarExample() {
  return (
    <Avatar
      name="Foto de perfil de Ada Lovelace"
      src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
    />
  );
}
```

```html
<span class="sk-avatar" data-size="md" data-appearance="plain">
  <span
    class="sk-image-frame"
    data-aspect="1/1"
    data-fit="cover"
    data-position="center"
    data-radius="pill"
    data-border="none"
    data-appearance="plain"
  >
    <img
      class="sk-image-frame__media"
      alt="Foto de perfil de Ada Lovelace"
      src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2018%22%3E%3Crect%20width%3D%2232%22%20height%3D%2218%22%20fill%3D%22%234a5568%22%2F%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%225%22%20r%3D%223%22%20fill%3D%22%23f6e05e%22%2F%3E%3Cpath%20d%3D%22M0%2018%20L10%208%20L18%2018%20Z%22%20fill%3D%22%232d3748%22%2F%3E%3C%2Fsvg%3E"
      loading="lazy"
      decoding="async"
    >
  </span>
</span>
```

Stylesheets: `@skryensya/core/components/avatar.css`, `@skryensya/core/patterns/image-frame.css`.

## AvatarGroup

**Use when**

- several identities are shown together in a compact stack
- the visible overflow is summarized with a count

**Avoid when**

- each person needs a visible name, detail or action; use List

Alternatives: `List`.

- React: `import { AvatarGroup } from "@skryensya/react/avatar"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Avatar.initials`, `Avatar.image` | yes |
| `overflow` | text |  |

**Example** (canonical tree `avatar/group`; its copy is placeholder, replace it)

```tsx
import { Avatar, AvatarGroup } from "@skryensya/react/avatar";

export function AvatarGroupExample() {
  return (
    <AvatarGroup label="Revisores" overflow="+3">
      <Avatar name="Ada Lovelace">AL</Avatar>
      <Avatar name="Grace Hopper">GH</Avatar>
    </AvatarGroup>
  );
}
```

```html
<div class="sk-avatar-group" aria-label="Revisores" role="group">
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
    class="sk-avatar"
    data-size="md"
    data-appearance="plain"
    aria-label="Grace Hopper"
    role="img"
  >
    <span class="sk-avatar__fallback" aria-hidden="true">GH</span>
  </span>
  <span class="sk-avatar-group__overflow">+3</span>
</div>
```

Stylesheets: `@skryensya/core/components/avatar.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-avatar-bg`, `--sk-avatar-brutalist-edge`, `--sk-avatar-brutalist-offset-block`, `--sk-avatar-brutalist-offset-inline`, `--sk-avatar-brutalist-shadow`, `--sk-avatar-fg`, `--sk-avatar-group-ring`, `--sk-avatar-size`.
