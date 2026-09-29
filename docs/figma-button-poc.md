# Figma POC: Button, vertical slice

The question: can Skryensya generate and update a useful native Figma Button from its existing
contract and token architecture without a second source of truth?

**Decision: REVISE.** The architecture holds: every axis, value, default, paint and dimension is
derived, and the lifecycle is idempotent. Four things need to change before a second component.
They are listed under [Decision](#decision). The decision record is
[ADR-0034](decisions/0034-figma-is-a-compile-target-fed-by-a-derived-manifest.md).

Branch `feat/figma-button-poc`. Scenarios C and D live on `figma-poc-scenario-c`, never merged.

## Architecture

```text
buttonContract ─┐
button.css ─────┤   cascade simulated per cell (jsdom + postcss, var() chains intact)
state-layer.css ┤
icon.css ───────┤
parseTokens() ──┤   token graph → Figma variables (alias / literal / evaluated)
icons-lucide ───┤
Figma realization (49 lines)
        ↓
packages/figma  →  artifacts/figma-manifest.json  →  local plugin  →  native Figma
```

**Sources read, never restated:** `buttonContract` (axes, values, defaults, slots, template order,
surface hash), `button.css`, `state-layer.css` and `icon.css` (every paint and dimension per cell,
through the cascade), `parseTokens()` (variables and aliases), `iconContract` plus
`@skryensya/icons-lucide` (the Icon set), `component-preview.css` (the stage colour, through its own
cascade), `sheetsForTree()` and `emitMarkup()` (which sheets, and the real markup of each cell).

**Derived, with a test each:** option values and defaults; which options are visual (`type` dropped
because changing it changes no declaration); slot order (`pre, children, post` from the part
template); token aliases per mode; the state layer's opacity per state; the focus ring's width,
offset and corners; the stage background.

**Authored, the Figma realization** (`packages/figma/src/realizations/button.ts`): which signature to
draw, which option splits into sets, which booleans fold into a `state` axis and which pseudo-classes
join it, what is excluded (weld), what each slot holds and its default icon, the grid's axis order,
the stage's hook and label tokens, and two layer names. Each field states why Core cannot say it. A
test proves no option value of the contract appears in it.

**Evaluation context** (recorded in the manifest): density 1, radius multiplier 1, root font size 16px,
frost on, `(any-hover: hover)` holds and no other media condition does, left to right, light mode.

## Button representation

```text
naïve variants, every option:       27,648
naïve variants, visual options:      2,304
actual Figma variants:               1,920  (4 sets × 480)
actual components:                       5  component sets (4 Button + Icon, 55 variants)
```

One set per `appearance`; Figma variants `variant × tone × size × state × iconOnly`, with `state` =
rest, hover, focus, pressed, disabled. `pre` and `post` are boolean properties on exposed Icon
instances; the label is a text property. On Starter, variable modes are unavailable, so tone and
size cannot become modes; on Professional they would, taking a set to about 50 variants.

## Tokens

- **96** tokens reachable from Button; **70** became token variables (30 primitive, 40 semantic),
  plus **164** component variables for hook formulas (`bg/soft/danger/rest`).
- Mode values: **58** aliases, **82** literals, **328** evaluated from formulas.
- **0** unsupported. 26 reachable tokens are consumed inside formulas or composites rather than
  bound (`--scale-space-4` inside `--space-inset-md`, `--elevation-raised` expanded into two
  shadows).
- Diagnostics: `saturate(150%)` in frosted's backdrop filter has no Figma equivalent; frosted and
  tactile gradients are evaluated in light mode and not bound; forced-colors and reduced-motion
  blocks are skipped by the evaluation context.

## Synchronization

Run on a Starter draft (one page, one mode per collection).

| Scenario | Result |
|---|---|
| CREATE | All variables, the Icon set and four Button sets created on one page, each set in its frame |
| NOOP | `0 writes · 3.1s` over 233 variables, 55 icons and 1,920 variants |
| TOKEN UPDATE (`--scale-radius-md` 8 → 12) | Manifest: 2 variables changed, 0 cells. Sync: `3 writes · 4.2s`, every variant NOOP; corners changed through the binding |
| CONTRACT UPDATE (default `size` md → sm, new `xl`) | Manifest: surface hash changed, +120 cells per set, 0 changed. Sync: 120 created per set, 480 NOOP, contract reconciled in place. Follow-up sync: `0 writes · 3.3s` |

A change that affects only part of a variant rewrites only that part: adding the ring's radius
variable rewrote the focus variants' layers alone (96 per set), leaving 384 per set untouched.

Identity was preserved in every update per the plugin's report (existing variants NOOP or updated in
place). It was not independently checked against node ids with the Figma MCP, because no file URL
was available.

## Visual result

The side-by-side check against the docs Button page is **pending**: it needs the file open next
to the docs. From the representation itself:

**Matching by construction:** heights, padding, gap, radius, border, background, foreground, font
family, size, weight and line height, icon sizing per size, the state layer's colour and opacity,
brutalist offsets, tactile depth including hover travel. All come from the same cascade and tokens.

**Acceptable differences:** backdrop blur radius semantics may differ between CSS and Figma;
`saturate()` is dropped; gradients are literal in light mode; the focus ring is a stroked layer, which
is faithful including the transparent offset gap.

**Unsupported:** dark mode is compiled but not written (one mode on Starter); `:active` is not drawn;
hover is reachable in a prototype, focus is drawn but not reachable, since Figma has no keyboard focus.

## Complexity

| | Lines |
|---|---|
| Button-specific (the realization) | 49 |
| Generic compiler (evaluator, cascade, resolver, realizer, build, types) | ~1,950 |
| Plugin (generic; nothing in it names Button) | ~1,700 |
| Tests | 231 (26 cases) |

About 1% of the code is specific to Button.

## Decision

**REVISE.** It works end to end, and nothing about Button is restated. Before trying 2–3 more
components:

1. **The plugin needs automated tests.** Every plugin bug in this POC (dry run binding to missing
   variables, page limits, layer order, hidden slots, frame overlap, a 2px width error) was found by
   hand in Figma. A fake `figma` global running the reconcile in Node would have caught most of them.
2. **The colour evaluator belongs in Core.** `@skryensya/core/parse`'s `evalColor` is alpha-blind by
   design (contrast), so the Figma package carries a second, alpha-aware evaluator. Two evaluators of
   the same CSS will drift.
3. **The cascade simulator is doing real work.** Pseudo-classes, pseudo-elements, media conditions
   and outline realization all live in `packages/figma`. It should either move to Core as the shared
   way to answer "what does this element declare" or be accepted as Figma-only with its limits
   stated per component.
4. **Open slots are unproven.** Button's slots are text and icons. A component whose `children`
   accepts any node (Tile) needs a Figma representation this POC never had to choose.

Cost to keep in view: 1,920 variants take about 200s to create on Starter; with variable modes
(Professional) tone and size would collapse into modes.
