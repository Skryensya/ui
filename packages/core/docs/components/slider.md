# slider

Category: forms. Stylesheet: `@skryensya/core/components/slider.css`. Signatures: `Slider`, `SliderRange`.

## Slider

**Use when**

- the value is approximate and seeing it move helps: volume, brightness, a price range
- it carries a name through aria-label or aria-labelledby, and a value within min and max

**Avoid when**

- precision is needed; there a NumberField is typed faster
- the options are discrete and few; that is a RadioGroup or a Segmented
- the user chooses TWO values, a minimum and a maximum; that is SliderRange

Alternatives: `NumberField`, `Segmented`, `SliderRange`.

- React: `import { Slider } from "@skryensya/react/slider"`.
- HTML: a `<div>` with `data-sk-slider`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` (React: `defaultValue`) | number | `0` |
| `min` | number | `0` |
| `max` | number | `100` |
| `step` | number |  |
| `name` | string |  |
| `disabled` | boolean | `false` |

**Accessible name**

- The thumb is a role="slider" and both bindings name it from the root's aria-label or aria-labelledby; without one it is announced as a bare number. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `slider/mid-range`; its copy is placeholder, replace it)

```tsx
import { Slider } from "@skryensya/react/slider";

export function SliderExample() {
  return <Slider defaultValue={60} name="volumen" aria-label="Volumen" />;
}
```

```html
<div
  class="sk-slider"
  data-sk-slider
  data-value="60"
  data-min="0"
  data-max="100"
  aria-label="Volumen"
>
  <div class="sk-slider__control" data-sk-slider-control>
    <div class="sk-slider__track" data-sk-slider-track>
      <div class="sk-slider__range" data-sk-slider-range-part></div>
    </div>
    <div class="sk-slider__thumb" data-sk-slider-thumb>
      <input
        class="sk-slider__input"
        data-sk-slider-input
        data-name="volumen"
        type="text"
        hidden
      >
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/slider.css`.

## SliderRange

**Use when**

- the user narrows a range between a minimum and a maximum. A price filter, a span of dates by position

**Avoid when**

- it is a single value; that is Slider
- exact precision is needed at each end; there two NumberFields (minimum and maximum) are typed faster

Alternatives: `NumberField`, `Slider`.

- React: `import { SliderRange } from "@skryensya/react/slider"`.
- HTML: a `<div>` with `data-sk-slider-range`, enhanced by Vanilla's mount.

- Requires the options: `lowLabel`, `highLabel`.

**Options**

| Option | Values | Default |
|---|---|---|
| `lowValue` (React: `defaultLowValue`) | number | `0` |
| `highValue` (React: `defaultHighValue`) | number | `100` |
| `lowLabel` | string |  |
| `highLabel` | string |  |
| `min` | number | `0` |
| `max` | number | `100` |
| `step` | number |  |
| `disabled` | boolean | `false` |

**Example** (canonical tree `slider/range`; its copy is placeholder, replace it)

```tsx
import { SliderRange } from "@skryensya/react/slider";

export function SliderRangeExample() {
  return (
    <SliderRange
      defaultLowValue={20}
      defaultHighValue={80}
      lowLabel="Precio mínimo"
      highLabel="Precio máximo"
    />
  );
}
```

```html
<div
  class="sk-slider-range"
  data-sk-slider-range
  data-min="0"
  data-max="100"
  data-low-value="20"
  data-high-value="80"
>
  <div class="sk-slider-range__control" data-sk-slider-range-control>
    <div class="sk-slider-range__track" data-sk-slider-range-track>
      <div class="sk-slider-range__fill" data-sk-slider-range-fill></div>
    </div>
    <div
      class="sk-slider-range__low"
      data-sk-slider-range-low
      aria-label="Precio mínimo"
    >
      <input
        class="sk-slider-range__low-input"
        data-sk-slider-range-low-input
        type="text"
        hidden
      >
    </div>
    <div
      class="sk-slider-range__high"
      data-sk-slider-range-high
      aria-label="Precio máximo"
    >
      <input
        class="sk-slider-range__high-input"
        data-sk-slider-range-high-input
        type="text"
        hidden
      >
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/slider.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:slidervaluechange` | `onValueChange` | { high: number (SliderRange), low: number (SliderRange), value: number (Slider) } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-slider-fill-color`, `--sk-slider-thumb`, `--sk-slider-thumb-hit`, `--sk-slider-thumb-ring`, `--sk-slider-thumb-ring-size`, `--sk-slider-thumb-shadow`, `--sk-slider-thumb-size`, `--sk-slider-track`, `--sk-slider-track-size`.
