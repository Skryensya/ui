# footer

Category: layout. Stylesheet: `@skryensya/core/patterns/footer.css`. Signatures: `Footer`.

## Footer

**Use when**

- it closes the page: the final band that says "the page ends here", with secondary navigation, legal notice or credit
- the host is a document-level <footer>, which IS the contentinfo landmark without writing a role: never put role="contentinfo" by hand
- there is at most ONE document <footer> per page; a footer that truly belongs to an <article> is valid but stops being the landmark, and that is the composer's decision
- the anatomy is free, like Hero's: inside, compose with layout.Grid for the row of columns, nav-list.NavList for each column (with its own accessible name), typography.Text for the legal notice, wrapper.Wrapper to hold the page's measure
- by default surface="sunken" and divider (a top border) on: a footer sharing the page's background reads as "more content", which is the one thing a footer is not

**Avoid when**

- a section only needs separating from the rest with padding or a border mid-page; that is a Box
- it is an action bar stuck to the bottom of a panel or a dialog (a row of confirm buttons); that is composed with layout.Inline inside the container, not with Footer
- each column of links would have no accessible name: an unnamed navigation in the landmark list is worse than none; each column is a NavList with an aria-label or a visible heading
- the footer needs more than two hierarchy levels competing (columns, newsletter band, legal bar, sub-credit, all at once with no order): move what is extra into its own region before the footer

Alternatives: `Box`, `Hero`.

- React: `import { Footer } from "@skryensya/react/layout"`.
- HTML: a `<footer>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `padding` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" | `"lg"` |
| `paddingExpanded` | "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" |  |
| `surface` | "none" \| "sunken" \| "surface" \| "raised" | `"sunken"` |
| `divider` | boolean | `true` |
| `footerElement` (React: `as`) | "footer" \| "div" | `"footer"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `footer/site`; its copy is placeholder, replace it)

```tsx
import { Footer, Grid, Stack, Wrapper } from "@skryensya/react/layout";
import { Heading, Link, Text } from "@skryensya/react/typography";

export function FooterExample() {
  return (
    <Footer>
      <Wrapper>
        <Stack gap="lg">
          <Grid gap="lg" columns="2">
            <Stack gap="sm">
              <Heading size="h5" flush>Producto</Heading>
              <Link href="/componentes">Componentes</Link>
              <Link href="/changelog">Changelog</Link>
            </Stack>
            <Stack gap="sm">
              <Heading size="h5" flush>Legal</Heading>
              <Link href="/licencia">Licencia</Link>
            </Stack>
          </Grid>
          <Text tone="tertiary" size="sm">© skryensya/ui</Text>
        </Stack>
      </Wrapper>
    </Footer>
  );
}
```

```html
<footer
  class="sk-footer"
  data-appearance="plain"
  data-padding="lg"
  data-surface="sunken"
  data-divider
>
  <div class="sk-wrapper" data-size="md">
    <div class="sk-stack" data-gap="lg">
      <div class="sk-grid" data-gap="lg" data-columns="2">
        <div class="sk-stack" data-gap="sm">
          <h2 class="sk-heading" data-size="h5" data-flush>Producto</h2>
          <a class="sk-link sk-interactive" href="/componentes">
            Componentes
          </a>
          <a class="sk-link sk-interactive" href="/changelog">Changelog</a>
        </div>
        <div class="sk-stack" data-gap="sm">
          <h2 class="sk-heading" data-size="h5" data-flush>Legal</h2>
          <a class="sk-link sk-interactive" href="/licencia">Licencia</a>
        </div>
      </div>
      <p
        class="sk-text"
        data-tone="tertiary"
        data-size="sm"
        data-weight="body"
      >
        © skryensya/ui
      </p>
    </div>
  </div>
</footer>
```

Stylesheets: `@skryensya/core/components/typography.css`, `@skryensya/core/patterns/footer.css`, `@skryensya/core/patterns/layout.css`, `@skryensya/core/patterns/wrapper.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-footer-bg`, `--sk-footer-brutalist-offset`, `--sk-footer-divider-color`, `--sk-footer-divider-width`, `--sk-footer-padding`, `--sk-footer-radius`, `--sk-footer-shadow`, `--sk-footer-wash`.
