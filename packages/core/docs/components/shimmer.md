# shimmer

Category: content. Stylesheet: `@skryensya/core/components/shimmer.css`. Signatures: `Shimmer`.

## Shimmer

**Use when**

- temporary status text should feel alive while work is happening, such as generating or reading
- the text itself remains present and readable; only the highlight moves across it

**Avoid when**

- the absent content shape needs to be reserved; use Placeholder
- the wait state needs a standalone progress indicator; use Loader
- the effect would run on permanent body copy or decoration

Alternatives: `Placeholder`, `Loader`.

- React: `import { Shimmer } from "@skryensya/react/shimmer"`.
- HTML: a `<span>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `color` | string |  |
| `duration` | string |  |
| `spread` | string |  |
| `angle` | string |  |
| `once` | boolean | `false` |
| `reverse` | boolean | `false` |
| `active` | boolean | `true` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

**Example** (canonical tree `shimmer/status`; its copy is placeholder, replace it)

```tsx
import { Shimmer } from "@skryensya/react/shimmer";

export function ShimmerExample() {
  return <Shimmer>Thinking</Shimmer>;
}
```

```html
<span class="sk-shimmer">Thinking</span>
```

Stylesheets: `@skryensya/core/components/shimmer.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-shimmer-angle`, `--sk-shimmer-color`, `--sk-shimmer-duration`, `--sk-shimmer-spread`, `--sk-shimmer-text-fill`.
