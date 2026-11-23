# tour

Category: overlays. Stylesheet: `@skryensya/core/components/tour.css`. Signatures: `Tour`, `Tour.Trigger`.

## Tour

**Use when**

- a new or redesigned interface has a few pieces worth pointing out in order (three to five), and its user can ask for the tour whenever they want
- each step fits in one idea: what this element is and what it is for, in one or two sentences
- the page has to stay usable during the tour: no backdrop covering it, no blocked clicks and no trapped focus

**Avoid when**

- the explanation is about a single control and is needed on hover or focus: that is Tooltip
- steps that change data have to be completed (a sign-up, a configuration): that is a multi-step form with Steps, not a tour that points
- the content is long or needs images and examples: that is a help page or a Dialog, not a box next to an element
- the feature can only be understood with the tour: if a piece needs a tour to be used, the problem is the piece

Alternatives: `Tooltip`, `Popover`, `Steps`, `Dialog`.

- React: `import { Tour } from "@skryensya/react/tour"`.
- HTML: a `<div>` with `data-sk-tour`, enhanced by Vanilla's mount.

- Requires the options: `tourId`.

**Options**

| Option | Values | Default |
|---|---|---|
| `tourId` (React: `id`) | string |  |
| `progressLabel` | string | `"Step {index} of {count}"` |
| `nextLabel` | string | `"Continue"` |
| `finishLabel` | string | `"Finish"` |
| `previousLabel` | string | `"Previous"` |
| `skipLabel` | string | `"Skip tour"` |
| `closeLabel` | string | `"Close tour"` |
| `remember` | boolean | `true` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `steps`) | a list of items (below) | yes |

Each item in `items`: `placement` ("block-start" \| "block-end" \| "inline-start" \| "inline-end"), `target` (string), `description` (text, required), `title` (text, required).

## Tour.Trigger

**Use when**

- the tour has to be startable, and repeatable after skipping or finishing it, from a visible and stable place (help, the header)

**Avoid when**

- the tour should start on its own when the page loads: a tour never starts without someone asking for it

Alternatives: `Button.action`.

- React: `import { Tour } from "@skryensya/react/tour"`, then `<Tour.Trigger>`.
- HTML: a `<button>`, no JavaScript needed.

- Requires the options: `opens`, `triggerLabel`.

**Options**

| Option | Values | Default |
|---|---|---|
| `opens` | string |  |
| `triggerLabel` (React: `label`) | string |  |
| `restartLabel` | string |  |

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tourstatuschange` | `onStatusChange` | { status: TourStatus } |
| `sk:tourstepchange` | `onStepChange` | { index: number, step: TourStep } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-tour-bg`, `--sk-tour-brutalist-offset`, `--sk-tour-fg`, `--sk-tour-muted-fg`, `--sk-tour-border-color`, `--sk-tour-radius`, `--sk-tour-padding`, `--sk-tour-shadow`, `--sk-tour-max-inline-size`, `--sk-tour-arrow-size`, `--sk-tour-arrow-offset`, `--sk-tour-ring-color`, `--sk-tour-ring-halo`, `--sk-tour-ring-width`, `--sk-tour-ring-offset`.
