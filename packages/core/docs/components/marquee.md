# marquee

Category: content. Stylesheet: `@skryensya/core/components/marquee.css`. Signatures: `Marquee`, `Marquee.autoplay`.

## Marquee

**Use when**

- a short, repeated band gains meaning by moving, but the motion should only start after the person asks for it
- logos, names or words form a continuous visual rhythm and are neither destinations nor controls
- a short column of inert marks or updates needs to travel up or down within a defined visible height
- once started by the person, the band keeps its rhythm under the pointer: hover does not revoke an explicit decision
- a Play/Pause control is required no matter what: here the button is not optional, it is the only cause of motion there is

**Avoid when**

- the content has links, buttons or any focus stop; duplicating them creates repeated controls, and that is a Carousel or a list
- each item matters separately or has to be compared; motion lowers its legibility
- the band has to update live data; a marquee repeats paint, it does not announce changes

Alternatives: `Carousel`, `Inline`.

- React: `import { Marquee } from "@skryensya/react/marquee"`.
- HTML: a `<div>` with `data-sk-marquee`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `direction` | "left" \| "right" \| "up" \| "down" | `"left"` |
| `speed` | "slow" \| "normal" \| "fast" | `"normal"` |
| `fade` | "edges" \| "none" | `"edges"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `pauseLabel` | text | yes |
| `playLabel` | text | yes |

**Example** (canonical tree `marquee/requested`; its copy is placeholder, replace it)

```tsx
import { Marquee } from "@skryensya/react/marquee";

export function MarqueeExample() {
  return (
    <Marquee
      speed="slow"
      playLabel="Reproducir movimiento"
      pauseLabel="Pausar movimiento"
    >
      NORTHSTAR
    </Marquee>
  );
}
```

```html
<div
  class="sk-marquee"
  data-sk-marquee
  data-direction="left"
  data-speed="slow"
  data-fade="edges"
  data-start="manual"
  data-state="paused"
>
  <div class="sk-marquee__viewport">
    <div class="sk-marquee__track">
      <div class="sk-marquee__content">NORTHSTAR</div>
      <div class="sk-marquee__content" aria-hidden="true">NORTHSTAR</div>
    </div>
  </div>
  <button
    class="sk-marquee__toggle sk-button sk-interactive"
    type="button"
    data-appearance="plain"
    data-variant="soft"
    data-tone="neutral"
    data-size="sm"
    data-icon-only
    data-sk-button
    aria-pressed="false"
  >
    <span class="sk-marquee__glyph" aria-hidden="true"></span>
    <span class="sk-marquee__label sk-visually-hidden" data-action="play">
      Reproducir movimiento
    </span>
    <span
      class="sk-marquee__label sk-visually-hidden"
      data-action="pause"
      hidden
    >
      Pausar movimiento
    </span>
  </button>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/marquee.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Marquee.autoplay

**Use when**

- the band is secondary ambience and can start on its own without hiding or replacing needed information
- the content is decorative and can be ignored completely, so the band can run with no control (`control` is off)
- the band carries something someone might want to read, so `control` is turned on and the cost of the pause button is accepted
- a secondary column of inert marks or updates adds context by travelling up or down without replacing needed information
- the band pauses temporarily on hover or focus, besides the persistent control; that pause helps inspecting the marks without replacing the control

**Avoid when**

- the motion adds neither information nor identity; a still row does the same job without distracting
- there is no room for the pause button; then there is no room for automatic motion lasting more than five seconds
- `control` is turned off over content that is not decorative: without that button the band falls outside WCAG 2.2.2, because hover is an aid and not a mechanism, and with inert children nothing takes focus
- the content is essential to complete a task; it must not pass through the view temporarily

Alternatives: `Marquee`, `Carousel`, `Inline`.

- React: `import { AutoplayMarquee } from "@skryensya/react/marquee"`.
- HTML: a `<div>` with `data-sk-marquee`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `direction` | "left" \| "right" \| "up" \| "down" | `"left"` |
| `speed` | "slow" \| "normal" \| "fast" | `"normal"` |
| `fade` | "edges" \| "none" | `"edges"` |
| `control` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `pauseLabel` | text |  |
| `playLabel` | text |  |

**Example** (canonical tree `marquee/autoplay`; its copy is placeholder, replace it)

```tsx
import { AutoplayMarquee } from "@skryensya/react/marquee";

export function AutoplayMarqueeExample() {
  return (
    <AutoplayMarquee direction="right" speed="normal">
      NORTHSTAR
    </AutoplayMarquee>
  );
}
```

```html
<div
  class="sk-marquee"
  data-sk-marquee
  data-direction="right"
  data-speed="normal"
  data-fade="edges"
  data-start="auto"
  data-state="playing"
>
  <div class="sk-marquee__viewport">
    <div class="sk-marquee__track">
      <div class="sk-marquee__content">NORTHSTAR</div>
      <div class="sk-marquee__content" aria-hidden="true">NORTHSTAR</div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/marquee.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-marquee-cadence-duration`, `--sk-marquee-duration`, `--sk-marquee-fade-lead`, `--sk-marquee-fade-size`, `--sk-marquee-fade-trail`, `--sk-marquee-gap`, `--sk-marquee-gap-fill`, `--sk-marquee-run-gap`, `--sk-marquee-vertical-size`.
