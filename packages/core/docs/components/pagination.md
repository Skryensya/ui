# pagination

Category: navigation. Stylesheet: `@skryensya/core/components/pagination.css`. Signatures: `Pagination`.

## Pagination

**Use when**

- the results come in pages and it must be possible to jump to a particular one
- knowing how many pages there are matters: the total is part of the information

**Avoid when**

- the list is short and fits whole; paging adds a step that buys nothing
- the order is chronological and explored downward; there, loading more on reaching the end fits better
- the table already brings page size and row status; that is TablePager

Alternatives: `TablePager`, `Feed`.

- React: `import { Pagination } from "@skryensya/react/pagination"`.
- HTML: a `<nav>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `page` | number | `1` |
| `total` | number | `1` |
| `siblings` | number | `1` |
| `label` | string | `"Pagination"` |
| `previousLabel` | string | `"Previous page"` |
| `nextLabel` | string | `"Next page"` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Example** (canonical tree `pagination/middle-of-twelve`; its copy is placeholder, replace it)

```tsx
import { Pagination } from "@skryensya/react/pagination";

export function PaginationExample() {
  return <Pagination page={4} total={12} />;
}
```

```html
<nav class="sk-pagination" aria-label="Pagination" data-appearance="plain">
  <button
    class="sk-pagination__previous sk-interactive"
    aria-label="Previous page"
    type="button"
  >
    <span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span>
  </button>
  <button class="sk-pagination__item sk-interactive" type="button">
    1
  </button>
  <span class="sk-pagination__ellipsis" aria-hidden="true">…</span>
  <button class="sk-pagination__item sk-interactive" type="button">
    3
  </button>
  <button
    class="sk-pagination__item sk-interactive"
    aria-current="page"
    type="button"
  >
    4
  </button>
  <button class="sk-pagination__item sk-interactive" type="button">
    5
  </button>
  <span class="sk-pagination__ellipsis" aria-hidden="true">…</span>
  <button class="sk-pagination__item sk-interactive" type="button">
    12
  </button>
  <button
    class="sk-pagination__next sk-interactive"
    aria-label="Next page"
    type="button"
  >
    <span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span>
  </button>
</nav>
```

Stylesheets: `@skryensya/core/components/pagination.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:paginationpagechange` | `onPageChange` | { page: number } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-pagination-brutalist-offset`, `--sk-pagination-current-bg`, `--sk-pagination-current-border-color`, `--sk-pagination-current-fg`, `--sk-pagination-current-font-weight`, `--sk-pagination-current-highlight`, `--sk-pagination-current-ledge`, `--sk-pagination-current-shadow`, `--sk-pagination-current-wash`, `--sk-pagination-disabled-bg`, `--sk-pagination-disabled-border-color`, `--sk-pagination-disabled-fg`, `--sk-pagination-ellipsis-fg`, `--sk-pagination-gap`, `--sk-pagination-hit-size`, `--sk-pagination-item-bg`, `--sk-pagination-item-border-color`, `--sk-pagination-item-border-width`, `--sk-pagination-item-fg`, `--sk-pagination-item-font-size`, `--sk-pagination-item-font-weight`, `--sk-pagination-item-radius`, `--sk-pagination-item-shadow`, `--sk-pagination-item-size`, `--sk-pagination-item-wash`.
