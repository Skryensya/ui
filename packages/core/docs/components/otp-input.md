# otp-input

Category: forms. Stylesheet: `@skryensya/core/components/otp-input.css`. Signatures: `OtpInput`.

## OtpInput

**Use when**

- a one-time code sent by SMS, email or an authenticator app is asked for
- the code has a fixed length known in advance (4, 6 digits)
- the phone should offer to autofill the code received by SMS

**Avoid when**

- the value is free text of variable length; that is Input
- the value is a number with a step and bounds; that is NumberField
- the code has to be checked against a server before accepting it; the composer handles that, listening to sk:otpinputvaluecomplete and showing the error in its own message

Alternatives: `Input`, `NumberField`.

- React: `import { OtpInput } from "@skryensya/react/otp-input"`.
- HTML: a `<div>` with `data-sk-otp-input`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `count` | number | `6` |
| `type` | "numeric" \| "alphanumeric" | `"numeric"` |
| `mask` | boolean | `false` |
| `otp` | boolean | `true` |
| `placeholder` | string | `""` |
| `groupSize` | "2" \| "3" \| "4" |  |
| `name` | string |  |
| `defaultValue` | string | `""` |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `segmentLabel` | string | `"Code {index} of {count}"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |
| `hint` | text |  |

**Example** (canonical tree `otp-input/segments`; its copy is placeholder, replace it)

```tsx
import { OtpInput } from "@skryensya/react/otp-input";

export function OtpInputExample() {
  return <OtpInput count={6} name="code" label="Código de verificación" />;
}
```

```html
<div
  class="sk-otp-input"
  data-sk-otp-input
  data-type="numeric"
  data-placeholder
  data-item-label="Code {index} of {count}"
>
  <label class="sk-otp-input__label" data-sk-otp-input-label>
    Código de verificación
  </label>
  <div class="sk-otp-input__control" data-sk-otp-input-control>
    <span class="sk-otp-input__cell">
      <input
        class="sk-otp-input__segment sk-interactive"
        data-sk-otp-input-segment
        type="text"
        autocomplete="off"
      >
      <span class="sk-otp-input__mask" aria-hidden="true">
        <span data-sk-icon="mask" data-sk-icon-size="md"></span>
      </span>
    </span>
    <span class="sk-otp-input__cell">
      <input
        class="sk-otp-input__segment sk-interactive"
        data-sk-otp-input-segment
        type="text"
        autocomplete="off"
      >
      <span class="sk-otp-input__mask" aria-hidden="true">
        <span data-sk-icon="mask" data-sk-icon-size="md"></span>
      </span>
    </span>
    <span class="sk-otp-input__cell">
      <input
        class="sk-otp-input__segment sk-interactive"
        data-sk-otp-input-segment
        type="text"
        autocomplete="off"
      >
      <span class="sk-otp-input__mask" aria-hidden="true">
        <span data-sk-icon="mask" data-sk-icon-size="md"></span>
      </span>
    </span>
    <span class="sk-otp-input__cell">
      <input
        class="sk-otp-input__segment sk-interactive"
        data-sk-otp-input-segment
        type="text"
        autocomplete="off"
      >
      <span class="sk-otp-input__mask" aria-hidden="true">
        <span data-sk-icon="mask" data-sk-icon-size="md"></span>
      </span>
    </span>
    <span class="sk-otp-input__cell">
      <input
        class="sk-otp-input__segment sk-interactive"
        data-sk-otp-input-segment
        type="text"
        autocomplete="off"
      >
      <span class="sk-otp-input__mask" aria-hidden="true">
        <span data-sk-icon="mask" data-sk-icon-size="md"></span>
      </span>
    </span>
    <span class="sk-otp-input__cell">
      <input
        class="sk-otp-input__segment sk-interactive"
        data-sk-otp-input-segment
        type="text"
        autocomplete="off"
      >
      <span class="sk-otp-input__mask" aria-hidden="true">
        <span data-sk-icon="mask" data-sk-icon-size="md"></span>
      </span>
    </span>
  </div>
  <input
    class="sk-otp-input__hidden"
    data-sk-otp-input-hidden
    data-name="code"
    data-default-value
    type="text"
    aria-hidden="true"
    tabindex="-1"
  >
</div>
```

Stylesheets: `@skryensya/core/components/otp-input.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:otpinputvaluechange` | `onValueChange` | { value: string } |
| `sk:otpinputvaluecomplete` | `onValueComplete` | { value: string } |
| `sk:otpinputinvalid` | `onValueInvalid` | { char: string, index: number } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-otp-input-bg`, `--sk-otp-input-border-color`, `--sk-otp-input-fg`, `--sk-otp-input-gap`, `--sk-otp-input-group-gap`, `--sk-otp-input-hint-color`, `--sk-otp-input-invalid-border-color`, `--sk-otp-input-label-color`, `--sk-otp-input-radius`, `--sk-otp-input-segment-size`.
