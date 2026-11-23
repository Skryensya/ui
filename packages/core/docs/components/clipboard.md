# clipboard

Category: actions. Stylesheet: `@skryensya/core/components/clipboard.css`. Signatures: `Clipboard`, `CopyButton`.

## Clipboard

**Use when**

- the value has to be seen before copying it: a share link, an API key, an identifier
- besides the button, the reader may want to select the value or copy it with the keyboard

**Avoid when**

- the value is long or spans several lines (code, configuration): that is a code block with CopyButton
- the value can be edited: that is an Input in a FormField

Alternatives: `CopyButton`, `Input`.

- React: `import { Clipboard } from "@skryensya/react/clipboard"`.
- HTML: a `<div>` with `data-sk-clipboard`, enhanced by Vanilla's mount.

- Requires the options: `value`, `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` | string |  |
| `label` | string | `"Copy"` |
| `copiedLabel` | string | `"Copied"` |
| `errorLabel` | string | `"Copy failed"` |
| `timeout` | number | `2000` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `fieldLabel` | text | yes |

**Example** (canonical tree `clipboard/field-brutalist`; its copy is placeholder, replace it)

```tsx
import { Clipboard } from "@skryensya/react/clipboard";

export function ClipboardExample() {
  return (
    <Clipboard
      value="https://skryensya.dev/s/4821"
      label="Copiar enlace"
      appearance="brutalist"
      fieldLabel="Enlace para compartir"
    />
  );
}
```

```html
<div class="sk-clipboard" data-sk-clipboard data-timeout="2000">
  <label class="sk-clipboard__label">Enlace para compartir</label>
  <div class="sk-clipboard__control">
    <input
      class="sk-clipboard__input sk-input"
      data-sk-clipboard-input
      value="https://skryensya.dev/s/4821"
      type="text"
      readonly
      spellcheck="false"
    >
    <button
      class="sk-copy-button sk-button sk-interactive sk-icon-toggle sk-anchor"
      data-sk-clipboard-trigger
      aria-label="Copiar enlace"
      data-appearance="brutalist"
      type="button"
      data-icon-only
      data-variant="soft"
      data-size="md"
    >
      <span
        class="sk-copy-button__icon"
        data-face="idle"
        aria-hidden="true"
      >
        <span data-sk-icon="copy" data-sk-icon-size="md"></span>
      </span>
      <span
        class="sk-copy-button__icon"
        data-face="copied"
        aria-hidden="true"
      >
        <span data-sk-icon="check" data-sk-icon-size="md"></span>
      </span>
      <span
        class="sk-copy-button__label"
        data-sk-clipboard-status
        aria-live="polite"
      ></span>
      <span
        class="sk-copy-button__feedback sk-anchored"
        data-sk-clipboard-feedback
        data-sk-placement="block-start"
        aria-hidden="true"
      >
        <span data-sk-clipboard-feedback-text="copied">Copied</span>
        <span data-sk-clipboard-feedback-text="error">Copy failed</span>
        <span
          class="sk-anchored-arrow"
          data-part="arrow"
          aria-hidden="true"
        ></span>
      </span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/button.brutalist.css`, `@skryensya/core/components/clipboard.css`, `@skryensya/core/components/copy-button.css`, `@skryensya/core/components/input.css`, `@skryensya/core/components/input.brutalist.css`.

## CopyButton

**Use when**

- a code block, a command or a token is going to be pasted elsewhere, and selecting it by hand is slow or imprecise
- the value is already in view (a code block) or does not need to be seen to be copied

**Avoid when**

- whoever copies has to see or check the value first (a share link, a key): that is Clipboard
- the action does more than copy (share, export, download): that is a Button with its own name

Alternatives: `Clipboard`, `Button.action`.

- React: `import { CopyButton } from "@skryensya/react/clipboard"`.
- HTML: a `<button>` with `data-sk-clipboard`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` | string |  |
| `target` | string |  |
| `label` | string | `"Copy"` |
| `copiedLabel` | string | `"Copied"` |
| `errorLabel` | string | `"Copy failed"` |
| `timeout` | number | `2000` |
| `size` | "xs" \| "sm" \| "md" | `"sm"` |
| `variant` | "soft" \| "ghost" | `"soft"` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Example** (canonical tree `clipboard/copy-button`; its copy is placeholder, replace it)

```tsx
import { CopyButton } from "@skryensya/react/clipboard";

export function CopyButtonExample() {
  return (
    <CopyButton
      value="pnpm add @skryensya/core"
      label="Copiar comando"
      copiedLabel="Copiado"
      errorLabel="No se pudo copiar"
    />
  );
}
```

```html
<button
  class="sk-copy-button sk-button sk-interactive sk-icon-toggle sk-anchor"
  data-sk-clipboard-trigger
  data-sk-clipboard
  value="pnpm add @skryensya/core"
  aria-label="Copiar comando"
  data-timeout="2000"
  data-size="sm"
  data-variant="soft"
  data-appearance="plain"
  type="button"
  data-icon-only
>
  <span class="sk-copy-button__icon" data-face="idle" aria-hidden="true">
    <span data-sk-icon="copy" data-sk-icon-size="md"></span>
  </span>
  <span class="sk-copy-button__icon" data-face="copied" aria-hidden="true">
    <span data-sk-icon="check" data-sk-icon-size="md"></span>
  </span>
  <span
    class="sk-copy-button__label"
    data-sk-clipboard-status
    aria-live="polite"
  ></span>
  <span
    class="sk-copy-button__feedback sk-anchored"
    data-sk-clipboard-feedback
    data-sk-placement="block-start"
    aria-hidden="true"
  >
    <span data-sk-clipboard-feedback-text="copied">Copiado</span>
    <span data-sk-clipboard-feedback-text="error">No se pudo copiar</span>
    <span class="sk-anchored-arrow" data-part="arrow" aria-hidden="true"></span>
  </span>
</button>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/clipboard.css`, `@skryensya/core/components/copy-button.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:clipboardstatuschange` | `onStatusChange` | { status: ClipboardStatus } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-clipboard-gap`, `--sk-clipboard-label-fg`, `--sk-clipboard-label-font-size`, `--sk-copy-button-error-fg`, `--sk-copy-button-feedback-bg`, `--sk-copy-button-feedback-border-color`, `--sk-copy-button-feedback-fg`, `--sk-copy-button-feedback-font-size`, `--sk-copy-button-feedback-padding`, `--sk-copy-button-feedback-radius`, `--sk-copy-button-feedback-shadow`, `--sk-copy-button-feedback-wash`.
