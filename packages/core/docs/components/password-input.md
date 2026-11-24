# password-input

Category: forms. Stylesheet: `@skryensya/core/components/password-input.css`. Signatures: `PasswordInput`.

## PasswordInput

**Use when**

- the field asks for a password, to sign in or to create a new one
- whoever types has to be able to check what they typed before submitting, especially on a phone

**Avoid when**

- it is a one-time code of a few digits; that is an OtpInput
- the secret is shown to be copied, not typed (an already generated API key); that is a Clipboard
- it is any text that does not need hiding; that is an Input

Alternatives: `OtpInput`, `Clipboard`, `Input`.

- React: `import { PasswordInput } from "@skryensya/react/password-input"`.
- HTML: a `<div>` with `data-sk-password-input`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `autoComplete` | "current-password" \| "new-password" | `"current-password"` |
| `placeholder` | string |  |
| `defaultVisible` | boolean | `false` |
| `ignorePasswordManagers` | boolean | `false` |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `showLabel` | string | `"Show password"` |
| `hideLabel` | string | `"Hide password"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `hint` | text |  |
| `label` | text | yes |

**Example** (canonical tree `password-input/new`; its copy is placeholder, replace it)

```tsx
import { PasswordInput } from "@skryensya/react/password-input";

export function PasswordInputExample() {
  return (
    <PasswordInput
      name="clave"
      autoComplete="new-password"
      showLabel="Mostrar contraseña"
      hideLabel="Ocultar contraseña"
      label="Contraseña nueva"
      hint="Al menos 12 caracteres"
    />
  );
}
```

```html
<div class="sk-password-input" data-sk-password-input>
  <label class="sk-password-input__label" data-sk-password-input-label>
    Contraseña nueva
  </label>
  <div class="sk-password-input__control" data-sk-password-input-control>
    <input
      class="sk-password-input__input"
      data-sk-password-input-input
      name="clave"
      autocomplete="new-password"
      type="password"
      autocapitalize="off"
      spellcheck="false"
    >
    <button
      class="sk-password-input__visibility-trigger sk-button sk-interactive sk-icon-toggle"
      data-sk-password-input-trigger
      aria-label="Mostrar contraseña"
      data-hide-label="Ocultar contraseña"
      type="button"
      data-variant="ghost"
      data-size="sm"
      data-icon-only
      data-state="hidden"
      aria-expanded="false"
    >
      <span data-face="show" aria-hidden="true">
        <span data-sk-icon="visibility" data-sk-icon-size="sm"></span>
      </span>
      <span data-face="hide" aria-hidden="true">
        <span data-sk-icon="visibility-off" data-sk-icon-size="sm"></span>
      </span>
    </button>
  </div>
  <span class="sk-password-input__hint">Al menos 12 caracteres</span>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/password-input.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:passwordinputvisibilitychange` | `onVisibilityChange` | { visible: boolean } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-password-input-bg`, `--sk-password-input-border-color`, `--sk-password-input-border-width`, `--sk-password-input-fg`, `--sk-password-input-gap`, `--sk-password-input-hint-color`, `--sk-password-input-invalid-border-color`, `--sk-password-input-label-color`, `--sk-password-input-min-inline-size`, `--sk-password-input-radius`, `--sk-password-input-shadow`, `--sk-password-input-toggle-color`, `--sk-password-input-toggle-inset`, `--sk-password-input-toggle-radius`, `--sk-password-input-wash`.
