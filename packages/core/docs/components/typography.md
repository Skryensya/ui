# typography

Category: content. Stylesheet: `@skryensya/core/components/typography.css`. Signatures: `Text`, `Strong`, `Output`, `Code`, `Heading`, `Link`.

## Text

**Use when**

- a paragraph, a sub-line, a footnote
- the tone says hierarchy: secondary for what is accessory, danger for an error in prose (with text that says so, not only the color)
- the small line above a title is textRole eyebrow; the sub-line under the title is textRole subtitle

**Avoid when**

- it titles a section; that is a Heading, even if it looks small
- it goes inside another line of text, a button or a label as a <p>: there it is textElement span

Alternatives: `Heading`, `Quote`, `Kbd`.

- React: `import { Text } from "@skryensya/react/typography"`.
- HTML: a `<p>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "primary" \| "secondary" \| "tertiary" \| "danger" | `"primary"` |
| `size` | "caption" \| "sm" \| "body" \| "lg" | `"body"` |
| `weight` | "body" \| "emphasis" \| "label" | `"body"` |
| `textRole` | "eyebrow" \| "subtitle" |  |
| `textElement` (React: `as`) | "p" \| "div" \| "span" | `"p"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `typography/text`; its copy is placeholder, replace it)

```tsx
import { Text } from "@skryensya/react/typography";

export function TextExample() {
  return (
    <Text tone="secondary" size="sm">
      Tres réplicas detrás del balanceador.
    </Text>
  );
}
```

```html
<p class="sk-text" data-tone="secondary" data-size="sm" data-weight="body">
  Tres réplicas detrás del balanceador.
</p>
```

Stylesheets: `@skryensya/core/components/typography.css`.

## Strong

**Use when**

- a phrase inside text has strong importance, not just a different visual weight

**Avoid when**

- it titles a section; that is a Heading
- only a different weight for the whole line is wanted, without saying it matters more; that is Text with weight

Alternatives: `Heading`.

- React: `import { Strong } from "@skryensya/react/typography"`.
- HTML: a `<strong>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `typography/strong`; its copy is placeholder, replace it)

```tsx
import { Strong } from "@skryensya/react/typography";

export function StrongExample() {
  return <Strong>importante</Strong>;
}
```

```html
<strong>importante</strong>
```

Stylesheets: `@skryensya/core/components/typography.css`.

## Output

**Use when**

- it shows the computed result of an input or an interaction; outputFor names the ids of those inputs

**Avoid when**

- it is static text unrelated to any computation; that is Text

Alternatives: `Text`.

- React: `import { Output } from "@skryensya/react/typography"`.
- HTML: a `<output>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `outputFor` (React: `htmlFor`) | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `typography/output`; its copy is placeholder, replace it)

```tsx
import { Output } from "@skryensya/react/typography";

export function OutputExample() {
  return <Output>42</Output>;
}
```

```html
<output>42</output>
```

Stylesheets: `@skryensya/core/components/typography.css`.

## Code

**Use when**

- there is a literal inside a sentence: a path, a flag, a property name
- it should read differently from the surrounding text so it is not mistaken for prose

**Avoid when**

- it is a whole block of code: that is CodePreview, with its scroll and its copy button
- only emphasis is wanted; that is Strong, and it is a different claim

Alternatives: `Strong`.

- React: `import { Code } from "@skryensya/react/typography"`.
- HTML: a `<code>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

## Heading

**Use when**

- it opens a section and which document level it belongs to has to be said: headingElement (h1–h6) is the level, headingSize only the look
- the size is chosen by step (h1–h6, display-sm/md/lg); sm, md, lg and display are legacy aliases

**Avoid when**

- only large text is wanted; the level is structure, not size
- the title is a group's small label (a kicker); that is Text with textRole eyebrow

Alternatives: `Text`.

- React: `import { Heading } from "@skryensya/react/typography"`.
- HTML: a `<h2>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `headingSize` (React: `size`) | "display-lg" \| "display-md" \| "display-sm" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "sm" \| "md" \| "lg" \| "display" | `"h2"` |
| `headingElement` (React: `as`) | "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" | `"h2"` |
| `flush` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `typography/heading`; its copy is placeholder, replace it)

```tsx
import { Heading } from "@skryensya/react/typography";

export function HeadingExample() {
  return <Heading size="h3" flush>Entorno</Heading>;
}
```

```html
<h2 class="sk-heading" data-size="h3" data-flush>Entorno</h2>
```

Stylesheets: `@skryensya/core/components/typography.css`.

## Link

**Use when**

- a link inside a sentence, underlined and in the flow of the text

**Avoid when**

- it looks and works like a button; that is Button.navigation

Alternatives: `Button.navigation`.

- React: `import { Link } from "@skryensya/react/typography"`.
- HTML: a `<a>`, no JavaScript needed.

- Requires the options: `href`.

**Options**

| Option | Values | Default |
|---|---|---|
| `href` | string |  |
| `linkTone` (React: `tone`) | "neutral" \| "accent" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `typography/link-in-a-sentence`; its copy is placeholder, replace it)

```tsx
import { Link } from "@skryensya/react/typography";

export function LinkExample() {
  return <Link href="/politica-de-privacidad">la política de privacidad</Link>;
}
```

```html
<a class="sk-link sk-interactive" href="/politica-de-privacidad">
  la política de privacidad
</a>
```

Stylesheets: `@skryensya/core/components/typography.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-heading-fg`, `--sk-heading-font-size`, `--sk-heading-font-weight`, `--sk-heading-line-height`, `--sk-link-fg`, `--sk-text-fg`, `--sk-text-font-size`, `--sk-text-font-weight`, `--sk-text-line-height`.
