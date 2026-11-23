# Animation plans

| # | Plan | Severity | Status |
|---|------|----------|--------|
| 001 | [Slow the MorphStack open and close](001-morph-stack-slower-expand.md) | MEDIUM | TODO |
| 002 | [Smooth the brutalist button press, stop hover shadow growth](002-brutalist-button-press-smooth.md) | HIGH | DONE |
| 003 | [ProgressiveCarousel: hover gets its own shorter duration](003-progressive-hover-faster.md) | HIGH | TODO |
| 004 | [ProgressiveCarousel: keep a short fade under reduced motion](004-progressive-reduced-motion-fade.md) | MEDIUM | TODO |
| 005 | [ProgressiveCarousel: durations from CSS custom properties](005-progressive-motion-tokens.md) | MEDIUM | TODO |
| 006 | [ProgressiveCarousel: interrupted step continues, not restarts](006-progressive-interrupted-step.md) | MEDIUM | TODO |

**ProgressiveCarousel order:** 003 first (the others build on its `duration` variable), then 004, 006, 005. Plans 004, 005 and 006 all depend on 003 and touch `run()` in `packages/core/src/progressive-carousel.ts`, so run them one after another, not in parallel.
