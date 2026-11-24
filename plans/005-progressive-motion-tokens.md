# 005: Drive the ProgressiveCarousel durations from CSS custom properties

- **Status**: TODO
- **Commit**: 77db5aaa
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 2 files, ~20 lines

## Problem

The engine hardcodes its durations and curve while the rest of the carousel (caption, controls) follows `--sk-carousel-motion-duration` and the `--motion-state-change-*` tokens, so themes and `data-motion` cannot retune it.

```css
/* packages/core/css/components/carousel.css:65, current */
--sk-carousel-motion-duration: var(--motion-state-change-duration);
```
The primitive tokens are `--scale-duration-fast: 120ms` and `--scale-duration-slow: 320ms` (`css/primitives/_motion.scss`): neither equals a 420 ms step, so this plan adds component tokens, not a remap.

## Target

Two component custom properties on the progressive root, read once per `layout()` with the constants of plan 003 as fallback:

```css
.sk-carousel[data-progressive] {
  --sk-carousel-progressive-step: 420ms;
  --sk-carousel-progressive-hover: 200ms;
}
```
Engine: `stepMs = parseFloat(getComputedStyle(root).getPropertyValue("--sk-carousel-progressive-step")) || STEP_DURATION` (same for hover). A value written in `s` is not supported: document ms only.

## Repo conventions to follow

- Custom properties are declared in `packages/core/css/components/carousel.css` inside the existing `.sk-carousel[data-progressive]` block (~line 690); the token list in `packages/core/src/carousel.ts:176-190` names every `--sk-carousel-*` custom property, add both there in alphabetical position.

## Steps

1. Requires plan 003 (the two durations exist as constants).
2. Add the two properties to the `.sk-carousel[data-progressive]` block in `carousel.css`.
3. Add both names to the token list in `packages/core/src/carousel.ts` (sorted).
4. In `packages/core/src/progressive-carousel.ts` replace direct uses of `STEP_DURATION`/`HOVER_DURATION` in `run`/`onHover` with `let stepMs`/`hoverMs` refreshed in `layout()` from `getComputedStyle(root)`.
5. If the repo has a test or gate that snapshots the token list (`artifacts/ai-manifest.json`, `install-manifest.json`), STOP and tell the user to regenerate it; do not hand-edit generated artifacts.

## Boundaries

- Do NOT touch the pure helpers (`progressiveWidths`, `progressiveGaps`, `progressiveHover`, `progressiveSlot`, `forwardDistance`) or their tests.
- Do NOT change markup or add dependencies. Do NOT start a dev server; ask the user to run it.
- If a step does not match the code (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: from `packages/core` run `../../node_modules/.bin/tsc --noEmit -p .` (no output = pass) and, where vitest is installed, `vitest run src/progressive-carousel.test.ts`.
- **Feel check** (ask the user to run it): open the ProgressiveCarousel docs page, then:
  - In DevTools set `--sk-carousel-progressive-step: 1500ms` on the root: a step takes ~1.5 s. Remove it: back to 420 ms.
  - Spam next/prev: no slide ever stays stranded past an edge.
  - Toggle `prefers-reduced-motion` (DevTools, Rendering) and confirm nothing regresses.
- **Done when**: changing the custom property changes the move, defaults match plan 003.
