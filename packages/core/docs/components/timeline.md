# timeline

Category: content. Stylesheet: `@skryensya/core/components/timeline.css`. Signatures: `Timeline`, `TimelineItem`.

## Timeline

**Use when**

- events that already happened have to be shown, in the order they happened
- the when matters as much as the what: a history, order tracking, an activity log
- the author sets the direction by writing the entries in it; there is no order option

**Avoid when**

- the reader is inside the process and has to be told which stage they are at; that is Steps
- they are instructions to follow, with no time at all; that is a Procedure
- they are shipped releases; that is Changelog, which has its own vocabulary and scale

Alternatives: `Steps`, `Procedure`, `Changelog`.

- React: `import { Timeline } from "@skryensya/react/timeline"`.
- HTML: a `<ol>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TimelineItem` | yes |

**Example** (canonical tree `timeline/order-history`; its copy is placeholder, replace it)

```tsx
import { Icon } from "@skryensya/react/icon";
import { Timeline, TimelineItem } from "@skryensya/react/timeline";

export function TimelineExample() {
  return (
    <Timeline aria-label="Historial del pedido">
      <TimelineItem
        time="2026-03-14T14:20"
        tone="success"
        icon={<Icon name="success" />}
        timeLabel="14 mar 2026, 14:20"
        heading="Pedido entregado"
      >
        Firmado por L. Ortiz.
      </TimelineItem>
      <TimelineItem
        time="2026-03-11"
        timeLabel="11 mar 2026"
        heading="Retrasado por el temporal"
      />
      <TimelineItem heading="Un evento sin fecha ni tono" />
    </Timeline>
  );
}
```

```html
<ol class="sk-timeline" role="list" aria-label="Historial del pedido">
  <li class="sk-timeline__item" data-tone="success">
    <span class="sk-timeline__marker" aria-hidden="true">
      <span data-sk-icon="success" data-sk-icon-size="md"></span>
    </span>
    <time class="sk-timeline__time" datetime="2026-03-14T14:20">
      14 mar 2026, 14:20
    </time>
    <span class="sk-timeline__heading">Pedido entregado</span>
    <div class="sk-timeline__body">Firmado por L. Ortiz.</div>
  </li>
  <li class="sk-timeline__item" data-tone="neutral">
    <span class="sk-timeline__marker" aria-hidden="true"></span>
    <time class="sk-timeline__time" datetime="2026-03-11">
      11 mar 2026
    </time>
    <span class="sk-timeline__heading">Retrasado por el temporal</span>
  </li>
  <li class="sk-timeline__item" data-tone="neutral">
    <span class="sk-timeline__marker" aria-hidden="true"></span>
    <span class="sk-timeline__heading">Un evento sin fecha ni tono</span>
  </li>
</ol>
```

Stylesheets: `@skryensya/core/components/timeline.css`, `@skryensya/core/patterns/icon.css`.

## TimelineItem

**Use when**

- one event on the rail: a required heading, and optionally a time, an icon and a detail
- the time is two fields: time (ISO, for the machine) and timeLabel (the visible copy)
- tone marks the dot a scanning eye should stop at; it is never the only thing saying so

**Avoid when**

- the event carries complete / current / upcoming; that is a step of Steps

Alternatives: `Steps`.

- React: `import { TimelineItem } from "@skryensya/react/timeline"`.
- HTML: a `<li>`, no JavaScript needed.

- Goes inside: `Timeline`.

**Options**

| Option | Values | Default |
|---|---|---|
| `time` | string |  |
| `tone` | "neutral" \| "accent" \| "success" \| "warning" \| "danger" | `"neutral"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |
| `heading` | text | yes |
| `icon` | one of `Icon` |  |
| `time` (React: `timeLabel`) | text |  |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-timeline-body-fg`, `--sk-timeline-connector-color`, `--sk-timeline-connector-size`, `--sk-timeline-content-gap`, `--sk-timeline-first-line`, `--sk-timeline-heading-fg`, `--sk-timeline-heading-font-size`, `--sk-timeline-item-gap`, `--sk-timeline-marker-color`, `--sk-timeline-marker-size`, `--sk-timeline-measure`, `--sk-timeline-rail`, `--sk-timeline-time-fg`.
