# toc

Category: navigation. Stylesheet: `@skryensya/core/components/toc.css`. Signatures: `Toc`.

## Toc

**Use when**

- a long document has several sections (h2/h3) and the reader needs to jump between them
- which section is being read has to be visible while reading: the scroll-spy moves the "current"
- the title names the nav and heads the list, so it is always there ("On this page")

**Avoid when**

- the destinations are different pages, not sections of THIS page: that is NavList
- the document is short and fits on one screen: an index saves nothing there

Alternatives: `NavList`.

- React: `import { Toc } from "@skryensya/react/toc"`.
- HTML: a `<aside>` with `data-sk-toc`, enhanced by Vanilla's mount.

- Requires the options: `title`.

**Options**

| Option | Values | Default |
|---|---|---|
| `title` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` | a list of items (below) | yes |

Each item in `items`, keyed by `href`: `href` (string), `level` ("h2" \| "h3"), `current` (boolean), `children` (text, required), `icon` (node).

**Example** (canonical tree `toc/nested`; its copy is placeholder, replace it)

```tsx
import { Toc } from "@skryensya/react/toc";
import { items } from "./toc-items";

export function TocExample() {
  return <Toc title="En esta página" items={items} />;
}
```

`toc-items.ts`:

```ts
export const items = [
  { href: "#resumen", current: true, children: "Resumen" },
  { href: "#detalle", level: "h3", children: "Detalle" },
];
```

```html
<aside class="sk-toc" data-sk-toc>
  <nav class="sk-toc__nav" aria-label="En esta página">
    <h2 class="sk-toc__title">En esta página</h2>
    <ul class="sk-toc__list" role="list">
      <li class="sk-toc__item" data-level="h2">
        <a
          class="sk-toc__link sk-interactive"
          href="#resumen"
          aria-current="location"
        >
          <span class="sk-toc__label">Resumen</span>
        </a>
      </li>
      <li class="sk-toc__item" data-level="h3">
        <a class="sk-toc__link sk-interactive" href="#detalle">
          <span class="sk-toc__icon">
            <span data-sk-icon="info" data-sk-icon-size="sm"></span>
          </span>
          <span class="sk-toc__label">Detalle</span>
        </a>
      </li>
    </ul>
  </nav>
</aside>
```

Stylesheets: `@skryensya/core/components/toc.css`, `@skryensya/core/patterns/icon.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-toc-gutter`, `--sk-toc-indent`, `--sk-toc-inline-size`, `--sk-toc-marker-inline-size`, `--sk-toc-sticky-top`.
