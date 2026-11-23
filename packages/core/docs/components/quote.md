# quote

Category: content. Stylesheet: `@skryensya/core/components/quote.css`. Signatures: `Quote`.

## Quote

**Use when**

- words that are somebody else's are shown as theirs: a quotation, a testimonial, an excerpt
- a passage is lifted out of the text to be read on its own; that is variant pull
- there is a name to put beside the words, a work to name, or both

**Avoid when**

- the text is the page's own voice; a quotation mark around it claims an author it does not have
- it is a short quoted phrase inside a sentence; that is the native <q>, inline, not a block
- it is a highlighted aside the page is making itself, with a status; that is a Callout
- it is code, a command or output; that is Code or a CodePreview

Alternatives: `Callout`, `Text`.

- React: `import { Quote } from "@skryensya/react/quote"`.
- HTML: a `<figure>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `variant` | "block" \| "pull" | `"block"` |
| `cite` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `attribution` | text |  |
| `children` | node | yes |
| `image` | one of `Avatar.image`, `Avatar.initials` |  |
| `source` | node |  |

**Example** (canonical tree `quote/attributed`; its copy is placeholder, replace it)

```tsx
import { Quote } from "@skryensya/react/quote";

export function QuoteExample() {
  return (
    <Quote
      cite="https://example.org/cuadernos/06"
      attribution="Camila Rojas,"
      source="Cuadernos de un sistema de diseno"
    >
      Escribir el componente es la parte facil.
    </Quote>
  );
}
```

```html
<figure class="sk-quote" data-variant="block">
  <blockquote
    class="sk-quote__body"
    cite="https://example.org/cuadernos/06"
  >
    Escribir el componente es la parte facil.
  </blockquote>
  <figcaption class="sk-quote__attribution">
    <span class="sk-quote__author">
      Camila Rojas,
      <cite class="sk-quote__source">
        Cuadernos de un sistema de diseno
      </cite>
    </span>
  </figcaption>
</figure>
```

Stylesheets: `@skryensya/core/components/quote.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-quote-attribution-fg`, `--sk-quote-attribution-gap`, `--sk-quote-attribution-font-size`, `--sk-quote-fg`, `--sk-quote-font-size`, `--sk-quote-font-style`, `--sk-quote-gap`, `--sk-quote-line-height`, `--sk-quote-media-gap`, `--sk-quote-measure`, `--sk-quote-padding-inline`, `--sk-quote-rule-color`, `--sk-quote-rule-width`, `--sk-quote-source-fg`.
