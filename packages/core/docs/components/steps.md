# steps

Category: navigation. Stylesheet: `@skryensya/core/components/steps.css`. Signatures: `Steps`.

## Steps

**Use when**

- which stage of a multi-stage process the user is at has to be shown
- what is done, what is left and where they stand matter
- each step carries a status (complete, current or upcoming); exactly one is current

**Avoid when**

- they are instructions to read and follow; that is a Procedure

Alternatives: `Procedure`.

- React: `import { Steps } from "@skryensya/react/steps"`.
- HTML: a `<ol>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `orientation` (React: `data-orientation`) | "horizontal" \| "vertical" |  |
| `appearance` | "markers" \| "segments" | `"markers"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `steps`) | a list of items (below) | yes |

Each item in `items`: `status` ("complete" \| "current" \| "upcoming"), `description` (text), `label` (text, required), `marker` (node, required).

**Example** (canonical tree `steps/three-stages`; its copy is placeholder, replace it)

```tsx
import { Steps } from "@skryensya/react/steps";
import { steps } from "./steps-data";

export function StepsExample() {
  return <Steps steps={steps} />;
}
```

`steps-data.ts`:

```ts
export const steps = [
  { status: "complete", marker: "✓", label: "Datos" },
  { status: "current", marker: "2", label: "Pago" },
  { status: "upcoming", marker: "3", label: "Confirmación" },
];
```

```html
<ol class="sk-steps" data-appearance="markers" role="list">
  <li class="sk-steps__item" data-status="complete">
    <span class="sk-steps__marker">✓</span>
    <span>
      <span class="sk-steps__label">Datos</span>
    </span>
  </li>
  <li class="sk-steps__item" data-status="current" aria-current="step">
    <span class="sk-steps__marker">2</span>
    <span>
      <span class="sk-steps__label">Pago</span>
    </span>
  </li>
  <li class="sk-steps__item" data-status="upcoming">
    <span class="sk-steps__marker">3</span>
    <span>
      <span class="sk-steps__label">Confirmación</span>
    </span>
  </li>
</ol>
```

Stylesheets: `@skryensya/core/components/steps.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-steps-connector-size`, `--sk-steps-segment-size`, `--sk-steps-item-padding`, `--sk-steps-marker-size`.
