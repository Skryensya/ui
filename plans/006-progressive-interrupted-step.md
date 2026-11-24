# 006: Make an interrupted ProgressiveCarousel step continue, not restart

- **Status**: TODO
- **Commit**: 77db5aaa
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 1 file, ~15 lines

## Problem

Every `run` restarts the clock and eases from zero velocity-wise: clicking next twice quickly makes each slide start fast again from where it is, a visible jolt.

```ts
// packages/core/src/progressive-carousel.ts:~205, current
started = performance.now();
if (!frame) frame = requestAnimationFrame(tick);
```

## Target

When a move is already running, a new `run` uses a shorter duration so a burst of steps resolves quickly and the retargeting jolt is brief: `duration = frame ? Math.round(ms * 0.6) : ms`. (A true velocity-carrying spring is out of scope; this keeps the single-clock design.)

## Repo conventions to follow

- Keep `from`/`to` retargeting from `now` exactly as `run` does today.

## Steps

1. Requires plan 003 (`duration` variable and `ms` parameter).
2. In `run`, before `started = performance.now();`, set `duration = frame ? Math.round(ms * 0.6) : ms;` (`frame` is non-zero while a move is under way).
3. Do not change `comeBack`: it is called from `tick` after `frame = 0`, so it always gets the full duration.

## Boundaries

- Do NOT touch the pure helpers (`progressiveWidths`, `progressiveGaps`, `progressiveHover`, `progressiveSlot`, `forwardDistance`) or their tests.
- Do NOT change markup or add dependencies. Do NOT start a dev server; ask the user to run it.
- If a step does not match the code (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: from `packages/core` run `../../node_modules/.bin/tsc --noEmit -p .` (no output = pass) and, where vitest is installed, `vitest run src/progressive-carousel.test.ts`.
- **Feel check** (ask the user to run it): open the ProgressiveCarousel docs page, then:
  - Click next 4 times in ~600 ms: it ends on the 4th slide without the strips visibly restarting their burst each click. A single click is unchanged.
  - Spam next/prev: no slide ever stays stranded past an edge.
  - Toggle `prefers-reduced-motion` (DevTools, Rendering) and confirm nothing regresses.
- **Done when**: bursts settle faster than a sum of full steps, single steps unchanged.
