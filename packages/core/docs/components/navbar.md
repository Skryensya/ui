# navbar

Category: navigation. Stylesheet: `@skryensya/core/components/navbar.css`. Signatures: `Navbar`, `NavbarActions`, `NavbarBrand`.

## Navbar

**Use when**

- the app needs a top bar with a brand and actions
- the site's links do not fit a phone: the NavList in an Inline with show expanded, and a Vaul.Trigger in an Inline with show compact that opens a Vaul.drawer holding the same links

**Avoid when**

- the navigation goes on the side; that is a Sidebar
- a multi-column category panel is needed; that is Megamenu
- a dense, ~24px application chrome bar (menus, undo, save state) is needed, not a page header; that is AppBar on its own, not inside a Navbar

Alternatives: `Sidebar`, `Megamenu`, `AppBar`.

- React: `import { Navbar } from "@skryensya/react/navbar"`.
- HTML: a `<header>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `NavbarBrand`, `NavbarActions`, `NavList`, `Megamenu`, `Inline` | yes |

**Example** (canonical tree `navbar/brand-and-actions`; its copy is placeholder, replace it)

```tsx
import { Button } from "@skryensya/react/button";
import { Navbar, NavbarActions, NavbarBrand } from "@skryensya/react/navbar";

export function NavbarExample() {
  return (
    <Navbar>
      <NavbarBrand>Atlas</NavbarBrand>
      <NavbarActions>
        <Button variant="ghost" size="sm">Cuenta</Button>
      </NavbarActions>
    </Navbar>
  );
}
```

```html
<header class="sk-navbar" data-appearance="plain">
  <div class="sk-navbar__brand">Atlas</div>
  <div class="sk-navbar__actions">
    <button
      class="sk-button sk-interactive"
      data-sk-button
      data-variant="ghost"
      data-tone="neutral"
      data-appearance="plain"
      data-size="sm"
      type="button"
    >
      <span class="sk-button__label">Cuenta</span>
      <span class="sk-button__loader sk-loader" aria-hidden="true"></span>
    </button>
  </div>
</header>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/loader.css`, `@skryensya/core/components/navbar.css`.

## NavbarActions

**Use when**

- the actions at the end: account, notifications, theme

**Avoid when**

- they are the site's navigation destinations; that is NavList

- React: `import { NavbarActions } from "@skryensya/react/navbar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Navbar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## NavbarBrand

**Use when**

- the logo or the product name, usually linking to the home page

**Avoid when**

- it is a destination of the navigation list; that goes in NavList

- React: `import { NavbarBrand } from "@skryensya/react/navbar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Navbar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-navbar-actions-gap`, `--sk-navbar-bg`, `--sk-navbar-border-color`, `--sk-navbar-brand-fg`, `--sk-navbar-brand-font-size`, `--sk-navbar-brand-font-weight`, `--sk-navbar-brutalist-offset`, `--sk-navbar-elevation`, `--sk-navbar-fg`, `--sk-navbar-gap`, `--sk-navbar-min-height`, `--sk-navbar-padding-x`, `--sk-navbar-padding-y`, `--sk-navbar-wash`.
