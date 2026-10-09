import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * SCROLL EXPAND, a container that opens from a small window to fill the whole box as the page scrolls. When it is
 * full, the page goes on and shows what comes after.
 *
 * THE CONTAINER HOLDS ANYTHING. It is not an image: it is a box that opens, and what is inside is the author's (a photo,
 * a video, a piece of interface, a map). The component owns only the opening.
 *
 * TWO LAYERS INSIDE IT. `children` is what FILLS the container, the backdrop: it is there from the first frame, in the
 * small window. `reveal` is what ARRIVES: it sits centred over the backdrop and fades up into place as the window opens,
 * its children one after another, so the smaller words are never cut off by a window too small for them and never
 * compete with the picture until it is big enough to carry them. An optional wash (`--sk-scroll-expand-scrim`) fades in
 * with it, so the words are readable over a photo.
 *
 * AND IT OWNS NO TEXT. The big words above the window before it opens go in the `lead` slot: the component fades that
 * box out (and lifts it a little) as the window opens, whatever is in it, and never touches the words themselves. The
 * smaller words are the author's, in `reveal`. Two places for two kinds of words, and neither is the component's.
 *
 * It is a different move from Scroll Stack. A stack is two sections and a cover; this is one stage HELD in place for one
 * box-height of scroll while the container opens, then released. Nothing scrolls past the reader while it opens.
 *
 * THE WINDOW IS A CLIP, NOT A SIZE. The container is always laid out at full size and a `clip-path` opens from a
 * centred inset to nothing. Paint changes and layout never does, so what is inside is neither squashed nor re-flowed,
 * and the small window shows the middle of the very thing that ends up filling the box.
 *
 * TWO DIRECTIONS, ONE OPTION. `expand` opens from a small window to full; `contract` is the same move run backwards:
 * it starts full and closes to the window as the reader scrolls, the reveal leaves and the lead returns. The option exists because this
 * is a second way to use the same stage, not a knob on the first: how far, how round and how fast stay CSS hooks.
 *
 * ONE BOX-HEIGHT OF RUNWAY. The opening takes exactly one height of the scrolling box. Longer would need the timeline
 * to be measured against an oversized box, which browsers disagree on.
 *
 * CSS ONLY, AND PROGRESSIVE. Without scroll-driven animation, or with reduced motion, the stage is not held: the lead
 * comes first, the container follows at full size, then whatever comes after. A correct page with nothing missing.
 *
 * THE SEMANTICS ARE THE AUTHOR'S. The parts are plain `div`s with no role.
 */
export const scrollExpandParts = {
  root: "sk-scroll-expand",
  /** As tall as two boxes: one for the stage, one of scroll while it is held. */
  track: "sk-scroll-expand__track",
  /** A box the height of the scrolling box, at the top of the track and invisible. Its journey out of the box IS the timeline. */
  clock: "sk-scroll-expand__clock",
  /** The part held in place (sticky) while the container opens. */
  stage: "sk-scroll-expand__stage",
  /** What stands in the band above the window before it opens. The box fades out, and lifts a little, as the window opens; what is in it is the author's. */
  lead: "sk-scroll-expand__lead",
  /** The box that opens. Always full size; a clip opens over it. What is inside is the author's. */
  container: "sk-scroll-expand__container",
  /** What fills the container from the first frame: the photo, the video, the tinted slab. */
  backdrop: "sk-scroll-expand__backdrop",
  /** What arrives as the window opens. Centred over the backdrop; each child rises into place after the one before. */
  reveal: "sk-scroll-expand__reveal",
  /** What follows once the container is full: normal flow, scrolled like any other content. */
  after: "sk-scroll-expand__after",
} as const;

export type ScrollExpandPart = keyof typeof scrollExpandParts;
export type ScrollExpandPartClass = (typeof scrollExpandParts)[ScrollExpandPart];

export const scrollExpandContract = {
  id: "scroll-expand",
  category: "layout",
  css: "@skryensya/core/components/scroll-expand.css",
  parts: scrollExpandParts,
  hooks: [
    "--sk-scroll-expand-bg",
    "--sk-scroll-expand-container-bg",
    "--sk-scroll-expand-inset-block",
    "--sk-scroll-expand-inset-inline",
    "--sk-scroll-expand-lead-shift",
    "--sk-scroll-expand-radius",
    "--sk-scroll-expand-reveal-blur",
    "--sk-scroll-expand-reveal-shift",
    "--sk-scroll-expand-scrim",
  ],

  options: {
    /**
     * Which way the container goes. `expand` starts as a small window and opens to fill the box; `contract` starts
     * full and closes to the window. Without scroll-driven animation both are the same plain page, so this is a motion
     * choice and never a content one.
     */
    direction: {
      type: "enum",
      values: ["expand", "contract"],
      default: "expand",
      attr: "data-direction",
    },
  },

  signatures: {
    ScrollExpand: {
      intent: ["scroll-expand", "expanding-container", "box-grows-on-scroll", "hero-reveal", "scroll-reveal-fullscreen"],
      host: { element: "div" },
      options: ["direction"],
      forward: ["id", "aria-*"],
      slots: {
        /** What fills the container that opens, from the first frame: a photo, a video, a tinted slab. It should fill its box. */
        children: { accepts: "node", required: true },
        /** What arrives as the window opens, centred over the backdrop: the smaller words, the figures. Its children appear one after another. */
        reveal: { accepts: "node" },
        /** The big words above the window before it opens. Its box fades out as the container opens. */
        lead: { accepts: "node" },
        /** What follows once the container is full. */
        after: { accepts: "node" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "track",
            children: [
              { element: "span", part: "clock", attrs: { "aria-hidden": "true" } },
              {
                element: "div",
                part: "stage",
                children: [
                  { element: "div", part: "lead", slot: "lead", whenGiven: "lead" },
                  {
                    element: "div",
                    part: "container",
                    children: [
                      { element: "div", part: "backdrop", slot: "children" },
                      { element: "div", part: "reveal", slot: "reveal", whenGiven: "reveal" },
                    ],
                  },
                ],
              },
            ],
          },
          { element: "div", part: "after", slot: "after", whenGiven: "after" },
        ],
      },
      react: { from: "@skryensya/react/scroll-expand", name: "ScrollExpand" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: a hand-written union here would be a second place the values live. */
export type ScrollExpandDirection = OptionValue<typeof scrollExpandContract.options.direction>;
