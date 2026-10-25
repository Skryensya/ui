# 002 — Smooth the brutalist button press and stop its hover shadow from growing

- **Status**: DONE (hover + curve; then extended: face and shadow driven by one registered `--brutalist-travel`, face moves by left/top)
- **Commit**: 420090c3
- **Severity**: HIGH
- **Category**: Easing & duration (with Physicality)
- **Estimated scope**: 2 files (`packages/core/css/components/button.css`, `packages/ai-gates/src/button-brutalist.spec.ts`), ~15 lines. No library: CSS `transition` only.

## Problem

Two things make the brutalist press feel like a jump. Both were MEASURED in Chromium (frame-by-frame `getComputedStyle` of `translate` and `box-shadow` on a hovered solid brutalist Button, after mouse-down):

1. **Hover grows the shadow, and the press immediately takes it back.** Rest shadow is `5px 5px`; hover is `6px 6px` (`--brutalist-travel: -0.25` rounds 5 × 1.25 = 6.25 to 6). On mouse-down the shadow goes 6 → 1 while the face travels 0 → 4, so the face's far edge (translate + shadow) retreats from 6px to 5px: the button visibly lands 1px short of where hover had put it.
2. **The curve is almost all in the first frame.** Press uses `--motion-feedback-easing` = `--scale-easing-standard` = `cubic-bezier(0.2, 0, 0, 1)` over 120ms. Measured travel: 0 → 1.23px at 19ms → 2.58px at 35ms → 3.26px at 52ms → 4px at 136ms. About a third of the 4px move happens in one frame, then it crawls: that is a snap, not a press. Shadow and translate use the same curve and stay in lockstep (their sum is constant), so the sync is fine; only the curve and the hover growth are wrong.

```css
/* packages/core/css/components/button.css:709 — current */
  /* Hover reaches a notch further: the same hard offset, one pixel longer. No glow, no lift. */
  @media (any-hover: hover) {
    .sk-button[data-appearance="brutalist"]:hover:not(:disabled):not([aria-disabled="true"]) {
      --brutalist-travel: -0.25;
    }
  }
```

```css
/* packages/core/css/components/button.css:664 — current (inside .sk-button[data-appearance="brutalist"]) */
    transition:
      background-color var(--motion-state-change-duration) var(--motion-state-change-easing),
      border-color var(--motion-state-change-duration) var(--motion-state-change-easing),
      color var(--motion-state-change-duration) var(--motion-state-change-easing),
      box-shadow var(--motion-feedback-duration) var(--motion-feedback-easing),
      translate var(--motion-feedback-duration) var(--motion-feedback-easing);
```

The same hover rule exists in `packages/core/css/components/tile.css:540`. Out of scope here (see Boundaries).

## Target

1. Hover no longer changes the shadow. Delete the hover block entirely (hover feedback already comes from the state layer wash).
2. The brutalist face and its shadow move on one gentler curve, still an ease-out (it must start moving the instant the finger lands) but with a lower launch velocity, and inside the 100–160ms press budget.

```css
/* target — inside .sk-button[data-appearance="brutalist"], next to the other --brutalist-* internals */
    /* Press travel only. The shared feedback easing (0.2, 0, 0, 1) front-loads a third of a 4px move
     * into one frame; this launches softer and still lands under the finger. Face and shadow share
     * it, so their sum stays constant and the far edge never wobbles. Reduced motion: the
     * feedback duration token already goes instant, so this still has no block of its own. */
    --brutalist-press-easing: cubic-bezier(0.3, 0, 0.2, 1);
    transition:
      background-color var(--motion-state-change-duration) var(--motion-state-change-easing),
      border-color var(--motion-state-change-duration) var(--motion-state-change-easing),
      color var(--motion-state-change-duration) var(--motion-state-change-easing),
      box-shadow var(--motion-feedback-duration) var(--brutalist-press-easing),
      translate var(--motion-feedback-duration) var(--brutalist-press-easing);
```

Keep `--motion-feedback-duration` (120ms). Do not add a new duration token.

## Repo conventions to follow

- Internal appearance variables are named `--brutalist-*` and are deliberately not hooks (`button.css:623` comment). Put the new one beside `--brutalist-travel` at `button.css:647`, not in the contract's `hooks` list.
- The block at `button.css:664` is the exemplar: face and shadow transition on ONE tempo, and reduced motion is handled by the feedback duration token, not by a media block.
- Comments here say why, in prose, in the same voice as the surrounding ones.

## Steps

1. In `packages/core/css/components/button.css`, inside the `.sk-button[data-appearance="brutalist"]` rule (starts at line 632), add `--brutalist-press-easing: cubic-bezier(0.3, 0, 0.2, 1);` with the comment above, right after `--brutalist-reach: 1;` (line 649).
2. In the same rule's `transition` list (line 664), replace `var(--motion-feedback-easing)` with `var(--brutalist-press-easing)` on the `box-shadow` and `translate` lines only. Leave the three state-change lines as they are.
3. Delete the hover block at lines 709–715 (the comment line and the whole `@media (any-hover: hover) { … }`). Update the sentence at `button.css:607-612` ("ONE FORMULA FOR EVERY STATE") only if it names hover as a travel state.
4. In `packages/ai-gates/src/button-brutalist.spec.ts`, update the test at line 130 (`"hover reaches further, press drives the face into a fixed shadow, footprint unchanged"`): rename it to `"hover leaves the offset alone, press drives the face into a fixed shadow, footprint unchanged"` and change the assertion at line 139 from `toBeGreaterThan(rest.shadow!.y)` to `toBe(rest.shadow!.y)`. Check lines 140–160 and the two other `whileHovered` uses (lines ~287–290) for any other assumption that hover is larger than rest; fix only those.
5. Do not touch `button-group.css`: its `--brutalist-travel: 0` on vertical hover (line 432) becomes redundant but harmless; leave it.

## Boundaries

- Do NOT touch `tile.css` or any other component's brutalist hover/press. They share the formula and probably the same issue; that is a separate plan once this one is felt.
- Do NOT change `--motion-feedback-easing`/`--motion-feedback-duration` tokens: other components (checkbox, switch, tactile, scale) depend on them.
- Do NOT change the press travel distance, the offsets (5/4/2px) or the `round(nearest)` math.
- Do NOT add a dependency or any JS: this is CSS transition only.
- If the lines above do not match (drift since commit 420090c3), STOP and report.

## Verification

- **Mechanical**:
  - `cd packages/core && node scripts/lint.ts && npx vitest run` passes.
  - `cd packages/ai-gates && pnpm exec playwright test src/button-brutalist.spec.ts src/button-group.spec.ts` passes.
- **Feel check** (this cannot be judged from code; do it):
  - Hover a brutalist Button: the shadow stays exactly as at rest (computed `box-shadow` `5px 5px 0px 0px` for solid, 4px soft, 2px ghost).
  - Press and hold: the face travels into the shadow without a snap; the far edge (face + shadow) stays at 5px the whole time. Re-measure with the frame sampler: in the first two frames (~35ms) translate should be clearly under 2px (it was 2.58px), and the end state is still `translate: 4px 4px` with `box-shadow: 1px 1px`.
  - Release, and press/release rapidly 10 times: it never restarts from zero or lands off its rest position (CSS transitions retarget from the current value).
  - DevTools → Animations panel at 10%: confirm translate and box-shadow start and end together.
  - Check inside a ButtonGroup (brutalist): the press still uncovers the previous member's shadow.
  - Rendering panel → `prefers-reduced-motion: reduce`: the pressed state lands instantly, no travel animation.
- **Done when**: hover shadow equals rest shadow in every variant, and a frame-sampled press shows no single frame moving more than ~1.6px of the 4px travel.
