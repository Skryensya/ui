# layout

Category: layout. Stylesheet: `@skryensya/core/patterns/layout.css`. Signatures: `AppShell`, `Grid`, `Inline`, `LayoutGrid`, `Main`, `Stack`.

## AppShell

**Use when**

- the page is an application: a header across the top, a rail (Sidebar) down the side and a work area (Main) filling the rest
- the page is a whole document or site page: a Navbar, a Main and a Footer that stays on the floor of a short page, with no rail
- a dashboard, a mail client, a chat or a settings area: anything with persistent navigation around a changing region
- the header and the rails should stay put while only the work area scrolls (a mail client, a chat, an editor); that is scroll regions
- a second panel sits on the end edge (an inspector, a detail pane): a Sidebar with side end after the Main
- the rails must still reach a phone: below the expanded line they are not drawn, so a Vaul.drawer child of the AppShell carries the same navigation, opened by a Vaul.Trigger the header shows in an Inline with show compact

**Avoid when**

- the region is a card or a panel inside a page; that is Box
- it is nested inside another AppShell or a Main: a page has one frame

Alternatives: `Stack`, `Wrapper`, `LayoutGrid`.

- React: `import { AppShell } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `shellHeight` (React: `height`) | "screen" \| "fit" |  |
| `scroll` | "page" \| "regions" |  |
| `stickyHeader` | boolean | `false` |
| `sidebarPersistent` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `SkipLink`, `Navbar`, `AppBar`, `Sidebar`, `Main`, `Footer`, `Vaul.drawer` | yes |

**Example** (canonical tree `layout/app-shell`; its copy is placeholder, replace it)

```tsx
import { Icon } from "@skryensya/react/icon";
import { AppShell, Main } from "@skryensya/react/layout";
import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";
import { Navbar, NavbarBrand } from "@skryensya/react/navbar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarResizeHandle,
  SidebarTrigger,
} from "@skryensya/react/sidebar";
import { Heading, Text } from "@skryensya/react/typography";
import { Drawer } from "@skryensya/react/vaul";

export function AppShellExample() {
  return (
    <AppShell>
      <Navbar>
        <NavbarBrand>Northstar</NavbarBrand>
      </Navbar>
      <Sidebar landmarkLabel="Workspace">
        <SidebarHeader>
          <SidebarTrigger
            label="Collapse the sidebar"
            icon={<Icon name="chevron-left" />}
          />
        </SidebarHeader>
        <SidebarContent>
          <NavList aria-label="Workspace">
            <NavListGroup>
              <NavListLink href="#overview" current>Overview</NavListLink>
            </NavListGroup>
          </NavList>
        </SidebarContent>
      </Sidebar>
      <Main paddingBlock="md" paddingBlockExpanded="lg">
        <Heading size="h2" as="h1">Overview</Heading>
      </Main>
      <Sidebar landmarkLabel="Details" side="end">
        <SidebarContent>
          <Text>Inspector</Text>
        </SidebarContent>
        <SidebarResizeHandle label="Resize the inspector" />
      </Sidebar>
      <Drawer label="Workspace" id="app-shell-menu">
        <Text>Overview</Text>
      </Drawer>
    </AppShell>
  );
}
```

```html
<div class="sk-app-shell">
  <header class="sk-navbar" data-appearance="plain">
    <div class="sk-navbar__brand">Northstar</div>
  </header>
  <aside
    class="sk-sidebar"
    data-sk-sidebar
    data-appearance="plain"
    aria-label="Workspace"
    data-side="start"
  >
    <div class="sk-sidebar__header">
      <button
        class="sk-sidebar__trigger sk-interactive"
        data-sk-sidebar-trigger
        aria-label="Collapse the sidebar"
        type="button"
      >
        <span data-sk-icon="chevron-left" data-sk-icon-size="md"></span>
      </button>
    </div>
    <div class="sk-sidebar__content" data-sk-sidebar-content>
      <nav
        class="sk-nav-list"
        data-orientation="vertical"
        aria-label="Workspace"
      >
        <div class="sk-nav-list__group">
          <ul class="sk-nav-list__list" role="list">
            <li class="sk-nav-list__item">
              <a
                class="sk-nav-list__link sk-interactive"
                href="#overview"
                aria-current="page"
              >
                <span class="sk-nav-list__label">Overview</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
  <main
    class="sk-main"
    data-padding-block="md"
    data-padding-block-expanded="lg"
  >
    <h1 class="sk-heading" data-size="h2">Overview</h1>
  </main>
  <aside
    class="sk-sidebar"
    data-sk-sidebar
    data-appearance="plain"
    aria-label="Details"
    data-side="end"
  >
    <div class="sk-sidebar__content" data-sk-sidebar-content>
      <p
        class="sk-text"
        data-tone="primary"
        data-size="body"
        data-weight="body"
      >
        Inspector
      </p>
    </div>
    <div
      class="sk-sidebar__resize-handle sk-splitter"
      data-sk-sidebar-resize
      aria-label="Resize the inspector"
      role="separator"
      aria-orientation="vertical"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="50"
      tabindex="0"
    >
      <span class="sk-sidebar__resize-grip sk-grip" aria-hidden="true"></span>
    </div>
  </aside>
  <dialog
    class="sk-vaul sk-drawer"
    data-sk-vaul
    data-appearance="plain"
    data-edge="block-end"
    aria-label="Workspace"
    id="app-shell-menu"
    data-dismiss-threshold="0.4"
  >
    <div class="sk-vaul__handle" aria-hidden="true" data-part="handle"></div>
    <p
      class="sk-text"
      data-tone="primary"
      data-size="body"
      data-weight="body"
    >
      Overview
    </p>
  </dialog>
</div>
```

Stylesheets: `@skryensya/core/components/navbar.css`, `@skryensya/core/components/sidebar.css`, `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/icon.css`, `@skryensya/core/patterns/layout.css`, `@skryensya/core/patterns/nav-list.css`, `@skryensya/core/patterns/splitter.css`, `@skryensya/core/patterns/vaul.css`.

## Grid

**Use when**

- equal-width columns: a grid of cards
- a responsive grid whose column ceiling is columns
- uneven columns in fixed proportions (two thirds and one third, a quarter and the rest): columns 3 or 4 and a child with data-span

**Avoid when**

- the widths follow each item's content rather than a proportion; that is an Inline
- the page needs named measures (narrow/content/breakout/rail); that is LayoutGrid

Alternatives: `Inline`, `LayoutGrid`.

- React: `import { Grid } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `gap` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "section" | `"md"` |
| `gapExpanded` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "section" |  |
| `columns` | "1" \| "2" \| "3" \| "4" \| "5" | `"1"` |
| `multicol` | boolean | `false` |
| `responsive` | boolean | `false` |
| `minColumn` | "sm" \| "md" \| "lg" |  |
| `align` | "start" \| "center" \| "end" \| "stretch" |  |
| `show` | "compact" \| "expanded" |  |
| `layoutElement` (React: `as`) | "div" \| "section" \| "article" \| "aside" \| "header" \| "footer" \| "nav" \| "main" | `"div"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Inline

**Use when**

- things go side by side: a row of buttons, a label with its value
- a row of actions is the last thing in a card and should sit on the floor when neighbouring cards grow; that is blockStart auto, not a second component called button-wrapper
- the links of a header give way to a menu button on a phone: the links in an Inline with show expanded, the Vaul.Trigger in one with show compact

**Avoid when**

- they are equal-width columns; that is a Grid
- the empty state, the dialog or the toolbar already has its own actions part; do not replace that anatomy with an Inline

Alternatives: `Grid`, `Stack`.

- React: `import { Inline } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `gap` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "section" | `"md"` |
| `gapExpanded` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "section" |  |
| `inlineAlign` (React: `align`) | "start" \| "center" \| "end" \| "baseline" \| "stretch" | `"end"` |
| `justify` | "start" \| "center" \| "end" \| "between" | `"start"` |
| `wrap` | boolean | `true` |
| `equal` | boolean | `false` |
| `blockStart` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "auto" | `"none"` |
| `show` | "compact" \| "expanded" |  |
| `layoutElement` (React: `as`) | "div" \| "section" \| "article" \| "aside" \| "header" \| "footer" \| "nav" \| "main" | `"div"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `layout/inline-row`; its copy is placeholder, replace it)

```tsx
import { Badge } from "@skryensya/react/badge";
import { Inline } from "@skryensya/react/layout";
import { Text } from "@skryensya/react/typography";

export function InlineExample() {
  return (
    <Inline gap="sm" justify="between">
      <Text>Plan anual</Text>
      <Badge tone="success">Activo</Badge>
    </Inline>
  );
}
```

```html
<div
  class="sk-inline"
  data-gap="sm"
  data-align="end"
  data-justify="between"
  data-wrap="true"
  data-block-start="none"
>
  <p
    class="sk-text"
    data-tone="primary"
    data-size="body"
    data-weight="body"
  >
    Plan anual
  </p>
  <span
    class="sk-badge"
    data-appearance="plain"
    data-tone="success"
    data-size="md"
  >
    Activo
  </span>
</div>
```

Stylesheets: `@skryensya/core/components/badge.css`, `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/layout.css`.

## LayoutGrid

**Use when**

- a page needs a reading measure and some children should be narrower, break out or bleed edge to edge
- a full-width section should keep its content centered without an extra wrapper
- the page carries a supporting rail (TOC, contextual navigation): a direct child with data-width="rail" (after the content) or data-width="rail-start" (before), or both: not a content span like narrow/breakout, but a separate column the same grid reserves beside the flow, separated from it only by --sk-layout-rail-gap

**Avoid when**

- every child shares a single width ceiling; Wrapper is simpler
- cards are spread over equal columns; that is Grid

Alternatives: `Wrapper`, `Grid`.

- React: `import { LayoutGrid } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `layoutElement` (React: `as`) | "div" \| "section" \| "article" \| "aside" \| "header" \| "footer" \| "nav" \| "main" | `"div"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `layout/grid`; its copy is placeholder, replace it)

```tsx
import { LayoutGrid } from "@skryensya/react/layout";
import { Text } from "@skryensya/react/typography";

export function LayoutGridExample() {
  return (
    <LayoutGrid>
      <Text>Contenido con medida por defecto.</Text>
    </LayoutGrid>
  );
}
```

```html
<div class="sk-layout-grid">
  <p
    class="sk-text"
    data-tone="primary"
    data-size="body"
    data-weight="body"
  >
    Contenido con medida por defecto.
  </p>
</div>
```

Stylesheets: `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/layout.css`.

## Main

**Use when**

- the region is the page's <main> landmark: the work area of an application or a template
- the work area needs breathing room above and below its content; that is paddingBlock, while the inline gutter stays the Wrapper's

**Avoid when**

- it is a section inside the page, not the main landmark; use Box, Stack or LayoutGrid as appropriate

Alternatives: `Box`, `Stack`, `LayoutGrid`.

- React: `import { Main } from "@skryensya/react/layout"`.
- HTML: a `<main>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `paddingBlock` | "none" \| "sm" \| "md" \| "lg" \| "xl" \| "section" |  |
| `paddingBlockExpanded` | "none" \| "sm" \| "md" \| "lg" \| "xl" \| "section" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

**Example** (canonical tree `layout/main`; its copy is placeholder, replace it)

```tsx
import { Main } from "@skryensya/react/layout";
import { Heading } from "@skryensya/react/typography";

export function MainExample() {
  return (
    <Main paddingBlock="lg">
      <Heading size="h2">Panel</Heading>
    </Main>
  );
}
```

```html
<main class="sk-main" data-padding-block="lg">
  <h2 class="sk-heading" data-size="h2">Panel</h2>
</main>
```

Stylesheets: `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/layout.css`.

## Stack

**Use when**

- things go one below another with a steady rhythm
- it is a form's default arrangement
- the bands of a page are spaced apart; that is gap section
- its content should sit in the middle of the height it was given (a sign-in form in the work area) or send its last child to the floor; that is justify center or between
- a group exists only on a phone or only on a wide screen; that is show compact or show expanded

**Avoid when**

- they go side by side; that is Inline
- they need equal-width columns; that is Grid
- they need a surface (padding/border/background); that is Box around it, not Stack

Alternatives: `Inline`, `Grid`, `Box`.

- React: `import { Stack } from "@skryensya/react/layout"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `gap` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "section" | `"md"` |
| `gapExpanded` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "section" |  |
| `align` | "start" \| "center" \| "end" \| "stretch" |  |
| `stackJustify` (React: `justify`) | "start" \| "center" \| "end" \| "between" |  |
| `show` | "compact" \| "expanded" |  |
| `layoutElement` (React: `as`) | "div" \| "section" \| "article" \| "aside" \| "header" \| "footer" \| "nav" \| "main" | `"div"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `layout/stack`; its copy is placeholder, replace it)

```tsx
import { Stack } from "@skryensya/react/layout";
import { Text } from "@skryensya/react/typography";

export function StackExample() {
  return (
    <Stack gap="sm">
      <Text>Primero</Text>
      <Text>Segundo</Text>
    </Stack>
  );
}
```

```html
<div class="sk-stack" data-gap="sm">
  <p
    class="sk-text"
    data-tone="primary"
    data-size="body"
    data-weight="body"
  >
    Primero
  </p>
  <p
    class="sk-text"
    data-tone="primary"
    data-size="body"
    data-weight="body"
  >
    Segundo
  </p>
</div>
```

Stylesheets: `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/layout.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-app-shell-block-size`, `--sk-app-shell-gap`, `--sk-grid-columns`, `--sk-grid-gap`, `--sk-inline-block-start`, `--sk-inline-gap`, `--sk-layout-breakout`, `--sk-layout-breakout-track`, `--sk-layout-content`, `--sk-layout-gutter`, `--sk-layout-narrow`, `--sk-layout-narrow-track`, `--sk-layout-rail-gap`, `--sk-layout-rail-inline-size`, `--sk-layout-rail-row-span`, `--sk-main-padding-block`, `--sk-stack-gap`.
