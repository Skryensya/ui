# toolbar

Category: actions. Stylesheet: `@skryensya/core/components/toolbar.css`. Signatures: `Toolbar`, `ToolbarGroup`, `ToolbarSeparator`.

## Toolbar

**Use when**

- there are many controls together and the keyboard should not pay one stop for each
- a Segmented or Tabs can go inside: the bar counts each as a single stop

**Avoid when**

- they are two or three loose buttons; an Inline is enough there
- the controls are the site's navigation links; that is NavList or Navbar, not a toolbar

Alternatives: `Inline`, `NavList`.

- React: `import { Toolbar } from "@skryensya/react/toolbar"`.
- HTML: a `<div>` with `data-sk-toolbar`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `orientation` | "horizontal" \| "vertical" | `"horizontal"` |
| `label` | string |  |
| `loopFocus` | boolean | `true` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |
| `justify` | "start" \| "center" \| "end" \| "between" | `"start"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `toolbar/two-groups`; its copy is placeholder, replace it)

```tsx
import { Button } from "@skryensya/react/button";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@skryensya/react/toolbar";

export function ToolbarExample() {
  return (
    <Toolbar label="Formato">
      <ToolbarGroup>
        <Button variant="ghost" size="sm">Negrita</Button>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <Button variant="ghost" size="sm">Alinear</Button>
      </ToolbarGroup>
    </Toolbar>
  );
}
```

```html
<div
  class="sk-toolbar"
  data-sk-toolbar
  data-orientation="horizontal"
  aria-orientation="horizontal"
  data-appearance="plain"
  aria-label="Formato"
  data-justify="start"
  role="toolbar"
>
  <div class="sk-toolbar__group" role="group">
    <button
      class="sk-button sk-interactive"
      data-sk-button
      data-variant="ghost"
      data-tone="neutral"
      data-appearance="plain"
      data-size="sm"
      type="button"
    >
      <span class="sk-button__label">Negrita</span>
      <span class="sk-button__loader sk-loader" aria-hidden="true"></span>
    </button>
  </div>
  <span class="sk-toolbar__separator" aria-hidden="true"></span>
  <div class="sk-toolbar__group" role="group">
    <button
      class="sk-button sk-interactive"
      data-sk-button
      data-variant="ghost"
      data-tone="neutral"
      data-appearance="plain"
      data-size="sm"
      type="button"
    >
      <span class="sk-button__label">Alinear</span>
      <span class="sk-button__loader sk-loader" aria-hidden="true"></span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/loader.css`, `@skryensya/core/components/toolbar.css`.

## ToolbarGroup

**Use when**

- a subset of controls that belong together; with groupLabel when the bar has more than one kind of group

- React: `import { ToolbarGroup } from "@skryensya/react/toolbar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Toolbar`.

**Options**

| Option | Values | Default |
|---|---|---|
| `groupLabel` (React: `label`) | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## ToolbarSeparator

**Use when**

- two groups have to be separated visually

- React: `import { ToolbarSeparator } from "@skryensya/react/toolbar"`.
- HTML: a `<span>`, no JavaScript needed.

- Goes inside: `Toolbar`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-toolbar-bg`, `--sk-toolbar-border-color`, `--sk-toolbar-border-width`, `--sk-toolbar-brutalist-offset`, `--sk-toolbar-depth`, `--sk-toolbar-gap`, `--sk-toolbar-padding`, `--sk-toolbar-radius`, `--sk-toolbar-separator-color`.
