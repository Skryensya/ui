# 004 — Keep a short fade under reduced motion in the ProgressiveCarousel

- **Status**: TODO
- **Commit**: 77db5aaa
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, ~15 lines

## Problem

With reduced motion every slide jumps to its target, opacity included, so a step is a hard cut. Reduced motion should drop movement, not all feedback.

```ts
// packages/core/src/progressive-carousel.ts:199 — current
if (prefersReducedMotion() || typeof requestAnimationFrame === "undefined") {
  cancelAnimationFrame(frame);
  frame = 0;
  for (const slide of slides) write(slide, to.get(slide)!);
  publishActive();
  after = null;
  then?.();
  return;
}
```

## Target

Reduced motion: `x` and `width` go straight to the target; only opacity is interpolated over 200 ms with the existing `smooth` fade. Without `requestAnimationFrame` (SSR/test) keep the instant path.

```ts
const REDUCED_DURATION = 200;
```

## Repo conventions to follow

- Reduced-motion check comes from `prefersReducedMotion()` in `packages/core/src/reduced-motion.ts` (system setting OR `data-motion="reduced"`); keep using it, never read `matchMedia` directly.

## Steps

1. Split the condition in `run`: keep the instant branch only for `typeof requestAnimationFrame === "undefined"`.
2. For `prefersReducedMotion()`: build the targets as `{ ...target, x: target.x, width: target.width }` but write `from` with the target's `x`/`width` and the old opacity, i.e. `from.set(slide, { ...to.get(slide)!, opacity: now.get(slide)!.opacity })`, set `duration = REDUCED_DURATION` (this plan assumes plan 003 landed; otherwise introduce the same `let duration` variable), then fall through to the rAF path.
3. Add `const REDUCED_DURATION = 200;` at the top with the other constants.
4. A slide that leaves keeps `to.opacity = 0`; per `lerp` it stays solid until progress 1, which is fine (the track clips it).

## Boundaries

- Do NOT touch the pure helpers (`progressiveWidths`, `progressiveGaps`, `progressiveHover`, `progressiveSlot`, `forwardDistance`) or their tests.
- Do NOT change markup or add dependencies. Do NOT start a dev server; ask the user to run it.
- If a step does not match the code (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: from `packages/core` run `../../node_modules/.bin/tsc --noEmit -p .` (no output = pass) and, where vitest is installed, `vitest run src/progressive-carousel.test.ts`.
- **Feel check** (ask the user to run it): open the ProgressiveCarousel docs page, then:
  - With reduced motion on, a step shows no sliding or growing: slides sit in place and the incoming one fades in over ~200 ms.
  - Spam next/prev: no slide ever stays stranded past an edge.
  - Toggle `prefers-reduced-motion` (DevTools, Rendering) and confirm nothing regresses.
- **Done when**: under reduced motion there is no position or width tween, only a fade; normal motion unchanged.
