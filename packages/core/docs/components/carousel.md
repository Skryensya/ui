# carousel

Category: content. Stylesheet: `@skryensya/core/components/carousel.css`. Signatures: `Carousel`, `Carousel.curve`, `Carousel.progressive`, `CarouselSlide`.

## Carousel

**Use when**

- there are many similar items and the horizontal space fits only a few: cards, photos
- it should show there is more to the side, with the next item peeking in

**Avoid when**

- the content matters and cannot depend on someone swiping; that is a grid
- there are a few items and they all fit; the carousel hides what already fitted
- it is a single message rotating on its own; that is little read and much disliked

Alternatives: `Grid`, `List`.

- React: `import { Carousel } from "@skryensya/react/carousel"`.
- HTML: a `<section>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `loop` | boolean | `false` |
| `autoplay` | boolean | `false` |
| `autoplayDelay` (React: `autoplay`) | number |  |
| `mounted` | boolean | `true` |
| `slideSize` | string |  |
| `orientation` | "horizontal" \| "vertical" |  |
| `controls` | "auto" \| "none" |  |
| `indicator` | "dots" \| "count" |  |
| `fade` | boolean | `false` |
| `mouseDrag` | "on" \| "off" |  |
| `align` | "start" \| "center" \| "end" |  |
| `slidesPerMove` | number |  |
| `snap` | "mandatory" \| "proximity" |  |
| `edgePadding` | string |  |
| `defaultPage` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `CarouselSlide` | yes |

**Accessible name**

- The machine gives the root role="region" and aria-roledescription="carousel", but neither names it: WAI-ARIA's Carousel pattern asks for a label naming the CONTENT ("Featured products", not "carousel", which the roledescription already says), the same landmark-naming rule `nav-list`/`tabs` already enforce for themselves. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `carousel/three-slides`; its copy is placeholder, replace it)

```tsx
import { Carousel, CarouselSlide } from "@skryensya/react/carousel";

export function CarouselExample() {
  return (
    <Carousel aria-label="Proyectos recientes">
      <CarouselSlide>Atlas</CarouselSlide>
      <CarouselSlide>Brújula</CarouselSlide>
      <CarouselSlide>Cardumen</CarouselSlide>
    </Carousel>
  );
}
```

```html
<section
  class="sk-carousel"
  data-sk-carousel
  aria-label="Proyectos recientes"
>
  <div class="sk-carousel__track">
    <div class="sk-carousel__slide">Atlas</div>
    <div class="sk-carousel__slide">Brújula</div>
    <div class="sk-carousel__slide">Cardumen</div>
  </div>
</section>
```

Stylesheets: `@skryensya/core/components/carousel.css`.

## Carousel.curve

**Use when**

- a page or section opens with a few pictures as its centrepiece, the middle one the star: a hero
- the pictures should read as one set seen in perspective, from outside the ring or from inside it

**Avoid when**

- people browse and compare a collection; the turned sides are hard to read, use a flat Carousel
- the slides carry much text; turned, the text on the sides cannot be read

Alternatives: `Carousel`, `Grid`.

- React: `import { CurveCarousel } from "@skryensya/react/carousel"`.
- HTML: a `<section>`, no JavaScript needed.

- Requires the options: `curve`.

**Options**

| Option | Values | Default |
|---|---|---|
| `curve` | "convex" \| "concave" |  |
| `curveStrength` | number |  |
| `tall` | boolean | `false` |
| `focus` | boolean | `false` |
| `bend` | boolean | `false` |
| `fade` | boolean | `false` |
| `infinite` | "on" \| "off" |  |
| `momentum` | "on" \| "off" |  |
| `autoplay` | boolean | `false` |
| `autoplayDelay` (React: `autoplay`) | number |  |
| `mounted` | boolean | `true` |
| `slideSize` | string |  |
| `defaultPage` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `CarouselSlide` | yes |

**Accessible name**

- The machine gives the root role="region" and aria-roledescription="carousel", but neither names it: WAI-ARIA's Carousel pattern asks for a label naming the CONTENT ("Featured products", not "carousel", which the roledescription already says), the same landmark-naming rule `nav-list`/`tabs` already enforce for themselves. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `carousel/curve-ring`; its copy is placeholder, replace it)

```tsx
import { CarouselSlide, CurveCarousel } from "@skryensya/react/carousel";

export function CurveCarouselExample() {
  return (
    <CurveCarousel curve="convex" aria-label="Trabajos destacados">
      <CarouselSlide>Atlas</CarouselSlide>
      <CarouselSlide>Brújula</CarouselSlide>
      <CarouselSlide>Cardumen</CarouselSlide>
    </CurveCarousel>
  );
}
```

```html
<section
  class="sk-carousel"
  data-sk-carousel
  data-curve="convex"
  data-align="center"
  aria-label="Trabajos destacados"
>
  <div class="sk-carousel__track">
    <div class="sk-carousel__slide">Atlas</div>
    <div class="sk-carousel__slide">Brújula</div>
    <div class="sk-carousel__slide">Cardumen</div>
  </div>
</section>
```

Stylesheets: `@skryensya/core/components/carousel.css`.

## Carousel.progressive

**Use when**

- a section shows a few stories or announcements one at a time, a big picture with its title and a link under it
- the next items should be in sight but not compete: strips that thin out beside the open one

**Avoid when**

- people should see and compare several items at once; use a flat Carousel or a Grid of cards
- the items have no picture; a strip of plain text says nothing, use Tabs or a list

Alternatives: `Carousel`, `Tabs`.

- React: `import { ProgressiveCarousel } from "@skryensya/react/carousel"`.
- HTML: a `<section>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `mounted` | boolean | `true` |
| `defaultPage` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `heading` | node |  |
| `items` | a list of items (below) | yes |

Each item in `items`: `media` (node, required), `title` (node, required), `body` (node), `action` (node).

**Accessible name**

- The machine gives the root role="region" and aria-roledescription="carousel", but neither names it: WAI-ARIA's Carousel pattern asks for a label naming the CONTENT ("Featured products", not "carousel", which the roledescription already says), the same landmark-naming rule `nav-list`/`tabs` already enforce for themselves. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `carousel/strips-news`; its copy is placeholder, replace it)

```tsx
import { ProgressiveCarousel } from "@skryensya/react/carousel";
import { items } from "./carousel-items";

export function ProgressiveCarouselExample() {
  return (
    <ProgressiveCarousel
      aria-label="Noticias"
      heading="Siempre al día"
      items={items}
    />
  );
}
```

`carousel-items.ts`:

```ts
export const items = [
  {
    media: "Atlas",
    title: "Atlas llega a Chile",
    body: "Pagos locales desde el primer día.",
  },
  { media: "Brújula", title: "Brújula, nueva versión" },
  { media: "Cardumen", title: "Cardumen abre su API" },
];
```

```html
<section
  class="sk-carousel"
  data-sk-carousel
  data-progressive
  aria-label="Noticias"
>
  <div class="sk-carousel__header">
    <div class="sk-carousel__heading">Siempre al día</div>
  </div>
  <div class="sk-carousel__track">
    <div class="sk-carousel__slide">Atlas</div>
    <div class="sk-carousel__slide">Brújula</div>
    <div class="sk-carousel__slide">Cardumen</div>
  </div>
  <div class="sk-carousel__captions">
    <div class="sk-carousel__caption">
      <p class="sk-carousel__caption-title">Atlas llega a Chile</p>
      <p class="sk-carousel__caption-body">
        Pagos locales desde el primer día.
      </p>
    </div>
    <div class="sk-carousel__caption">
      <p class="sk-carousel__caption-title">Brújula, nueva versión</p>
    </div>
    <div class="sk-carousel__caption">
      <p class="sk-carousel__caption-title">Cardumen abre su API</p>
    </div>
  </div>
</section>
```

Stylesheets: `@skryensya/core/components/carousel.css`.

## CarouselSlide

**Use when**

- it is one item of the carousel; anything can go inside, usually a card

**Avoid when**

- it is outside a Carousel or CurveCarousel; there is no track to fit into

- React: `import { CarouselSlide } from "@skryensya/react/carousel"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Carousel`, `Carousel.curve`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:carouselchange` | (none: listen on the element) | { index: number, count: number } |
| `sk:carouselgoto` (dispatch it to the root to drive the component) |  | { index: number } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-carousel-control-bg`, `--sk-carousel-control-border`, `--sk-carousel-control-disabled-fg`, `--sk-carousel-control-radius`, `--sk-carousel-control-fg`, `--sk-carousel-control-size`, `--sk-carousel-dot-active-color`, `--sk-carousel-dot-color`, `--sk-carousel-dot-gap`, `--sk-carousel-dot-size`, `--sk-carousel-edge-padding`, `--sk-carousel-gap`, `--sk-carousel-motion-duration`, `--sk-carousel-motion-easing`, `--sk-carousel-native-next-disabled-icon`, `--sk-carousel-native-next-icon`, `--sk-carousel-native-previous-disabled-icon`, `--sk-carousel-native-previous-icon`, `--sk-carousel-curve-strength`, `--sk-carousel-progressive-hover`, `--sk-carousel-progressive-step`, `--sk-carousel-slide-size`.
