# tag

Category: content. Stylesheet: `@skryensya/core/components/tag.css`. Signatures: `Tag`, `Tag.link`, `Tag.toggle`.

## Tag

**Use when**

- a label that classifies content: an applied filter, a facet, a keyword
- the user can remove it (removable), or it only names a topic in a list

**Avoid when**

- it is only a count or a system status nobody can touch; that is a Badge

Alternatives: `Badge`.

- React: `import { Tag } from "@skryensya/react/tag"`.
- HTML: a `<span>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "accent" | `"neutral"` |
| `removable` | boolean | `false` |
| `removeLabel` | string | `"Remove"` |
| `appearance` | "plain" \| "brutalist" | `"plain"` |
| `disabled` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Accessible name**

- The remove control is icon-only; each removable tag needs a distinct accessible name for the facet it clears. Give one of: `removeLabel`.

**Example** (canonical tree `tag/removable`; its copy is placeholder, replace it)

```tsx
import { Tag } from "@skryensya/react/tag";

export function TagExample() {
  return <Tag tone="accent" removable removeLabel="Quitar Diseño">Diseño</Tag>;
}
```

```html
<span
  class="sk-tag"
  data-appearance="plain"
  data-tone="accent"
  data-removable
>
  <span class="sk-tag__label">Diseño</span>
  <button
    class="sk-tag__remove sk-button sk-interactive"
    aria-label="Quitar Diseño"
    type="button"
    data-appearance="plain"
    data-variant="ghost"
    data-tone="neutral"
    data-size="sm"
    data-icon-only
    data-sk-button
  >
    <span data-sk-icon="close" data-sk-icon-size="md"></span>
  </button>
</span>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/tag.css`.

## Tag.link

**Use when**

- a label that navigates to a facet, a topic or a keyword

**Avoid when**

- it also has to be removable; a link tag is not dismissible because it cannot contain another button
- it is a link inside a sentence; that is Link

Alternatives: `Link`, `Button.navigation`.

- React: `import { Tag } from "@skryensya/react/tag"`.
- HTML: a `<a>`, no JavaScript needed.

- Requires the options: `href`.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "accent" | `"neutral"` |
| `href` | string |  |
| `appearance` | "plain" \| "brutalist" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `tag/link`; its copy is placeholder, replace it)

```tsx
import { Tag } from "@skryensya/react/tag";

export function TagExample() {
  return <Tag tone="accent" href="/topics/design">Diseño</Tag>;
}
```

```html
<a
  class="sk-tag sk-interactive"
  data-appearance="plain"
  data-tone="accent"
  href="/topics/design"
>
  <span class="sk-tag__label">Diseño</span>
</a>
```

Stylesheets: `@skryensya/core/components/tag.css`.

## Tag.toggle

**Use when**

- a choice chip the reader selects or deselects by clicking it: a filter they can turn on and off

**Avoid when**

- it also has to be removable or navigate; a toggle tag is a real button and cannot contain another button or be an anchor
- there are several mutually exclusive choices in one group; that is Segmented or a radio group, not a set of independent toggles

Alternatives: `Segmented`, `Checkbox`.

- React: `import { Tag } from "@skryensya/react/tag"`.
- HTML: a `<button>`, no JavaScript needed.

- Requires the options: `selected`.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "accent" | `"neutral"` |
| `selected` | boolean |  |
| `appearance` | "plain" \| "brutalist" | `"plain"` |
| `disabled` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `tag/toggle`; its copy is placeholder, replace it)

```tsx
import { Tag } from "@skryensya/react/tag";

export function TagExample() {
  return <Tag tone="accent">Diseño</Tag>;
}
```

```html
<button
  class="sk-tag sk-interactive"
  data-appearance="plain"
  data-tone="accent"
  aria-pressed="false"
  type="button"
>
  <span class="sk-tag__label">Diseño</span>
</button>
```

Stylesheets: `@skryensya/core/components/tag.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tagremove` | `onRemove` |  |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-tag-bg`, `--sk-tag-border`, `--sk-tag-fg`, `--sk-tag-gap`, `--sk-tag-height`, `--sk-tag-remove-size`.
