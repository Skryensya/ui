# skip-link

Category: navigation. Stylesheet: `@skryensya/core/components/skip-link.css`. Signatures: `SkipLink`.

## SkipLink

**Use when**

- the page starts with chrome repeated on every page: brand, global navigation, search
- WCAG 2.4.1 has to be met: keyboard users need to skip that block
- it goes first in the document and is not seen until it takes focus
- there can be more than one; the first points at the content, which is what almost everyone came to read

**Avoid when**

- the target is not focusable: without tabindex="-1" the next Tab goes back to the chrome that was meant to be skipped
- something focusable comes before it: then that something is the block nobody can skip
- the target may not be on the page: a link to something that does not exist is a promise that cannot be kept
- it is a visible link inside the text; that is Link
- the aim is hiding text nobody will focus: that is the sk-visually-hidden class

Alternatives: `Link`.

- React: `import { SkipLink } from "@skryensya/react/skip-link"`.
- HTML: a `<a>`, no JavaScript needed.

- Requires the options: `href`.

**Options**

| Option | Values | Default |
|---|---|---|
| `href` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `skip-link/to-content`; its copy is placeholder, replace it)

```tsx
import { SkipLink } from "@skryensya/react/skip-link";

export function SkipLinkExample() {
  return <SkipLink href="#main-content">Ir al contenido</SkipLink>;
}
```

```html
<a class="sk-skip-link sk-interactive" href="#main-content">
  Ir al contenido
</a>
```

Stylesheets: `@skryensya/core/components/skip-link.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-skip-link-bg`, `--sk-skip-link-border-color`, `--sk-skip-link-fg`, `--sk-skip-link-font-size`, `--sk-skip-link-font-weight`, `--sk-skip-link-offset`, `--sk-skip-link-padding-block`, `--sk-skip-link-padding-inline`, `--sk-skip-link-radius`, `--sk-skip-link-shadow`, `--sk-skip-link-wash`, `--sk-skip-link-z`.
