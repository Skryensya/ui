import type { ComponentContract } from "./contract.js";

/*
 * SCROLL STACK, two sections where the second one slides up OVER the first as the page scrolls.
 *
 * The first (`back`) stays where it is and recedes: it scales down, sinks a little, dims, and rounds its corners (and can blur and fade) as the
 * second (`front`) rises over it. The second enters from the bottom with its content slightly zoomed in, and settles
 * to its natural size as it docks at the top. That is the whole component, and it is deliberately subtle: a cover that
 * says "the next thing is on top of this one" without asking to be looked at.
 *
 * EXACTLY TWO LAYERS. A third would repeat the same move, but "one behind, one in front" is what can be tested and
 * documented to the end, and the shape leaves room to grow without breaking: nothing in the contract names a count.
 *
 * NO OPTIONS. How subtle it is depends on a handful of numbers (how far the back recedes, how much it dims, the zoom
 * of the entry), and they are CSS hooks, not options: an intensity picker would invite configuring what should be right
 * by default, and anyone can tune a variable. An option is added the day there is a second way to use it.
 *
 * CSS ONLY, AND PROGRESSIVE. The motion is driven by the scroll itself (`animation-timeline`), with the sticky back layer
 * following the front layer's own travel through a named timeline. A browser without that support, or a reader who asks
 * for reduced motion, gets the two sections one after the other in normal flow: a correct page with nothing missing.
 * There is no JavaScript and no fallback script, because what is lost is an adornment and never a function.
 *
 * THE SEMANTICS ARE THE AUTHOR'S. The layers are plain `div`s with no role: whoever uses the component puts a `section`,
 * a heading and a name inside, since an unnamed `section` is not a landmark anyway.
 */
export const scrollStackParts = {
  root: "sk-scroll-stack",
  /** The section that stays behind. Sticky, at least as tall as the scrolling box, and the one that recedes. */
  back: "sk-scroll-stack__back",
  /** The section that rises over it: opaque, with its top corners rounded while it travels. */
  front: "sk-scroll-stack__front",
  /**
   * A box the height of the scrolling box (less the held line), laid at the top of the front layer and otherwise invisible. Its journey
   * through the scrollport IS the animation's timeline: progress 0 when the front layer's top edge is at the bottom of
   * the box, progress 1 when it has docked, right under the held line. Measuring the front layer itself would not do, because a tall one
   * is not fully "in" for a long time after it has finished covering the back.
   */
  runway: "sk-scroll-stack__runway",
  /**
   * What the front layer holds. It is what zooms: the layer's own edges stay put while the content settles. Its direct
   * children ARRIVE as the layer rises, one after another (rise, appear): give it a heading and the paragraphs under it
   * as separate children and the cascade shows; a single child arrives as one piece.
   */
  content: "sk-scroll-stack__content",
} as const;

export type ScrollStackPart = keyof typeof scrollStackParts;
export type ScrollStackPartClass = (typeof scrollStackParts)[ScrollStackPart];

export const scrollStackContract = {
  id: "scroll-stack",
  category: "layout",
  css: "@skryensya/core/components/scroll-stack.css",
  parts: scrollStackParts,
  hooks: [
    "--sk-scroll-stack-content-gap",
    "--sk-scroll-stack-content-padding",
    "--sk-scroll-stack-front-bg",
    "--sk-scroll-stack-front-docked-radius",
    "--sk-scroll-stack-front-radius",
    "--sk-scroll-stack-front-shadow",
    "--sk-scroll-stack-offset",
    "--sk-scroll-stack-recede-blur",
    "--sk-scroll-stack-recede-dim",
    "--sk-scroll-stack-recede-opacity",
    "--sk-scroll-stack-recede-radius",
    "--sk-scroll-stack-recede-shift",
    "--sk-scroll-stack-recede-scale",
    "--sk-scroll-stack-reveal-blur",
    "--sk-scroll-stack-reveal-opacity",
    "--sk-scroll-stack-reveal-shift",
    "--sk-scroll-stack-zoom",
  ],

  options: {},

  signatures: {
    ScrollStack: {
      intent: ["scroll-stack", "stacked-sections", "cover-on-scroll", "sticky-hero-then-content", "scroll-reveal-sheet"],
      host: { element: "div" },
      options: [],
      forward: ["id", "aria-*"],
      slots: {
        /** The section that stays behind and recedes. Should fit the scrolling box: it is held in place while covered. */
        back: { accepts: "node", required: true },
        /** The section that rises over it. Any height; opaque, so it can cover. Several children arrive one after another as it rises. */
        front: { accepts: "node", required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "div", part: "back", slot: "back" },
          {
            element: "div",
            part: "front",
            children: [
              { element: "span", part: "runway", attrs: { "aria-hidden": "true" } },
              { element: "div", part: "content", slot: "front" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/scroll-stack", name: "ScrollStack" },
    },
  },
} as const satisfies ComponentContract;
