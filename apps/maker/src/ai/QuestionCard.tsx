import { useState } from "react";
import type { AskedQuestion } from "@skryensya/maker-agent";
import { Button } from "@skryensya/react/button";
import { Input } from "@skryensya/react/input";
import { Inline, Stack } from "@skryensya/react/layout";
import { RadioGroup } from "@skryensya/react/radio-group";
import { Text } from "@skryensya/react/typography";

/*
 * THE AI ASKS, IN THE CHAT. A round of questions as a form: each one titled, with its options (one click) and the
 * answer the AI recommends already chosen, so agreeing is "Send answers" or "Use my recommendations". Writing your own
 * answer beats the choice. Once sent it folds into a short record of what was answered.
 */
export function QuestionCard({
  questions,
  answers,
  disabled,
  onSubmit,
}: {
  questions: readonly AskedQuestion[];
  /** Set once the round has been answered: the card then only shows what was said. */
  answers?: readonly string[];
  disabled?: boolean;
  /** `recommended` is true when every answer is the AI's own recommendation, taken as a go-ahead. */
  onSubmit: (answers: string[], recommended: boolean) => void;
}) {
  /* The index of the chosen option per question (the recommended one to begin with), and what was typed instead. */
  const [chosen, setChosen] = useState<number[]>(() => questions.map((q) => Math.max(0, q.options?.indexOf(q.recommended) ?? -1)));
  const [typed, setTyped] = useState<string[]>(() => questions.map((q) => (q.options ? "" : q.recommended)));

  if (answers && answers.length > 0) {
    return (
      <section className="maker-ai__questions" aria-label="Your answers" data-answered="">
        <Text size="sm" weight="emphasis">You answered</Text>
        <ul>
          {questions.map((q, i) => (
            <li key={i}><span className="maker-ai__question-title">{q.title}:</span> {answers[i]}</li>
          ))}
        </ul>
      </section>
    );
  }
  if (answers) return null;

  const answerFor = (i: number): string => {
    const q = questions[i]!;
    const own = typed[i]!.trim();
    if (own) return own;
    return q.options ? q.options[chosen[i]!] ?? q.recommended : q.recommended;
  };

  return (
    <form
      className="maker-ai__questions"
      aria-label="Questions from Maker AI"
      onSubmit={(event) => { event.preventDefault(); onSubmit(questions.map((_, i) => answerFor(i)), false); }}
    >
      <Stack gap="md">
        {questions.map((q, i) => (
          <fieldset key={i} className="maker-ai__question">
            <legend><span className="maker-ai__question-n">Q{i + 1}</span> {q.title}</legend>
            {q.body ? <Text size="sm" tone="secondary">{q.body}</Text> : null}
            {q.options ? (
              <RadioGroup
                name={`question-${i}`}
                label={q.title}
                orientation="vertical"
                value={String(chosen[i])}
                disabled={disabled}
                items={q.options.map((option, n) => ({ value: String(n), label: option === q.recommended ? `${option} (recommended)` : option }))}
                onValueChange={({ value }) => { setChosen((c) => c.map((x, k) => (k === i ? Number(value) : x))); setTyped((t) => t.map((x, k) => (k === i ? "" : x))); }}
              />
            ) : null}
            <Input
              aria-label={q.options ? `${q.title}: your own answer` : `${q.title}: your answer`}
              placeholder={q.options ? "Or answer in your own words" : undefined}
              value={typed[i]}
              disabled={disabled}
              onChange={(event) => { const value = event.currentTarget.value; setTyped((t) => t.map((x, k) => (k === i ? value : x))); }}
            />
          </fieldset>
        ))}
        <Inline gap="sm">
          <Button type="submit" size="sm" disabled={disabled}>Send answers</Button>
          <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => onSubmit(questions.map((q) => q.recommended), true)}>Use my recommendations</Button>
        </Inline>
      </Stack>
    </form>
  );
}
