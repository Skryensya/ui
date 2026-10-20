# 001 — Slow the MorphStack open and close

- **Status**: TODO
- **Commit**: a52905e1
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file, ~12 lines

## Problem

The stack swings (rotateX, rotateZ, scale) and slides 3–5 plates in 320ms, on `cubic-bezier(0.2, 0, 0, 1)`, a curve that
covers most of the distance in the first ~100ms. The tilt and the plates all start together, so the open reads as a
snap, and the stagger (`0.15 × 320ms = 48ms` per share) is too short to be seen as a sequence.

```css
/* packages/core/css/components/morph-stack.css:47 and :107 — current */
--sk-morph-stack-stagger: 0.15;
transition: transform var(--motion-expand-duration) var(--motion-expand-easing);
```

`--motion-expand-duration` is `--scale-duration-slow` (320ms, `semantic/_motion.scss:66`) and is shared by every
expanding surface, so the global token must NOT change.

## Target

A component-owned duration hook that scales the system's expand time, so a retuned system and reduced motion still move
it, and a longer stagger:

```css
.sk-morph-stack {
  /* 2x the system's expand time: the 3D swing needs longer than a disclosure. Instant in reduced motion (2 x 0). */
  --sk-morph-stack-duration: calc(var(--motion-expand-duration) * 2);
  --sk-morph-stack-stagger: 0.2;
}
```

Every `transition` and `transition-duration` / `transition-delay` in the file reads `var(--sk-morph-stack-duration)`
where it read `var(--motion-expand-duration)`. Easing stays `var(--motion-expand-easing)` (hooks must resolve to
tokens; `scripts/lint.ts` enforces it). Result: ~640ms swing, 128ms per stagger share, last plate done at ~1.0s.

## Repo conventions to follow

- Hooks are declared at the top of `.sk-morph-stack` and listed in `packages/core/src/morph-stack.ts` (`hooks` array,
  around line 55-65): add `"--sk-morph-stack-duration"` there, alphabetical, or lint fails.
- The `@media (prefers-reduced-motion)` and `data-motion="reduced"` blocks set `transition: none`; leave them.

## Steps

1. In `packages/core/css/components/morph-stack.css`, add `--sk-morph-stack-duration` as above and change
   `--sk-morph-stack-stagger` from `0.15` to `0.2`.
2. Replace every `var(--motion-expand-duration)` in that file with `var(--sk-morph-stack-duration)` (stage transition,
   plate transitions, the three `transition-duration` groups and the three `transition-delay` calcs).
3. Add `"--sk-morph-stack-duration"` to the hooks list in `packages/core/src/morph-stack.ts`.
4. Update the header comment ("THE STAGGER IS THE SYSTEM'S TIME, DIVIDED") to say the duration is the expand time
   doubled.

## Boundaries

- Do NOT change `--motion-expand-duration` or any semantic token.
- Do NOT change easing, transforms or the structure of the plates.
- Do NOT touch docs pages or demos.

## Verification

- **Mechanical**: `cd packages/core && node scripts/lint.ts && node scripts/build-css.ts` passes.
- **Feel check**: open /components/morph-stack, hover the stack and leave it. The swing should read as one deliberate
  motion with the plates arriving one after another, not a snap. Check with DevTools animation speed at 10%: the plates
  must start in order, near side first, and closing must have no delay. Turn on reduced motion: no animation.
