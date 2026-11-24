# compare-slider

Category: content. Stylesheet: `@skryensya/core/components/compare-slider.css`. Signatures: `CompareSlider`.

## CompareSlider

**Use when**

- two versions of the same thing should be judged against each other at the same place: a photo before and after an edit, an interface old and new, a chart with and without a series
- the reader should decide how much of each to see, by dragging a divider across the box, rather than being shown them one after the other
- the two layers are the same size and the same subject, so that what is on one side of the divider lines up with what is on the other

**Avoid when**

- the two things are different subjects or sizes; the divider only works if the layers are registered, so they would not line up; use side-by-side Grid columns
- the user is resizing panels of a layout rather than revealing a layer; that is Resizable, which conserves a total between neighbours
- there are more than two things to compare; a divider has two sides, and Tabs or a Segmented control fits a set

Alternatives: `Resizable`, `Tabs`, `Segmented`.

- React: `import { CompareSlider } from "@skryensya/react/compare-slider"`.
- HTML: a `<div>` with `data-sk-compare-slider`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `direction` | "horizontal" \| "vertical" | `"horizontal"` |
| `position` | number | `50` |
| `label` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `before` | node | yes |
| `after` | node | yes |

**Example** (canonical tree `compare-slider/default`; its copy is placeholder, replace it)

```tsx
import { CompareSlider } from "@skryensya/react/compare-slider";
import { Text } from "@skryensya/react/typography";

export function CompareSliderExample() {
  return (
    <CompareSlider
      label="Compare before and after"
      before={<Text>Before.</Text>}
      after={<Text>After.</Text>}
    />
  );
}
```

```html
<div
  class="sk-compare-slider"
  data-sk-compare-slider
  data-direction="horizontal"
  data-position="50"
>
  <div class="sk-compare-slider__before">
    <p
      class="sk-text"
      data-tone="primary"
      data-size="body"
      data-weight="body"
    >
      Before.
    </p>
  </div>
  <div class="sk-compare-slider__after">
    <p
      class="sk-text"
      data-tone="primary"
      data-size="body"
      data-weight="body"
    >
      After.
    </p>
  </div>
  <div
    class="sk-compare-slider__handle"
    aria-label="Compare before and after"
    role="slider"
    tabindex="0"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="50"
  >
    <span class="sk-compare-slider__grip sk-grip" aria-hidden="true"></span>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/compare-slider.css`, `@skryensya/core/components/typography.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-compare-slider-bg`, `--sk-compare-slider-handle-active-color`, `--sk-compare-slider-handle-color`, `--sk-compare-slider-handle-hit`, `--sk-compare-slider-handle-line`, `--sk-compare-slider-position`, `--sk-compare-slider-radius`.
