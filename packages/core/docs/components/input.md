# input

Category: forms. Stylesheet: `@skryensya/core/components/input.css`. Signatures: `Input`, `NativeInput`, `Textarea`.

## Input

**Use when**

- the user types one line of text: email, name
- the native type brings the browser's keyboard and validation (email, tel, url)
- the value has a validity the browser cannot check: a RUT with its check digit, a URL that can be opened; that is `format`
- it is a phone number from any country: `format="phone"` plus `country`, which requires installing `@skryensya/phone` and registering it at startup

**Avoid when**

- the text is long or multi-line; that is Textarea
- validity depends on the server (a RUT that is already registered); that is FormField's `error` slot, written by the composer, and it wins over the `format` message
- a phone number should be validated without adding dependencies: there is no way; the numbering plan is data and the kit prefers not validating to validating wrongly
- the value is chosen from a closed set of options; that is a Select
- the text is a query, with a magnifier and a way to clear it; that is SearchField
- the value is a number with a step and bounds; that is NumberField
- the platform should govern time/color/range and its native control is wanted; that is NativeInput

Alternatives: `Textarea`, `Select`, `NumberField`, `NativeInput`, `SearchField`.

- React: `import { Input } from "@skryensya/react/input"`.
- HTML: a `<input>`, no JavaScript needed.

- Goes inside: `FormField`, `ButtonGroup`.

**Options**

| Option | Values | Default |
|---|---|---|
| `controlSize` | "xs" \| "sm" \| "md" \| "lg" |  |
| `type` | string | `"text"` |
| `name` | string |  |
| `placeholder` | string |  |
| `disabled` | boolean | `false` |
| `format` | "rut" \| "phone" \| "url" \| "email" |  |
| `country` | string |  |
| `errorLabel` | string |  |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |
| `variant` | "ghost" |  |

## NativeInput

**Use when**

- the platform already offers the right control (time, color, range, …) and that native behaviour is wanted with sk-input's shared appearance

**Avoid when**

- it is single-line text entry with native keyboard/validation; that is Input inside FormField
- a segmented system time is needed; that is TimeField

Alternatives: `Input`, `TimeField`.

- React: `import { NativeInput } from "@skryensya/react/input"`.
- HTML: a `<input>`, no JavaScript needed.

- Requires the options: `type`.

**Options**

| Option | Values | Default |
|---|---|---|
| `controlSize` | "xs" \| "sm" \| "md" \| "lg" |  |
| `type` | string | `"text"` |
| `name` | string |  |
| `disabled` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |
| `variant` | "ghost" |  |

**Example** (canonical tree `input/native`; its copy is placeholder, replace it)

```tsx
import { NativeInput } from "@skryensya/react/input";

export function NativeInputExample() {
  return (
    <NativeInput type="color" name="accent" aria-label="Color de acento" />
  );
}
```

```html
<input
  class="sk-input"
  type="color"
  name="accent"
  aria-label="Color de acento"
>
```

Stylesheets: `@skryensya/core/components/input.css`.

## Textarea

**Use when**

- the text spans several lines: a description, a comment

**Avoid when**

- one line is enough; a Textarea invites writing too much

Alternatives: `Input`.

- React: `import { Textarea } from "@skryensya/react/input"`.
- HTML: a `<textarea>`, no JavaScript needed.

- Goes inside: `FormField`.

**Options**

| Option | Values | Default |
|---|---|---|
| `controlSize` | "xs" \| "sm" \| "md" \| "lg" |  |
| `name` | string |  |
| `placeholder` | string |  |
| `disabled` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |
| `variant` | "ghost" |  |
| `autoSize` | boolean | `false` |

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:inputvalidate` | `onValidate` | { ok: boolean, reason: InputFormatReason \| undefined, normalized: string \| undefined } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-input-bg`, `--sk-input-border-color`, `--sk-input-border-width`, `--sk-input-disabled-bg`, `--sk-input-disabled-border-color`, `--sk-input-disabled-fg`, `--sk-input-fg`, `--sk-input-font-size`, `--sk-input-gap`, `--sk-input-height`, `--sk-input-invalid-border-color`, `--sk-input-invalid-fg`, `--sk-input-line-height`, `--sk-input-padding-x`, `--sk-input-padding-y`, `--sk-input-placeholder-fg`, `--sk-input-radius`, `--sk-input-readonly-bg`, `--sk-input-readonly-border-color`, `--sk-input-shadow`, `--sk-input-wash`, `--sk-textarea-autosize-max-block-size`.
