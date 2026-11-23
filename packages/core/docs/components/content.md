# content

Category: feedback. Stylesheet: `@skryensya/core/components/toast.css`. Signatures: `Toast`, `ToastRegion`, `ToastTemplate`.

## Toast

**Use when**

- confirming something that already happened and needs no answer: saved, sent, copied
- offering to undo an action for a few seconds
- saying that something running in the background has finished

**Avoid when**

- the message is part of the content and has to stay; that is a Callout
- it must be read before going on; that is a Dialog
- it is an error of one field; that goes in the FormField, next to the control

Alternatives: `Callout`, `Dialog`, `FormField`.

- React: `import { Toast } from "@skryensya/react/content"`.
- HTML: a `<div>` with `data-sk-toast`, enhanced by Vanilla's mount.

- Goes inside: `ToastRegion`, `ToastTemplate`.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "info" \| "success" \| "warning" \| "danger" | `"neutral"` |
| `dismissible` | boolean | `false` |
| `dismissLabel` | string | `"Dismiss notification"` |
| `timeout` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `actions` | one of `Button.action`, `Button.navigation` |  |
| `children` | node | yes |
| `icon` | one of `Icon` |  |
| `title` | text |  |

**Accessible name**

- The dismiss control is icon-only; every dismissible toast needs an accessible name for the notification it clears. Give one of: `dismissLabel`.

## ToastRegion

**Use when**

- the page is going to show toasts: they belong to it, and without a region there is nowhere to put them
- they have to announce themselves; the region is what the screen reader is already watching

**Avoid when**

- there is a single message and it is part of the page; that is a Callout in place

Alternatives: `Callout`.

- React: `import { ToastRegion } from "@skryensya/react/content"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Toast` |  |

**Example** (canonical tree `content/toast-region`; its copy is placeholder, replace it)

```tsx
import { Toast, ToastRegion } from "@skryensya/react/content";

export function ToastRegionExample() {
  return (
    <ToastRegion>
      <Toast
        tone="success"
        dismissible
        dismissLabel="Cerrar aviso"
        title="Cambios guardados"
      >
        La versión de julio quedó publicada.
      </Toast>
    </ToastRegion>
  );
}
```

```html
<div class="sk-toast-region" aria-live="polite">
  <div
    class="sk-callout"
    data-sk-toast
    data-tone="success"
    data-dismissible
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="sk-callout__content">
      <p class="sk-callout__title">Cambios guardados</p>
      <div class="sk-callout__description">
        La versión de julio quedó publicada.
      </div>
    </div>
    <div class="sk-callout__actions">
      <button
        class="sk-toast__dismiss sk-button sk-interactive"
        data-sk-button
        aria-label="Cerrar aviso"
        type="button"
        data-appearance="plain"
        data-variant="ghost"
        data-tone="neutral"
        data-size="sm"
        data-icon-only
      >
        <span data-sk-icon="close" data-sk-icon-size="md"></span>
      </button>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/callout.css`, `@skryensya/core/components/toast.css`.

## ToastTemplate

**Use when**

- a script is going to clone the same Toast anatomy for dynamic messages

**Avoid when**

- the Toast already exists in the region from the first render

Alternatives: `Toast`.

- React: `import { ToastTemplate } from "@skryensya/react/content"`.
- HTML: a `<template>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Toast` | yes |

**Example** (canonical tree `content/toast-template`; its copy is placeholder, replace it)

```tsx
import { Toast, ToastTemplate } from "@skryensya/react/content";

export function ToastTemplateExample() {
  return (
    <ToastTemplate>
      <Toast
        tone="neutral"
        dismissible
        dismissLabel="Cerrar aviso"
        title="Nueva notificación"
      >
        Contenido de ejemplo.
      </Toast>
    </ToastTemplate>
  );
}
```

```html
<template>
  <div
    class="sk-callout"
    data-sk-toast
    data-tone="neutral"
    data-dismissible
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="sk-callout__content">
      <p class="sk-callout__title">Nueva notificación</p>
      <div class="sk-callout__description">Contenido de ejemplo.</div>
    </div>
    <div class="sk-callout__actions">
      <button
        class="sk-toast__dismiss sk-button sk-interactive"
        data-sk-button
        aria-label="Cerrar aviso"
        type="button"
        data-appearance="plain"
        data-variant="ghost"
        data-tone="neutral"
        data-size="sm"
        data-icon-only
      >
        <span data-sk-icon="close" data-sk-icon-size="md"></span>
      </button>
    </div>
  </div>
</template>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/callout.css`, `@skryensya/core/components/toast.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:toastdismiss` | `onDismiss` | { reason: "dismiss" \| "timeout" } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-callout-accent`, `--sk-callout-bg`, `--sk-callout-content-gap`, `--sk-callout-fg`, `--sk-callout-padding`, `--sk-toast-cascade`, `--sk-toast-peek`, `--sk-toast-shadow`, `--sk-toast-shrink`.
