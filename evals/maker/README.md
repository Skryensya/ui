# The UI bench

Prompts a person would really type, grouped by the component they exercise, scored on what ANY good answer must do.
Built to answer one question over and over: **did that change to the prompt, the tools or the validator make Maker AI better at
building interfaces, or only different?**

## Two layers

| | Needs a model | Run by | Answers |
| --- | --- | --- | --- |
| `ui-cases.test.ts` | no | `pnpm check` | Do the checks themselves work? Each case's `good` tree passes, each `bad` tree fails. |
| `run-ui.ts` | yes (metered) | `pnpm --filter @skryensya/evals maker-ui` | How often does the real agent pass each case? |

Do the first before the second: a check that would pass a wrong page, or fail a right one, makes every live number meaningless.

## Running it

```
OPENAI_API_KEY=… pnpm --filter @skryensya/evals maker-ui                    all cases, 3 attempts each
… maker-ui --family hero,table --n 5                                       only those families
… maker-ui --case pricing-three-plans --lang es                            one case, in Spanish
… maker-ui --proceed                                                       adds "just do it": measures the build, not the questions
… maker-ui --baseline runs/<earlier>.json                                  prints the change against an earlier run
MAKER_AI_PROVIDER=anthropic ANTHROPIC_API_KEY=… MAKER_AI_MODEL=… …        another provider or model
```

Three attempts per case is the minimum: one run cannot tell an improvement from luck. Reports land in `runs/` (ignored by git);
they hold the score, failures, timings and the shape of the page, never the key.

## Reading a report

`PASS` every attempt passed, `FLAKY` some did (the interesting ones: the model can do it and does not always), `FAIL` none did.
Under each case the three most common failures, with how many attempts hit each. `asked N` counts attempts where the agent
asked questions instead of building. `⚠` lines are warnings, never failures: copy that looks like a fact nobody gave
(a price, an email, a percentage), the "never invent" rule measured.

An attempt fails for one of three reasons, and each points at a different fix:

1. **An invariant** of the case (wrong component, buttons not side by side). Prompt or case wording.
2. **Quality** (every page, every case): contract errors and the layout advice (loose content in a Wrapper, stacked buttons, no
   width ceiling). If the model keeps tripping on one, make the validator say it, in `layoutAdvice`, rather than adding prose.
3. **Edit discipline**: a `keeps` line was lost, a `removes` line is still there. The agent regenerated instead of editing.

## The loop

1. Something you did not like in Maker → a one-line reason ("buttons went in a column", "it invented a price").
2. Is there a case that would have caught it? If not, add one to `ui-cases.ts` with its invariants, a `good` tree and the mistake
   as a `bad` tree. `pnpm check` proves the checks first.
3. `maker-ui --case <id> --n 5` for the baseline. Change one thing. Run again with `--baseline`.
4. Keep the change only if the case goes up and nothing else goes down (run the whole set before you keep it).

Real conversations are in `apps/maker/.ai-logs/turns.jsonl` (development only; end-to-end tests write there too, with the model
`mock-model`, so filter by model). A turn the person discarded, or corrected next, is the best source of new cases.

## What a case is not

An exact tree. Two different valid pages must both pass. Invariants say what has to be true (`uses`, `count`, `contains`,
`before`, `option`, `anyOf`); copy is only ever judged by `keeps` / `removes` / `adds` in edit cases and by the invented-fact warning.
