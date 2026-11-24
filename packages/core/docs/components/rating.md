# rating

Category: forms. Stylesheet: `@skryensya/core/components/rating.css`. Signatures: `Rating`, `RatingDisplay`.

## Rating

**Use when**

- the person chooses a score on a short, ordered scale: how many stars they give something
- the value has to travel in a form and be browsable with the keyboard like a radio group

**Avoid when**

- the value is only shown and nobody changes it; that is RatingDisplay
- the scale is continuous or long (0 to 100); that is a Slider
- it is a measurement drawn as a bar, not as symbols: disk usage, battery; that is Meter
- they are two opposite options (like / dislike); those are two Buttons or an IconToggle

Alternatives: `RatingDisplay`, `Slider`, `Meter`.

- React: `import { Rating } from "@skryensya/react/rating"`.
- HTML: a `<div>` with `data-sk-rating`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `defaultValue` | number | `0` |
| `max` | number | `5` |
| `label` | string |  |
| `name` | string |  |
| `disabled` | boolean | `false` |
| `readOnly` | boolean | `false` |
| `symbolSize` | "sm" \| "md" \| "lg" | `"md"` |
| `itemLabel` | string | `"{value}"` |

**Example** (canonical tree `rating/input`; its copy is placeholder, replace it)

```tsx
import { Rating } from "@skryensya/react/rating";

export function RatingExample() {
  return <Rating defaultValue={3} label="Tu puntuación" name="score" />;
}
```

```html
<div
  class="sk-rating"
  data-sk-rating
  data-default-value="3"
  data-name="score"
  data-size="md"
  data-item-label="{value}"
  style="--sk-rating-max: 5;"
>
  <div
    class="sk-rating__control"
    data-sk-rating-control
    aria-label="Tu puntuación"
    role="radiogroup"
  >
    <span
      class="sk-rating__item sk-button sk-interactive"
      data-sk-rating-item
      role="radio"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span class="sk-rating__symbol" aria-hidden="true"></span>
    </span>
    <span
      class="sk-rating__item sk-button sk-interactive"
      data-sk-rating-item
      role="radio"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span class="sk-rating__symbol" aria-hidden="true"></span>
    </span>
    <span
      class="sk-rating__item sk-button sk-interactive"
      data-sk-rating-item
      aria-checked="true"
      role="radio"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span class="sk-rating__symbol" aria-hidden="true"></span>
    </span>
    <span
      class="sk-rating__item sk-button sk-interactive"
      data-sk-rating-item
      role="radio"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span class="sk-rating__symbol" aria-hidden="true"></span>
    </span>
    <span
      class="sk-rating__item sk-button sk-interactive"
      data-sk-rating-item
      role="radio"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
    >
      <span class="sk-rating__symbol" aria-hidden="true"></span>
    </span>
  </div>
  <input class="sk-rating__input" data-sk-rating-input type="text" hidden>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/rating.css`.

## RatingDisplay

**Use when**

- an already computed average is reported: the score of a product, a review, a course
- the value has decimals and has to be faithful to them; the strip fills to the exact fraction

**Avoid when**

- the person has to be able to change it; that is Rating
- the measurement reads better as a bar with its label and its number; that is Meter
- there is no scale, it is a loose number; that is Stat

Alternatives: `Rating`, `Meter`, `Stat`.

- React: `import { RatingDisplay } from "@skryensya/react/rating"`.
- HTML: a `<span>`, no JavaScript needed.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` | number | `0` |
| `max` | number | `5` |
| `label` | string |  |
| `symbolSize` | "sm" \| "md" \| "lg" | `"md"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `valueText` | node |  |
| `count` | node |  |

**Example** (canonical tree `rating/display`; its copy is placeholder, replace it)

```tsx
import { RatingDisplay } from "@skryensya/react/rating";
import { type CSSProperties } from "react";

export function RatingDisplayExample() {
  return (
    <RatingDisplay
      value={4.3}
      label="4,3 de 5"
      style={{ "--sk-rating-value": 4.3 } as CSSProperties}
      valueText="4,3"
      count="128 reseñas"
    />
  );
}
```

```html
<span
  class="sk-rating"
  aria-label="4,3 de 5"
  data-size="md"
  role="img"
  style="--sk-rating-value: 4.3; --sk-rating-max: 5;"
>
  <span class="sk-rating__symbols" aria-hidden="true"></span>
  <span class="sk-rating__value">4,3</span>
  <span class="sk-rating__count">128 reseñas</span>
</span>
```

Stylesheets: `@skryensya/core/components/rating.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:ratingvaluechange` | `onValueChange` | { value: number } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-rating-fill`, `--sk-rating-fill-direction`, `--sk-rating-gap`, `--sk-rating-max`, `--sk-rating-off-color`, `--sk-rating-on-color`, `--sk-rating-size`, `--sk-rating-symbol`, `--sk-rating-tile`, `--sk-rating-value`.
