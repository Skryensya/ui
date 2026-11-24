# color-picker

Category: forms. Stylesheet: `@skryensya/core/components/color-picker.css`. Signatures: `ColorPicker`, `ColorPicker.compact`, `ColorPicker.swatch`, `ColorPicker.native`.

## ColorPicker

**Use when**

- the value is an arbitrary color, not one of a few fixed options
- the hue, saturation and transparency should be seen and adjusted by hand

**Avoid when**

- the color is always one of a known handful: that is Select or Segmented
- space is minimal or the color is secondary to the rest of the form

Alternatives: `ColorPicker.compact`, `ColorPicker.swatch`, `ColorPicker.native`.

- React: `import { ColorPicker } from "@skryensya/react/color-picker"`.
- HTML: a `<div>` with `data-sk-color-picker`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `triggerLabel` | string | `"Choose color"` |
| `swatches` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text |  |

**Example** (canonical tree `color-picker/default`; its copy is placeholder, replace it)

```tsx
import { ColorPicker } from "@skryensya/react/color-picker";

export function ColorPickerExample() {
  return (
    <ColorPicker name="brand" defaultValue="#3366ff" label="Color de marca" />
  );
}
```

```html
<div
  class="sk-color-picker"
  data-sk-color-picker
  data-value="#3366ff"
  data-anatomy="full"
>
  <label class="sk-color-picker__label">Color de marca</label>
  <input
    class="sk-color-picker__hidden-input"
    data-sk-color-picker-hidden-input
    name="brand"
    aria-hidden="true"
    tabindex="-1"
    style="border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;"
  >
  <div class="sk-color-picker__control sk-anchor">
    <button
      class="sk-color-picker__trigger sk-button sk-interactive"
      aria-label="Choose color"
      type="button"
    >
      <span class="sk-color-picker__swatch"></span>
      <span class="sk-color-picker__value"></span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/color-picker.css`, `@skryensya/core/patterns/anchored.css`.

## ColorPicker.compact

**Use when**

- the swatch lives in a toolbar or another tight place
- the reader only needs the area, the hue and presets, not transparency or a typed value

**Avoid when**

- an exact hex value has to be typed: that is ColorPicker

Alternatives: `ColorPicker`.

- React: `import { CompactColorPicker } from "@skryensya/react/color-picker"`.
- HTML: a `<div>` with `data-sk-color-picker`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `triggerLabel` | string | `"Choose color"` |
| `swatches` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text |  |

**Example** (canonical tree `color-picker/compact`; its copy is placeholder, replace it)

```tsx
import { CompactColorPicker } from "@skryensya/react/color-picker";

export function CompactColorPickerExample() {
  return (
    <CompactColorPicker name="accent" defaultValue="#22aabb" label="Acento" />
  );
}
```

```html
<div
  class="sk-color-picker"
  data-sk-color-picker
  data-value="#22aabb"
  data-anatomy="compact"
>
  <label class="sk-color-picker__label">Acento</label>
  <input
    class="sk-color-picker__hidden-input"
    data-sk-color-picker-hidden-input
    name="accent"
    aria-hidden="true"
    tabindex="-1"
    style="border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;"
  >
  <div class="sk-color-picker__control sk-anchor">
    <button
      class="sk-color-picker__trigger sk-button sk-interactive"
      aria-label="Choose color"
      type="button"
    >
      <span class="sk-color-picker__swatch"></span>
      <span class="sk-color-picker__value"></span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/color-picker.css`, `@skryensya/core/patterns/anchored.css`.

## ColorPicker.swatch

**Use when**

- only the color itself is shown, as a square preview with no value text beside it
- the swatch lives in a toolbar, a table row or a tight spot where the hex adds noise

**Avoid when**

- the reader should see or copy the value without opening the panel: that is ColorPicker.compact
- an exact hex value has to be typed: that is ColorPicker

Alternatives: `ColorPicker.compact`, `ColorPicker`.

- React: `import { SwatchColorPicker } from "@skryensya/react/color-picker"`.
- HTML: a `<div>` with `data-sk-color-picker`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `required` | boolean | `false` |
| `invalid` | boolean | `false` |
| `triggerLabel` | string | `"Choose color"` |
| `swatches` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text |  |

**Example** (canonical tree `color-picker/swatch`; its copy is placeholder, replace it)

```tsx
import { SwatchColorPicker } from "@skryensya/react/color-picker";

export function SwatchColorPickerExample() {
  return (
    <SwatchColorPicker name="accent" defaultValue="#22aabb" label="Acento" />
  );
}
```

```html
<div
  class="sk-color-picker"
  data-sk-color-picker
  data-value="#22aabb"
  data-anatomy="compact"
>
  <label class="sk-color-picker__label">Acento</label>
  <input
    class="sk-color-picker__hidden-input"
    data-sk-color-picker-hidden-input
    name="accent"
    aria-hidden="true"
    tabindex="-1"
    style="border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;"
  >
  <div class="sk-color-picker__control sk-anchor">
    <button
      class="sk-color-picker__trigger sk-button sk-interactive"
      aria-label="Choose color"
      type="button"
    >
      <span class="sk-color-picker__swatch"></span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/color-picker.css`, `@skryensya/core/patterns/anchored.css`.

## ColorPicker.native

**Use when**

- an ordinary color inside a form, with no presets or channels of its own
- the operating system's picker and the submission should belong to the browser

**Avoid when**

- presets, transparency or seeing the area and hue while adjusting are needed: that is ColorPicker

Alternatives: `ColorPicker`, `ColorPicker.compact`.

- React: `import { NativeColorPicker } from "@skryensya/react/color-picker"`.
- HTML: a `<div>` with `data-sk-color-picker-native`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |

**Example** (canonical tree `color-picker/native`; its copy is placeholder, replace it)

```tsx
import { NativeColorPicker } from "@skryensya/react/color-picker";

export function NativeColorPickerExample() {
  return <NativeColorPicker name="bg" defaultValue="#ffffff" label="Fondo" />;
}
```

```html
<div class="sk-color-picker" data-sk-color-picker-native>
  <label class="sk-color-picker__label" id="fondo">Fondo</label>
  <div class="sk-color-picker__control">
    <input
      class="sk-color-picker__trigger"
      name="bg"
      value="#ffffff"
      type="color"
      aria-labelledby="fondo"
    >
    <input
      class="sk-color-picker__native-value"
      value="#ffffff"
      type="text"
      autocomplete="off"
      spellcheck="false"
      maxlength="7"
      inputmode="text"
      aria-labelledby="fondo"
    >
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/color-picker.css`, `@skryensya/core/patterns/anchored.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:colorpickervaluechange` | `onValueChange` | { value: string } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-color-picker-area-block-size`, `--sk-color-picker-area-radius`, `--sk-color-picker-area-thumb-size`, `--sk-color-picker-backdrop-bg`, `--sk-color-picker-checkerboard-size`, `--sk-color-picker-content-bg`, `--sk-color-picker-content-border-color`, `--sk-color-picker-content-gap`, `--sk-color-picker-content-inline-size`, `--sk-color-picker-content-padding`, `--sk-color-picker-content-radius`, `--sk-color-picker-content-shadow`, `--sk-color-picker-content-wash`, `--sk-color-picker-field-padding`, `--sk-color-picker-gap`, `--sk-color-picker-label-color`, `--sk-color-picker-rail-block-size`, `--sk-color-picker-rail-radius`, `--sk-color-picker-rail-thumb-size`, `--sk-color-picker-swatch-border-color`, `--sk-color-picker-swatch-size`, `--sk-color-picker-thumb-ring-color`, `--sk-color-picker-thumb-ring-size`, `--sk-color-picker-thumb-shadow`, `--sk-color-picker-trigger-inline-size`, `--sk-color-picker-trigger-size`.
