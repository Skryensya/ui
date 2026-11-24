# sidebar

Category: navigation. Stylesheet: `@skryensya/core/components/sidebar.css`. Signatures: `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarHeader`, `SidebarResizeHandle`, `SidebarSeparator`, `SidebarTrigger`.

## Sidebar

**Use when**

- an application's main navigation lives on the side and stays for the whole session
- there are many sections and they should be visible without opening anything
- a panel of details or properties sits beside the work area on the end edge (an inspector); that is a Sidebar with side end, written after the Main in an AppShell

**Avoid when**

- it is a content site with a few sections; that is a Navbar
- it appears over the content and closes on choosing; that is a Drawer / Vaul

Alternatives: `Navbar`, `Vaul`.

- React: `import { Sidebar } from "@skryensya/react/sidebar"`.
- HTML: a `<aside>` with `data-sk-sidebar`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `defaultCollapsed` | boolean | `false` |
| `storageKey` | string |  |
| `minInlineSize` | string |  |
| `maxInlineSize` | string |  |
| `landmarkLabel` | string |  |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |
| `side` | "start" \| "end" | `"start"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarSeparator`, `SidebarTrigger`, `SidebarResizeHandle` | yes |

**Example** (canonical tree `sidebar/collapsible-shell`; its copy is placeholder, replace it)

```tsx
import { Icon } from "@skryensya/react/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarResizeHandle,
  SidebarSeparator,
  SidebarTrigger,
} from "@skryensya/react/sidebar";
import { type CSSProperties } from "react";

export function SidebarExample() {
  return (
    <Sidebar
      maxInlineSize="18rem"
      style={{ "--sk-sidebar-max-inline-size": "18rem" } as CSSProperties}
    >
      <SidebarResizeHandle label="Cambiar el ancho de la barra" />
      <SidebarHeader>
        <SidebarTrigger label="Angostar la barra" icon={<Icon name="menu" />} />
      </SidebarHeader>
      <SidebarContent>Proyectos</SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>John Doe</SidebarFooter>
    </Sidebar>
  );
}
```

```html
<aside
  class="sk-sidebar"
  data-sk-sidebar
  data-appearance="plain"
  data-side="start"
  style="--sk-sidebar-max-inline-size: 18rem;"
>
  <div
    class="sk-sidebar__resize-handle sk-splitter"
    data-sk-sidebar-resize
    aria-label="Cambiar el ancho de la barra"
    role="separator"
    aria-orientation="vertical"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="50"
    tabindex="0"
  >
    <span class="sk-sidebar__resize-grip sk-grip" aria-hidden="true"></span>
  </div>
  <div class="sk-sidebar__header">
    <button
      class="sk-sidebar__trigger sk-interactive"
      data-sk-sidebar-trigger
      aria-label="Angostar la barra"
      type="button"
    >
      <span data-sk-icon="menu" data-sk-icon-size="md"></span>
    </button>
  </div>
  <div class="sk-sidebar__content" data-sk-sidebar-content>Proyectos</div>
  <hr class="sk-sidebar__separator">
  <div class="sk-sidebar__footer">John Doe</div>
</aside>
```

Stylesheets: `@skryensya/core/components/sidebar.css`, `@skryensya/core/patterns/icon.css`, `@skryensya/core/patterns/splitter.css`.

## SidebarContent

**Use when**

- it is the middle that scrolls; the NavList goes in here

**Avoid when**

- it has to stay fixed while scrolling; that is the header or the footer

- React: `import { SidebarContent } from "@skryensya/react/sidebar"`.
- HTML: a `<div>` with `data-sk-sidebar-content`, enhanced by Vanilla's mount.

- Goes inside: `Sidebar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## SidebarFooter

**Use when**

- the account, the color mode, or whatever is rarely used and always looked for goes at the bottom

**Avoid when**

- it is one more destination; that goes in the list

- React: `import { SidebarFooter } from "@skryensya/react/sidebar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Sidebar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## SidebarHeader

**Use when**

- the brand, the workspace name or the trigger goes at the top

**Avoid when**

- it is part of the list of destinations; that goes in SidebarContent

- React: `import { SidebarHeader } from "@skryensya/react/sidebar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Sidebar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## SidebarResizeHandle

**Use when**

- the right width is decided by each person's content: long paths, a deep tree, file names
- an intermediate width is needed, not only narrow or wide
- the list has sublevels or destinations with no icon of their own: no icon rail is possible, so the only way to gain width is narrowing without hiding anything

**Avoid when**

- the list of destinations is fixed and known; there the width is a design decision, not the reader's
- the aim is getting it out of the way; that is what SidebarTrigger is for, which narrows it to a rail

Alternatives: `SidebarTrigger`.

- React: `import { SidebarResizeHandle } from "@skryensya/react/sidebar"`.
- HTML: a `<div>` with `data-sk-sidebar-resize`, enhanced by Vanilla's mount.

- Goes inside: `Sidebar`.
- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |

## SidebarSeparator

**Use when**

- two groups of destinations have to be separated and the break is part of the information

**Avoid when**

- only room between items is wanted; that is spacing, not a separator

- React: `import { SidebarSeparator } from "@skryensya/react/sidebar"`.
- HTML: a `<hr>`, no JavaScript needed.

- Goes inside: `Sidebar`.

## SidebarTrigger

**Use when**

- the person has to be able to narrow the bar to gain content width
- the list has ONE level and each destination has its own icon: collapsed, only the icons remain, so without them (or without that single level) the rail says nothing

**Avoid when**

- it is expected to hide the bar; it narrows, it never hides
- the list has sublevels (nested groups, a file tree): there is no one row per level to show in an icon rail; narrow it with SidebarResizeHandle instead
- some destination has no icon of its own; a collapsed rail with gaps is worse than one that does not collapse

Alternatives: `SidebarResizeHandle`.

- React: `import { SidebarTrigger } from "@skryensya/react/sidebar"`.
- HTML: a `<button>` with `data-sk-sidebar-trigger`, enhanced by Vanilla's mount.

- Goes inside: `Sidebar`, `SidebarHeader`, `SidebarFooter`.
- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `floating` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `icon` | one of `Icon` |  |

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:sidebarcollapsedchange` | `onCollapsedChange` | { collapsed: boolean } |
| `sk:sidebarresizechange` | `onResizeChange` | { inlineSize: number } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-sidebar-bg`, `--sk-sidebar-border-color`, `--sk-sidebar-border-width`, `--sk-sidebar-brutalist-offset`, `--sk-sidebar-collapsed-inline-size`, `--sk-sidebar-duration`, `--sk-sidebar-easing`, `--sk-sidebar-elevation`, `--sk-sidebar-expanded-inline-size`, `--sk-sidebar-fg`, `--sk-sidebar-footer-fg`, `--sk-sidebar-footer-font-size`, `--sk-sidebar-header-gap`, `--sk-sidebar-header-min-height`, `--sk-sidebar-inline-size`, `--sk-sidebar-max-inline-size`, `--sk-sidebar-min-inline-size`, `--sk-sidebar-padding`, `--sk-sidebar-padding-block`, `--sk-sidebar-padding-inline`, `--sk-sidebar-resize-active-color`, `--sk-sidebar-resize-color`, `--sk-sidebar-resize-hit`, `--sk-sidebar-resize-line`, `--sk-sidebar-separator-color`, `--sk-sidebar-trigger-fg`, `--sk-sidebar-trigger-offset-block`, `--sk-sidebar-trigger-offset-inline`, `--sk-sidebar-trigger-radius`, `--sk-sidebar-trigger-shadow`, `--sk-sidebar-trigger-size`, `--sk-sidebar-trigger-wash`, `--sk-splitter-active-color`, `--sk-splitter-color`, `--sk-splitter-hit`, `--sk-splitter-line`, `--sk-splitter-rest-color`.
