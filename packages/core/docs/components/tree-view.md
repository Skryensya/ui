# tree-view

Category: navigation. Stylesheet: `@skryensya/core/components/tree-view.css`. Signatures: `TreeView`.

## TreeView

**Use when**

- the data truly nests and the hierarchy is part of what has to be understood
- branches have to open and close without losing sight of where you are
- a file explorer, an org chart, categories to choose from

**Avoid when**

- there is a single level; that is a List or a NavList
- there are two fixed, known levels; a NavList with groups reads better
- each hierarchical row also has columns (size, date, owner); that is a Treegrid
- they are links to navigate the site or the page; a role=tree is not navigation: that is NavList or Toc

Alternatives: `NavList`, `List`, `Treegrid`, `Toc`.

- React: `import { TreeView } from "@skryensya/react/tree-view"`.
- HTML: a `<div>` with `data-sk-tree-view`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `selectionMode` | "single" \| "multiple" | `"single"` |
| `defaultExpandedValue` | string |  |
| `defaultSelectedValue` | string |  |
| `collapsible` | boolean | `true` |
| `wrap` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `branchIndicator` | node |  |
| `branchIcon` | node |  |
| `leafIcon` | node |  |
| `items` (React: `nodes`) | a list of items (below) | yes |

Each item in `items`, keyed by `id`: `id` (string), `disabled` (boolean), `label` (text, required), `children` (items).

**Example** (canonical tree `tree-view/nested-folders`; its copy is placeholder, replace it)

```tsx
import { Icon } from "@skryensya/react/icon";
import { TreeView } from "@skryensya/react/tree-view";
import { nodes } from "./tree-view-nodes";

export function TreeViewExample() {
  return (
    <TreeView
      label="Archivos del proyecto"
      branchIcon={<Icon name="folder" size="sm" />}
      leafIcon={<Icon name="file" size="sm" />}
      nodes={nodes}
    />
  );
}
```

`tree-view-nodes.ts`:

```ts
export const nodes = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "componentes",
        label: "componentes",
        children: [{ id: "boton.ts", label: "boton.ts" }],
      },
      { id: "indice.ts", label: "indice.ts" },
    ],
  },
  { id: "leeme.md", label: "leeme.md" },
];
```

```html
<div
  class="sk-tree-view"
  data-sk-tree-view
  aria-label="Archivos del proyecto"
  data-selection-mode="single"
>
  <ul class="sk-tree-view__tree" data-sk-tree-view-tree>
    <li
      class="sk-tree-view__branch"
      data-sk-tree-view-branch
      data-value="src"
    >
      <button
        class="sk-tree-view__branch-control sk-interactive"
        data-sk-tree-view-branch-control
        type="button"
      >
        <span
          class="sk-tree-view__branch-indicator"
          data-sk-tree-view-branch-indicator
          aria-hidden="true"
        ></span>
        <span class="sk-tree-view__branch-icon" aria-hidden="true">
          <span data-sk-icon="folder" data-sk-icon-size="sm"></span>
        </span>
        <span
          class="sk-tree-view__branch-text"
          data-sk-tree-view-branch-text
        >
          src
        </span>
      </button>
      <ul
        class="sk-tree-view__branch-content"
        data-sk-tree-view-branch-content
      >
        <li
          class="sk-tree-view__branch"
          data-sk-tree-view-branch
          data-value="componentes"
        >
          <button
            class="sk-tree-view__branch-control sk-interactive"
            data-sk-tree-view-branch-control
            type="button"
          >
            <span
              class="sk-tree-view__branch-indicator"
              data-sk-tree-view-branch-indicator
              aria-hidden="true"
            ></span>
            <span class="sk-tree-view__branch-icon" aria-hidden="true">
              <span data-sk-icon="folder" data-sk-icon-size="sm"></span>
            </span>
            <span
              class="sk-tree-view__branch-text"
              data-sk-tree-view-branch-text
            >
              componentes
            </span>
          </button>
          <ul
            class="sk-tree-view__branch-content"
            data-sk-tree-view-branch-content
          >
            <li
              class="sk-tree-view__item sk-interactive"
              data-sk-tree-view-item
              data-value="boton.ts"
            >
              <span class="sk-tree-view__item-icon" aria-hidden="true">
                <span data-sk-icon="file" data-sk-icon-size="sm"></span>
              </span>
              <span
                class="sk-tree-view__item-text"
                data-sk-tree-view-item-text
              >
                boton.ts
              </span>
            </li>
          </ul>
        </li>
        <li
          class="sk-tree-view__item sk-interactive"
          data-sk-tree-view-item
          data-value="indice.ts"
        >
          <span class="sk-tree-view__item-icon" aria-hidden="true">
            <span data-sk-icon="file" data-sk-icon-size="sm"></span>
          </span>
          <span
            class="sk-tree-view__item-text"
            data-sk-tree-view-item-text
          >
            indice.ts
          </span>
        </li>
      </ul>
    </li>
    <li
      class="sk-tree-view__item sk-interactive"
      data-sk-tree-view-item
      data-value="leeme.md"
    >
      <span class="sk-tree-view__item-icon" aria-hidden="true">
        <span data-sk-icon="file" data-sk-icon-size="sm"></span>
      </span>
      <span class="sk-tree-view__item-text" data-sk-tree-view-item-text>
        leeme.md
      </span>
    </li>
  </ul>
</div>
```

Stylesheets: `@skryensya/core/components/tree-view.css`, `@skryensya/core/patterns/icon.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:treeviewselectionchange` | `onSelectionChange` | { selectedValue: string[] } |
| `sk:treeviewexpandedchange` | `onExpandedChange` | { expandedValue: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-tree-branch-icon-color`, `--sk-tree-guide-color`, `--sk-tree-guide-width`, `--sk-tree-indent`, `--sk-tree-indicator-color`, `--sk-tree-indicator-size`, `--sk-tree-item-gap`, `--sk-tree-leaf-icon-color`, `--sk-tree-node-icon-color`, `--sk-tree-node-icon-size`, `--sk-tree-row-gap`, `--sk-tree-row-inset`.
