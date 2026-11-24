# 003: Give the ProgressiveCarousel hover its own, shorter duration

- **Status**: TODO
- **Commit**: 77db5aaa
- **Severity**: HIGH
- **Category**: Purpose & frequency / Duration
- **Estimated scope**: 1 file, ~10 lines

## Problem

The hover (tens of times per day) retargets every slide with the same 520 ms move used for a step. Sweeping the mouse over the strips feels sticky.

```ts
// packages/core/src/progressive-carousel.ts:104, current
const DURATION = 520;
// run() always does `started = performance.now()` and tick() divides by DURATION
```
Callers of `run`: `onHover` (hover), `move` (step), `comeBack` (second leg of a wrapped slide).

## Target

Step and second leg keep a long move; hover is short, same curve (`1 - (1 - p) ** 5`, which approximates `cubic-bezier(0.23, 1, 0.32, 1)`).

```ts
const STEP_DURATION = 420;
const HOVER_DURATION = 200;
```
`run(targets, then, duration = STEP_DURATION)` stores the duration in a module-level `let duration` that `tick` divides by. `onHover` passes `HOVER_DURATION`.

## Repo conventions to follow

- Constants sit at the top of `packages/core/src/progressive-carousel.ts` next to `ease` and `lerp`; keep the one-clock design (no per-slide timing).

## Steps

1. In `packages/core/src/progressive-carousel.ts`, replace `const DURATION = 520;` with the two constants above (keep the doc comment, update it to mention both).
2. Add `let duration = STEP_DURATION;` beside `let started = 0;`.
3. Give `run` a third parameter `ms = STEP_DURATION` and set `duration = ms;` at its top.
4. In `tick`, replace `/ DURATION` with `/ duration`.
5. In `onHover`, call `run(targets, after, HOVER_DURATION);`.
6. Note: `comeBack` and `move` call `run` without the third argument and keep `STEP_DURATION`.

## Boundaries

- Do NOT touch the pure helpers (`progressiveWidths`, `progressiveGaps`, `progressiveHover`, `progressiveSlot`, `forwardDistance`) or their tests.
- Do NOT change markup or add dependencies. Do NOT start a dev server; ask the user to run it.
- If a step does not match the code (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: from `packages/core` run `../../node_modules/.bin/tsc --noEmit -p .` (no output = pass) and, where vitest is installed, `vitest run src/progressive-carousel.test.ts`.
- **Feel check** (ask the user to run it): open the ProgressiveCarousel docs page, then:
  - Sweep the mouse across the strips: they follow the pointer promptly, no lag. A step (next button) still reads as a smooth, slightly longer move.
  - Spam next/prev: no slide ever stays stranded past an edge.
  - Toggle `prefers-reduced-motion` (DevTools, Rendering) and confirm nothing regresses.
- **Done when**: no remaining reference to `DURATION` alone, tsc passes, hover visibly snappier than a step.
