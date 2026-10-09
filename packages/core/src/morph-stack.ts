import type { ComponentContract, OptionsOf, OptionValue } from "./contract.js";

/*
 * MORPH STACK, plates laid flat on one another that fan out into an isometric stack.
 *
 * At rest the plates are one picture: the middle one is the picture, the ones in front of it sit a hair above it and the
 * ones behind it are not there yet. Expanded, the whole stack tilts into an isometric view while each plate moves along
 * its own depth: the front ones lift toward the viewer, the back ones appear below the middle one, and they read as layers
 * of one thing. It is for artwork that HAS layers (an interface over its structure over its data) and wants to show them
 * on a gesture.
 *
 * THREE TO FIVE PLATES, named by depth and not by number. `back`, `middle` and `front` are the stack, and two more may be
 * added at the ends: `deepest` behind the back and `nearest` in front of the front. Two plates would be a peel and a sixth
 * would be a list; three is the smallest stack that has an inside and five is the most whose layers a reader can still tell
 * apart once they are tilted. The names are a fixed set, and not a collection, because the stylesheet cannot know which
 * position a sibling is in: each part has its own place around the middle one (-2, -1, 0, +1, +2) and the travel is that
 * place times one gap. A stack without `deepest` or `nearest` is the same stack with the end plate missing, nothing moves
 * to fill it. The plates' content is the author's: an image, an inline svg, any component.
 *
 * `state` IS THE CONSUMER'S, WITH ONE WAY TO LEAVE IT TO THE POINTER. `rest` and `expanded` are written and stay: whether a
 * stack is open is the product's fact (a selected card, a step of a tour). `auto`, the default, is the stack answering to a
 * hand: it expands while a fine pointer is over it and while focus is inside it, and does nothing on a touch screen, where
 * hover does not exist and a tap should not reshape a picture. `auto-inverse` is its opposite: open until a hand arrives. There is no JavaScript and no `onChange`: nothing is
 * decided here that a consumer needs to hear about, and a consumer who does need to hear it already owns the attribute.
 *
 * NO MOTION OPTIONS. How far each plate travels and how steeply the stack tilts are CSS hooks, in lengths and degrees a
 * designer can read, not an object of springs. The timing is the system's (`expand` and `collapse` intents, ADR-4), so a
 * retuned system moves this with it. Reduced motion keeps both states and a quarter of the travel, at once.
 */
export const morphStackParts = {
  root: "sk-morph-stack",
  /** The box that tilts. Everything that moves in 3D is inside it; the root only holds the perspective. */
  stage: "sk-morph-stack__stage",
  /** Optional. Behind the back plate, two gaps behind the middle one. Invisible at rest, like the back plate. */
  deepest: "sk-morph-stack__deepest",
  /** Behind the middle plate, one gap. Invisible at rest and fades in as it moves back. */
  back: "sk-morph-stack__back",
  /** The picture the others are laid on. It does not travel; the stack tilts around it. */
  middle: "sk-morph-stack__middle",
  /** Over the middle plate, one gap toward the viewer. A hair above it at rest. */
  front: "sk-morph-stack__front",
  /** Optional. Over the front plate, two gaps toward the viewer. A little higher than the front plate at rest. */
  nearest: "sk-morph-stack__nearest",
} as const;

export type MorphStackPart = keyof typeof morphStackParts;
export type MorphStackPartClass = (typeof morphStackParts)[MorphStackPart];

export const morphStackContract = {
  id: "morph-stack",
  category: "content",
  css: "@skryensya/core/components/morph-stack.css",
  parts: morphStackParts,
  hooks: [
    "--sk-morph-stack-back-opacity",
    "--sk-morph-stack-gap",
    "--sk-morph-stack-perspective",
    "--sk-morph-stack-rotate-x",
    "--sk-morph-stack-rotate-z",
    "--sk-morph-stack-scale",
    "--sk-morph-stack-size",
    "--sk-morph-stack-slide-x",
    "--sk-morph-stack-slide-y",
    "--sk-morph-stack-stagger",
  ],

  options: {
    /*
     * `auto` answers to a fine pointer and to focus: closed, and open while either is there. `auto-inverse` is the same
     * answer turned over: open, and closed while either is there, so the picture shows its layers until a hand comes to
     * it and then settles into one piece. On a touch screen, where there is no hover, each stays in its resting state:
     * `auto` closed and `auto-inverse` open. `rest` and `expanded` are the consumer's word and ignore both.
     * They are one enum rather than a boolean plus a mode because "unset" is a real third thing here, and a boolean that
     * can also be absent is how a stack ends up half controlled; the inverse is a value, not a second option, because it
     * only means something while the stack is left to the pointer.
     */
    state: {
      type: "enum",
      values: ["auto", "auto-inverse", "rest", "expanded"],
      default: "auto",
      attr: "data-state",
    },
    /*
     * Which way the stack turns when it opens. `start` is the default turn and `end` is its mirror image: the same tilt,
     * the same travel, turned the other way, with the front plate sliding to the opposite side. Logical rather than
     * `left` and `right` so that it follows the writing direction, as `peelOrigin` does on Sticker: in a right-to-left
     * page `start` turns the way `end` does in a left-to-right one, and a stack beside text reads as pointing at it
     * either way. A real choice and not a signed `rotate-z` hook, because the front plate's slide has to mirror with it
     * and one number cannot say both.
     */
    turn: {
      type: "enum",
      values: ["start", "end"],
      default: "start",
      attr: "data-turn",
    },
    /*
     * How close the viewer stands: any CSS length, or `none` for a flat, orthographic tilt. A small value is a wide-angle
     * lens (the near plate looms, the far one shrinks), a large one is a telephoto (the plates stay the same size and
     * only the angle reads). It is an option and not only a hook because it is the one number a page tunes to the SIZE
     * it draws the stack at: the depth hooks are lengths, so a stack drawn small wants a closer lens, and a consumer who
     * sizes it from outside needs to say so from outside too, in a typed prop and not in a stylesheet.
     *
     * Written to `--sk-morph-stack-perspective`, so the hook and the option are one thing: unset, the stylesheet's own
     * value applies, and a stylesheet rule or an inline style of the consumer's still wins over it.
     */
    perspective: {
      type: "string",
      styleProperty: "--sk-morph-stack-perspective",
    },
  },

  signatures: {
    MorphStack: {
      intent: ["morph-stack", "layer-stack", "isometric-layers", "exploded-view", "hover-to-reveal-layers"],
      host: { element: "div" },
      options: ["state", "turn", "perspective"],
      forward: ["id", "aria-*"],
      slots: {
        /** Optional fifth plate, behind the back one. Revealed last, and invisible at rest. */
        deepest: { accepts: "node" },
        /** Revealed behind the middle plate when the stack opens. Invisible at rest. */
        back: { accepts: "node", required: true },
        /** The picture at rest. */
        middle: { accepts: "node", required: true },
        /** Lifted toward the viewer when the stack opens. */
        front: { accepts: "node", required: true },
        /** Optional fifth plate, over the front one. Lifted furthest. */
        nearest: { accepts: "node" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "stage",
            children: [
              { element: "div", part: "deepest", slot: "deepest", whenGiven: "deepest" },
              { element: "div", part: "back", slot: "back" },
              { element: "div", part: "middle", slot: "middle" },
              { element: "div", part: "front", slot: "front" },
              { element: "div", part: "nearest", slot: "nearest", whenGiven: "nearest" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/morph-stack", name: "MorphStack" },
    },
  },
} as const satisfies ComponentContract;

/* Derived, never restated. */
export type MorphStackState = OptionValue<typeof morphStackContract.options.state>;
export type MorphStackTurn = OptionValue<typeof morphStackContract.options.turn>;
export type MorphStackOptions = OptionsOf<typeof morphStackContract>;
